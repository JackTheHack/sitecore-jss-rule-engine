import { IWorkflowAction } from '../actionFactory';
import { WorkflowExecutionContext, WorkflowActionCommand } from '../workflowTypes';
import { VercelAIService, AIOptions } from '../lib/vercelAI';

interface AIFields {
    message: string;
    instructions: string;
}

export class ChatbotAIAction implements IWorkflowAction {
    private aiService: VercelAIService;

    constructor() {
        this.aiService = VercelAIService.getInstance();
    }

    async execute(context: WorkflowExecutionContext): Promise<void> {
        const { fields } = context.workflow.states[context.workflow.defaultStateId || ''].actions.find(
            action => action.templateId === 'ai-action'
        ) || { fields: {} as AIFields };

        const aiOptions: AIOptions = {
            message: fields.message || '',
            instructions: fields.instructions || ''
        };

        const response = await this.aiService.generateResponse(aiOptions);
        
        // Add the AI response as a client command
        const command: WorkflowActionCommand = {
            operation: 'chatbot:ai-response',
            parameters: JSON.stringify({ response })
        };
        
        context.clientCommands.push(command);
    }
} 