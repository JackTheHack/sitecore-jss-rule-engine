import { createClient, Client } from '@libsql/client';

export interface DatabaseServiceOptions {    
    url?: string;
    syncUrl?: string;
    authToken?: string;
}

export interface IDatabaseService {
    init(): Promise<void>;
    addScheduledTask(
        id: string,
        visitorId: string,
        workflowId: string,
        taskType: string,
        scheduledTime: number,
        payload?: string
    ): Promise<void>;
    updateScheduledTask(
        id: string,
        fields: Partial<{
            visitorId: string;
            workflowId: string;
            taskType: string;
            scheduledTime: number;
            payload: string;
        }>
    ): Promise<void>;
    deleteScheduledTask(id: string): Promise<void>;
    addVisitor(visitorId: string, stateId: string, workflowId: string): Promise<void>;
    getVisitorState(visitorId: string, workflowId: string): Promise<string | null>;
    updateVisitorState(visitorId: string, nextStateId: string, workflowId: string): Promise<void>;
    removeVisitor(visitorId: string, workflowId: string): Promise<void>;
    getStateVisitors(stateId: string, workflowId: string): Promise<string[]>;
}

export class DatabaseService implements IDatabaseService {
    private client: Client;

    constructor(options: DatabaseServiceOptions) {

        if (!options.url) {
            throw new Error('Database URL is required for @libsql/client');
        }

        this.client = createClient({
            url: options.url,
            authToken: options.authToken,
        });
    }

    async init(): Promise<void> {
        console.log("Initializing database...");
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
    }

    async addScheduledTask(
        id: string,
        visitorId: string,
        workflowId: string,
        taskType: string,
        scheduledTime: number,
        payload?: string
    ): Promise<void> {
        await this.client.execute(
            `INSERT INTO workflow_scheduled_tasks (id, visitor_id, workflow_id, task_type, scheduled_time, payload)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [id, visitorId, workflowId, taskType, scheduledTime, payload ?? null]
        );
    }

    async updateScheduledTask(
        id: string,
        fields: Partial<{
            visitorId: string;
            workflowId: string;
            taskType: string;
            scheduledTime: number;
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
}
