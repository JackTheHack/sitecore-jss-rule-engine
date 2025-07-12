import { CoreMessage, generateText, tool } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { DatabaseService } from '@jss-rule-engine/workflow';

export interface AITool {
    name: string;
    description: string;
    thresold: number;
    topN: number;
    indexId: string;
}

export interface AIOptions {
    message: string;
    instructions?: string;
    dontSendMessage? :string;
    tools?: AITool[];
    dbService?: DatabaseService;
}

export class VercelAIService {
    private static instance: VercelAIService;

    

    private constructor() {
        
    }

    public static getInstance(): VercelAIService {
        if (!VercelAIService.instance) {
            VercelAIService.instance = new VercelAIService();
        }
        return VercelAIService.instance;
    }

    async ragTool(options: AIOptions, prompt: string, indexId: string, topN: number, thresold: number): Promise<string>{
        const results = await options.dbService?.findRelevantEmbeddings(prompt, indexId, topN, thresold);
        const kbContent = results && Array.isArray(results)
          ? results.map(item => item.content).join('\n\n')
          : '';
        const summaryMessages : Array<CoreMessage> = [{
          role: "system", 
          content: `Answer the user promprty based on the content from knowledge base provided below as precise as possible. 
          If there is no relevant content to the query tell that you don't know the answer.

          Knowledge Base:
          ${kbContent}`
        }, {
            role: "user", content: prompt
        }];

        const aiSummaryOptions = {
          model: google('gemini-1.5-pro-latest'),
          messages: summaryMessages
        };
        const kbAnswer = await generateText(aiSummaryOptions);
        return kbAnswer?.text;
    }

    async generateResponse(options: AIOptions): Promise<string> {

        const messages : Array<CoreMessage> = []

        if(options.instructions)
        {
            messages.push({ role: 'system', content: options.instructions });
        }

        messages.push({ role: 'user', content: options.message });

        try {          
            
            const aiOptions = {
                model: google('gemini-1.5-pro-latest'),
                messages: messages,      
                dbService: options.dbService    
            };

            if(options.tools){
                // Add a 'tools' property to aiOptions if it doesn't exist
                (aiOptions as any).tools = {};
                options.tools.forEach(x => {

                    const thresold = x.thresold;
                          const topN = x.topN;
                          const indexId = x.indexId; 

                    (aiOptions as any).tools[x.name] = tool({
                        description: x.description,
                        parameters: z.object({
                          prompt: z.string().describe('RAG search prompt.'),
                          thresold: z.number().describe('RAG search thresold').default(thresold),
                          topN: z.number().describe('RAG Top N results').default(topN),
                          indexId: z.string().describe('RAG Index Id').default(indexId)
                        }),
                        execute: async ({prompt, thresold, topN, indexId }) => {
                          return await this.ragTool(options, prompt, indexId, topN, thresold);
                          }
                        },
                      ); 
                });
            }
            
            const response = await generateText(aiOptions);

            return response?.text;
        } catch (error) {
            console.error('Error calling AI API:', error);
            throw new Error('Failed to generate AI response');
        }
    }
} 