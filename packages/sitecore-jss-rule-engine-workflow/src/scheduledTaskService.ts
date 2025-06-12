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

        const result = {
            success: true,
            tasksExecuted: {
                succeded: [],
                failed: []
            },
            totalTasks: 0
        } as ScheduledTaskExecutionResult;

        try {
            // Get all scheduled tasks for this workflow
            const scheduledTasks = await this.databaseService.getScheduledTasks();

            result.totalTasks = scheduledTasks.length;

            for (const task of scheduledTasks) {
                const { id, visitorId, workflowId, triggerDate } = task;

                if (!visitorId || !workflowId) {
                    console.warn(`Task ${task.id} has no visitorId, skipping.`);
                    result.tasksExecuted.failed.push(id);
                    continue;
                }

                if (triggerDate > new Date()) {

                    console.log(`Executing task ${id}`);

                    // Execute actions for this visitor in this state if their conditions are met
                    const workflowResult = await this.workflowService.executeTriggers({
                        eventName: 'trigger:schedule',
                        eventParameters: id,
                        visitorId: visitorId,
                        workflowId: workflowId
                    });

                    if (workflowResult.success) {
                        result.tasksExecuted.succeded.push(id);
                        await this.databaseService.deleteScheduledTask(id);
                    } else {
                        result.tasksExecuted.failed.push(id);
                        console.warn(`Task ${task.id} failed to execute for ${task.workflowId} ${task.visitorId} with error - `, workflowResult.error);
                    }                    
                } else {
                    console.log(`Task ${id} is not due yet - skipping.`);
                }
            }

            return result;
        } catch (err) {
            result.success = false;
            result.errorMessage = err;
            return result;
        }
    }
}