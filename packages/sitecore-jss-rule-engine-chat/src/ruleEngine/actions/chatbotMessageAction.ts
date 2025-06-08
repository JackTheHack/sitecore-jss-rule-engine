import { IWorkflowAction } from '@jss-rule-engine/workflow';
import { WorkflowExecutionContext, WorkflowActionCommand, WorkflowAction } from '@jss-rule-engine/workflow';

export class ChatbotMessageAction implements IWorkflowAction {
    async execute(action: WorkflowAction, context: WorkflowExecutionContext): Promise<void> {
        const { fields } = action;

        const command: WorkflowActionCommand = {
            operation: 'chatbot:message',
            parameters: JSON.stringify({
                message: fields["Template"] || '',
                type: 'text'
            })
        };

        context.clientCommands.push(command);
    }
} 