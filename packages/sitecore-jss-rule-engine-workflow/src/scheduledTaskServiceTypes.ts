import { IDatabaseService } from "./databaseService";
import { IWorkflowService } from "./workflowTypes";

export type ScheduledTaskServiceOptions = {
    workflowService: IWorkflowService;
    databaseService: IDatabaseService;
}

export type ScheduledTaskExecutionResult = {
    success: boolean;
}