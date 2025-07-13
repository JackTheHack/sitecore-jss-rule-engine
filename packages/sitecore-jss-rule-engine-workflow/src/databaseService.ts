import { createClient, Client } from '@libsql/client';
import { WorkflowScheduledTask } from './workflowTypes';
import { generateEmbeddings } from './lib/helper';

export interface DatabaseServiceOptions {    
    url?: string;
    syncUrl?: string;
    authToken?: string;
}

export interface AddScheduledTaskParams {
    id: string;
    visitorId: string;
    workflowId: string;
    taskType: string;
    scheduledTime: Date;
    payload?: string;
}

export interface RAGItem{
    id: string;
    name: string;
    path: string;
    parentId: string;
    indexId: string;
    content: string;
    distance?: Number;
}

export interface IDatabaseService {
    init(): Promise<void>;
    //TASKS:
    getScheduledTasks(): Promise<Array<WorkflowScheduledTask>>;
    addScheduledTask(params: AddScheduledTaskParams): Promise<void>;
    updateScheduledTask(
        id: string,
        fields: Partial<{
            visitorId: string;
            workflowId: string;
            taskType: string;
            scheduledTime: Date;
            payload: string;
        }>
    ): Promise<void>;
    deleteScheduledTask(id: string): Promise<void>;
    //STATES:
    addVisitor(visitorId: string, stateId: string, workflowId: string): Promise<void>;
    getVisitorState(visitorId: string, workflowId: string): Promise<string | null>;
    updateVisitorState(visitorId: string, nextStateId: string, workflowId: string): Promise<void>;
    removeVisitor(visitorId: string, workflowId: string): Promise<void>;
    getStateVisitors(stateId: string, workflowId: string): Promise<string[]>;
    //RAG:
    addEmbedding(item: RAGItem): Promise<void>;
    findRelevantEmbeddings(data: string, indexId: string, topN: number, thresold: number): Promise<RAGItem[]>;
    getEmbeddingsByParentId(parentId: string, indexId: string): Promise<any>;
    removeEmbedding(id: string, indexId: string): Promise<void>;
    //ETC:
    debugPrintTables(): Promise<void> 
    cleanDb(): Promise<void>;
    dispose() : Promise<void>;
}

export class DatabaseService implements IDatabaseService {
    private client: Client;

    constructor(options: DatabaseServiceOptions) {

        if (!options.url) {
            throw new Error('Database URL is required for @libsql/client');
        }

        this.client = createClient({
            fetch: fetch,
            url: options.url,
            authToken: options.authToken,
        });
    }

    

    async addEmbedding(item: RAGItem): Promise<void> {
        try {

            if(!item?.content?.trim()?.length)
            {
                //nothing to index
                return;
            }

            const model = await generateEmbeddings(item.content);
            console.log('Generated embedding.')
            
            const args = [
                item.id || '', 
                item.name || '', 
                item.path || '', 
                item.parentId || '', 
                item.content, 
                new Float32Array(model.embedding.embedding).buffer as ArrayBuffer, 
                item.indexId || ''
            ];
                        
            const sqlResponse = await this.client.execute({
                sql: 'INSERT OR REPLACE INTO rag_embeddings (id, name, path, parent_id, content, embedding, index_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
                args: args
            });
            console.log('Added to db - ', sqlResponse);
        } catch (error) {
            console.error('Failed to generate embeddings for item', item.id, ':', error);            
        }
    }

    async findRelevantEmbeddings(data: string, indexId: string, topN: number, thresold: number): Promise<RAGItem[]> {
        try {
            const model = await generateEmbeddings(data);
            console.log('Searching RAG content in DB');
            const result = await this.client.execute({
                sql: `SELECT *, vector_distance_cos(embedding, ?) as distance 
                    FROM rag_embeddings 
                    WHERE index_id = ? AND distance < ? AND embedding IS NOT NULL
                    ORDER BY distance ASC LIMIT ?`,
                args: [new Float32Array(model.embedding.embedding).buffer as ArrayBuffer, indexId, thresold, topN]
            });
            const resultArr = result.rows.map((row: any) => ({
                id: row.id,
                name: row.name,
                path: row.path,
                parentId: row.parent_id,
                content: row.content,
                embedding: row.embedding,
                indexId: row.index_id,
                distance: row.distance
            } as RAGItem));
            console.log('Found relevant embeddings - ', resultArr?.length);
            return resultArr;
        } catch (error) {
            console.error('Failed to find relevant embeddings:', error);            
            return [];
        }
    }

    async getEmbeddingsByParentId(parentId: string, indexId: string): Promise<any> {
        const result = await this.client.execute({
            sql: 'SELECT * FROM rag_embeddings WHERE parent_id = ? AND index_id = ?',
            args: [parentId, indexId]
        });
        return result.rows;
    }
    
    async removeEmbedding(id: string, indexId: string): Promise<void> {
        await this.client.execute({
            sql: 'DELETE FROM rag_embeddings WHERE id = ? AND index_id = ?',
            args: [id, indexId]
        });
    }

    async cleanDb(): Promise<void> {
        // Delete all rows from both tables
        await this.client.execute('DELETE FROM workflow_visitors');
        await this.client.execute('DELETE FROM workflow_scheduled_tasks');
        await this.client.execute('DELETE FROM rag_embeddings');
    }

