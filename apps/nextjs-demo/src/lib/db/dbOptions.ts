import { DatabaseServiceOptions } from "@jss-rule-engine/workflow/dist/src/databaseService";

export default {
    authToken: process.env.SQLITE_AUTHTOKEN || null,
    url: process.env.SQLITE_URL || null,
    syncUrl: process.env.SQLITE_SYNCURL || null
} as DatabaseServiceOptions;