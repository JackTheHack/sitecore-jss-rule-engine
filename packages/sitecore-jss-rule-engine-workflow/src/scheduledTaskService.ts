import { IDatabaseService } from "./databaseService";
import { ScheduledTaskServiceOptions } from "./scheduledTaskServiceTypes";
import { IWorkflowService } from "./workflowTypes";

export interface IScheduledTaskService {
    executeTasks(workflowId: string): Promise<void>;
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

    async executeTasks(workflowId: string): Promise<void> {
            const workflow = this.workflowService.getWorkflow(workflowId);

            if (!workflow) {
                throw new Error('Workflow not found');
            }
    
            // Get all scheduled tasks for this workflow
            const scheduledTasks = await this.databaseService.getScheduledTasks(workflowId);
    
            for (const task of scheduledTasks) {
                const { visitorId } = task;
    
                if (!visitorId) {
                    console.warn(`Task ${task.id} has no visitorId, skipping.`);
                    continue;
                }
    
                // Execute actions for this visitor in this state if their conditions are met
                await this.workflowService.executeTriggers({
                    eventName: 'trigger:schedule',
                    eventParameters: task.id,
                    visitorId: task.visitorId,
                    workflowId: task.workflowId                
                });
            }
        }
}