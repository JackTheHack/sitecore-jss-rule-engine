import { createClient, Client } from '@libsql/client';

export interface DatabaseServiceOptions {    
    url?: string;
    syncUrl?: string;
    authToken?: string;
}

export class DatabaseService {
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
        // Ensure the table exists
        await this.client.execute(`
            CREATE TABLE IF NOT EXISTS workflow_visitors (
                visitor_id TEXT NOT NULL,
                state_id TEXT NOT NULL
            )
        `);
    }

    async addVisitor(visitorId: string, stateId: string): Promise<void> {
        await this.client.execute(
            'INSERT INTO workflow_visitors (visitor_id, state_id) VALUES (?, ?)',
            [visitorId, stateId]
        );
    }

    async getVisitorState(visitorId: string): Promise<string | null> {
        const result = await this.client.execute(
            'SELECT state_id FROM workflow_visitors WHERE visitor_id = ?',
            [visitorId]
        );

        return result.rows.length > 0 ? result.rows[0].state_id as string : null;
    }

    async updateVisitorState(visitorId: string, nextStateId: string): Promise<void> {
        await this.client.execute(
            'UPDATE workflow_visitors SET state_id = ? WHERE visitor_id = ?',
            [nextStateId, visitorId]
        );
    }

    async removeVisitor(visitorId: string): Promise<void> {
        await this.client.execute(
            'DELETE FROM workflow_visitors WHERE visitor_id = ?',
            [visitorId]
        );
    }

    async getStateVisitors(stateId: string): Promise<string[]> {
        const result = await this.client.execute(
            'SELECT visitor_id FROM workflow_visitors WHERE state_id = ?',
            [stateId]
        );

        return result.rows.map((row: any) => row.visitor_id);
    }
}
