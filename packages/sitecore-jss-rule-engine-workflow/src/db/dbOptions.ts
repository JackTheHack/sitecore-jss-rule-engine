import { DatabaseServiceOptions } from "../databaseService";

export function getDatabaseServiceOptions(env?:any): DatabaseServiceOptions {

    if (!env) {
        env = process.env;
    }

    return {
        authToken: process.env.SQLITE_AUTHTOKEN || null,
        url: process.env.SQLITE_URL || null,
        syncUrl: process.env.SQLITE_SYNCURL || null
    } as DatabaseServiceOptions
};