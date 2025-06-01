import { IWorkflowAction } from '../actionFactory';
import { WorkflowExecutionContext, WorkflowActionCommand } from '../workflowTypes';

interface ChatbotMessageFields {
    message: string;
    type?: string;
}

export class ChatbotMessageAction implements IWorkflowAction {
    async execute(context: WorkflowExecutionContext): Promise<void> {
        const { fields } = context.workflow.states[context.workflow.defaultStateId || ''].actions.find(
            action => action.templateId === 'chatbot-message-action'
        ) || { fields: {} as ChatbotMessageFields };

        const command: WorkflowActionCommand = {
            operation: 'chatbot:message',
            parameters: JSON.stringify({
                message: fields.message || '',
                type: fields.type || 'text'
            })
        };

        context.clientCommands.push(command);
    }
} 