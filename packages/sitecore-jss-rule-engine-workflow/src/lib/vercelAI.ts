import { CoreMessage, generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';

export interface AIOptions {
    message: string;
    instructions?: string;
    dontSendMessage? :string;
}

export class VercelAIService {
    private static instance: VercelAIService;

    private constructor() {}

    public static getInstance(): VercelAIService {
        if (!VercelAIService.instance) {
            VercelAIService.instance = new VercelAIService();
        }
        return VercelAIService.instance;
    }

    async generateResponse(options: AIOptions): Promise<string> {

        const messages : Array<CoreMessage> = [            
            { role: 'user', content: options.message }
        ]

        if(options.instructions)
        {
            messages.push({ role: 'system', content: options.instructions });
        }

        try {            
            const response = await generateText({
                model: anthropic('claude-3-5-sonnet-20241022'),
                messages: messages 
            });

            return response?.text;
        } catch (error) {
            console.error('Error calling AI API:', error);
            throw new Error('Failed to generate AI response');
        }
    }
} 