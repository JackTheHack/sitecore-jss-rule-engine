import { IWorkflowAction } from '../actionFactory';
import { WorkflowAction, WorkflowExecutionContext, WorkflowScheduledTaskParams } from '../workflowTypes';
import { v4 as uuidv4 } from 'uuid';

/* interface ScheduleTriggerFields {
    seconds: string;
    triggerName: string;
    triggerParameters?: string;
}
 */
export class WaitAction implements IWorkflowAction {
    async execute(action: WorkflowAction,  context: WorkflowExecutionContext): Promise<void> {
        if (!context.workflowService || !context.visitor) {
            console.warn('Missing required context for schedule trigger action');
            return;
        }

        const { fields } = action;

        const seconds = parseInt(fields["Timeout"] || '0');
        
        if (isNaN(seconds) || seconds <= 0) {
            console.warn('Invalid seconds value for schedule trigger action');
            return;
        }

        const scheduledTime = new Date(Date.now() + (seconds * 1000));
        const taskId = uuidv4();

        console.log('Scheduling task for ', scheduledTime)

        const params: WorkflowScheduledTaskParams = {
            taskId,
            visitorId: context.visitor.id,
            workflowId: context.workflow.id,
            triggerType: 'trigger:schedule',
            scheduledTime,
            triggerParameters: JSON.stringify({
                triggerName: fields.triggerName,
                triggerParameters: fields.triggerParameters || ''
            })
        };

        await context.workflowService.addScheduledTask(params);
    }
} 