    async getScheduledTasks(): Promise<Array<WorkflowScheduledTask>> {
        const result = await this.client.execute(
            'SELECT * FROM workflow_scheduled_tasks'            
        );
        return result.rows.map((row: any) => ({
            id: row.id,
            visitorId: row.visitor_id,
            workflowId: row.workflow_id,
            taskType: row.task_type,
            scheduledTime: row.scheduled_time,
            payload: row.payload ?? undefined
        }));
    }

    async init(): Promise<void> {
        // Ensure the table exists
        await this.client.execute(`
            CREATE TABLE IF NOT EXISTS workflow_visitors (
                visitor_id TEXT NOT NULL,
                state_id TEXT NOT NULL,
                workflow_id TEXT NOT NULL
            )
        `);

        await this.client.execute(`
            CREATE TABLE IF NOT EXISTS workflow_scheduled_tasks (
            id TEXT PRIMARY KEY,
            visitor_id TEXT NOT NULL,
            workflow_id TEXT NOT NULL,
            task_type TEXT NOT NULL,
            scheduled_time INTEGER NOT NULL,
            payload TEXT
            )
        `);      
        
        await this.client.execute(`
            CREATE TABLE IF NOT EXISTS rag_embeddings (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                path TEXT NOT NULL,
                parent_id TEXT NOT NULL,
                content TEXT NOT NULL,
                embedding F32_BLOB(768),
                index_id TEXT NOT NULL
            );`);

        await this.client.execute(`                        
            CREATE INDEX IF NOT EXISTS idx_rag_embeddings 
            ON rag_embeddings (libsql_vector_idx(embedding));`);
    }

    async addScheduledTask(params: AddScheduledTaskParams): Promise<void> {
        await this.client.execute(
            `INSERT INTO workflow_scheduled_tasks (id, visitor_id, workflow_id, task_type, scheduled_time, payload)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [params.id, params.visitorId, params.workflowId, params.taskType, params.scheduledTime, params.payload ?? null]
        );
    }

    async updateScheduledTask(
        id: string,
        fields: Partial<{
            visitorId: string;
            workflowId: string;
            taskType: string;
            scheduledTime: Date;
            payload: string;
        }>
    ): Promise<void> {
        const updates: string[] = [];
        const values: any[] = [];

        if (fields.visitorId !== undefined) {
            updates.push('visitor_id = ?');
            values.push(fields.visitorId);
        }
        if (fields.workflowId !== undefined) {
            updates.push('workflow_id = ?');
            values.push(fields.workflowId);
        }
        if (fields.taskType !== undefined) {
            updates.push('task_type = ?');
            values.push(fields.taskType);
        }
        if (fields.scheduledTime !== undefined) {
            updates.push('scheduled_time = ?');
            values.push(fields.scheduledTime);
        }
        if (fields.payload !== undefined) {
            updates.push('payload = ?');
            values.push(fields.payload);
        }

        if (updates.length === 0) {
            return;
        }

        values.push(id);

        await this.client.execute(
            `UPDATE workflow_scheduled_tasks SET ${updates.join(', ')} WHERE id = ?`,
            values
        );
    }

    async deleteScheduledTask(id: string): Promise<void> {
        await this.client.execute(
            'DELETE FROM workflow_scheduled_tasks WHERE id = ?',
            [id]
        );
    }

    async addVisitor(visitorId: string, stateId: string, workflowId: string): Promise<void> {
        await this.client.execute(
            'INSERT INTO workflow_visitors (visitor_id, state_id, workflow_id) VALUES (?, ?, ?)',
            [visitorId, stateId, workflowId]
        );
    }

    async getVisitorState(visitorId: string, workflowId: string): Promise<string | null> {
        const result = await this.client.execute(
            'SELECT state_id FROM workflow_visitors WHERE visitor_id = ? AND workflow_id = ?',
            [visitorId, workflowId]
        );

        return result.rows.length > 0 ? result.rows[0].state_id as string : null;
    }

    async updateVisitorState(visitorId: string, nextStateId: string, workflowId: string): Promise<void> {
        console.log(`Changing visitor ${visitorId} state ${nextStateId} for workflow ${workflowId}`);
        await this.client.execute(
            'UPDATE workflow_visitors SET state_id = ? WHERE visitor_id = ? AND workflow_id = ?',
            [nextStateId, visitorId, workflowId]
        );
    }

    async removeVisitor(visitorId: string, workflowId: string): Promise<void> {
        await this.client.execute(
            'DELETE FROM workflow_visitors WHERE visitor_id = ? AND workflow_id = ?',
            [visitorId, workflowId]
        );
    }

    async getStateVisitors(stateId: string, workflowId: string): Promise<string[]> {
        const result = await this.client.execute(
            'SELECT visitor_id FROM workflow_visitors WHERE state_id = ? AND workflow_id = ?',
            [stateId, workflowId]
        );

        return result.rows.map((row: any) => row.visitor_id);
    }

    async debugPrintTables(): Promise<void> {
        const visitors = await this.client.execute('SELECT * FROM workflow_visitors');
        console.log('workflow_visitors:', visitors.rows);

        const tasks = await this.client.execute('SELECT * FROM workflow_scheduled_tasks');
        console.log('workflow_scheduled_tasks:', tasks.rows);
    }

    async dispose(): Promise<void> {
        await this.client.close();
    }
}
