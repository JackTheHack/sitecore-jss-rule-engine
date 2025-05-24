import { IDatabaseService } from "./databaseService";
import { ScheduledTaskExecutionResult, ScheduledTaskServiceOptions } from "./scheduledTaskServiceTypes";
import { IWorkflowService } from "./workflowTypes";

export interface IScheduledTaskService {
    executeTasks(workflowId: string): Promise<ScheduledTaskExecutionResult>;
}

export class ScheduledTaskService implements IScheduledTaskService {

    private databaseService: IDatabaseService;
    options: ScheduledTaskServiceOptions;
    workflowService: IWorkflowService;

    constructor(options: ScheduledTaskServiceOptions) {
            this.options = options;
            this.workflowService = options.workflowService;
            this.databaseService = options.databaseService;
    }

    async executeTasks(): Promise<ScheduledTaskExecutionResult> {
            // Get all scheduled tasks for this workflow
            const scheduledTasks = await this.databaseService.getScheduledTasks();
    
            for (const task of scheduledTasks) {
                const { id, visitorId, workflowId } = task;
    
                if (!visitorId || !workflowId) {
                    console.warn(`Task ${task.id} has no visitorId, skipping.`);
                    continue;
                }
    
                // Execute actions for this visitor in this state if their conditions are met
                await this.workflowService.executeTriggers({
                    eventName: 'trigger:schedule',
                    eventParameters: id,
                    visitorId: visitorId,
                    workflowId: workflowId                
                });
            }

            return { success: true }
        }
}