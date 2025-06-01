import { generateText } from 'ai';
import { openai } from "@ai-sdk/openai"

export interface AIOptions {
    message: string;
    instructions: string;
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
        try {
            const response = await generateText({
                model: openai('gpt-3.5-turbo'),
                messages: [
                    { role: 'system', content: options.instructions },
                    { role: 'user', content: options.message }
                ]
            });

            return response?.text;
        } catch (error) {
            console.error('Error calling OpenAI API:', error);
            throw new Error('Failed to generate AI response');
        }
    }
} 