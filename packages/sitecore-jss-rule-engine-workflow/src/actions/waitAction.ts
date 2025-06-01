import { IWorkflowAction } from '../actionFactory';
import { WorkflowExecutionContext } from '../workflowTypes';
import { v4 as uuidv4 } from 'uuid';

interface ScheduleTriggerFields {
    seconds: string;
    triggerName: string;
    triggerParameters?: string;
}

export class WaitAction implements IWorkflowAction {
    async execute(context: WorkflowExecutionContext): Promise<void> {
        if (!context.workflowService || !context.visitor) {
            console.warn('Missing required context for schedule trigger action');
            return;
        }

        const { fields } = context.workflow.states[context.workflow.defaultStateId || ''].actions.find(
            action => action.templateId === 'schedule-trigger-action'
        ) || { fields: {} as ScheduleTriggerFields };

        const seconds = parseInt(fields.seconds || '0');
        
        if (isNaN(seconds) || seconds <= 0) {
            console.warn('Invalid seconds value for schedule trigger action');
            return;
        }

        const scheduledTime = Date.now() + (seconds * 1000);
        const taskId = uuidv4();

        await context.workflowService.addScheduledTask(
            taskId,
            context.visitor.id,
            context.workflow.id,
            'trigger:schedule',
            scheduledTime,
            JSON.stringify({
                triggerName: fields.triggerName,
                triggerParameters: fields.triggerParameters || ''
            })
        );
    }
} 