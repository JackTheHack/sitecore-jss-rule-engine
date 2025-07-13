import { IDatabaseService } from "./databaseService";
import { IWorkflowService } from "./workflowTypes";

export type ScheduledTaskServiceOptions = {
    workflowService: IWorkflowService;
    databaseService: IDatabaseService;
    graphqlEndpoint: string;
    sitecoreApiKey: string;
}

export type ScheduledTaskExecutionResult = {
    success: boolean;
    errorMessage?: string;
    tasksExecuted: {
        succeded: string[],
        failed: string[]
    },
    totalTasks: number;
}