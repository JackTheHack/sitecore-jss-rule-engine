import { IWorkflowAction } from '../actionFactory';
import { WorkflowExecutionContext, WorkflowActionCommand, WorkflowAction, ChatConversationContext } from '../workflowTypes';
import { VercelAIService, AIOptions } from '../lib/vercelAI';

/* interface AIFields {
    message: string;
    instructions: string;
} */

export class ChatbotAIAction implements IWorkflowAction {
    private aiService: VercelAIService;

    constructor() {
        this.aiService = VercelAIService.getInstance();
    }

    async execute(action: WorkflowAction, context: WorkflowExecutionContext): Promise<void> {        

        const { fields } = action;

        context.ruleEngine?.debugMessage('Running chatbotAiAction');

        if(!context.ruleEngineContext?.sessionContext)
        {
            context.ruleEngine?.debugMessage('Rule engine context is not provided.');
            throw new Error("Rule engine context is not provided.")
        }

        const chatContext = context.ruleEngineContext.sessionContext.get<ChatConversationContext>("chatContext");

        if(!chatContext)
        {
            context.ruleEngine?.debugMessage('Chat context is not provided.');
            throw new Error("Chat context is not provided.")
        }    

        const aiOptions: AIOptions = {
            message: fields["Message"] || chatContext.userInput,
            instructions: fields["AI Context"],
            dontSendMessage: fields["Dont Send Response"]
        };

        context.ruleEngine?.debugMessage('Making AI request .', aiOptions);

        const response = await this.aiService.generateResponse(aiOptions);

        context.ruleEngine?.debugMessage('AI response - .', response);

        chatContext.variables.set("aiResponse", response);
        
        if(aiOptions.dontSendMessage != "1"){
            // Add the AI response as a client command
            const command: WorkflowActionCommand = {
                operation: 'chatbot:ai-response',
                parameters: JSON.stringify({ response })
            };
            context.clientCommands.push(command);
        }        
        
    }
} 