import { DatabaseServiceOptions, IDatabaseService } from "./databaseService";
import { IWorkflowService } from "./workflowTypes";

export type ScheduledTaskServiceOptions = {
    db: DatabaseServiceOptions;
    workflowService: IWorkflowService;
    databaseService: IDatabaseService;
}