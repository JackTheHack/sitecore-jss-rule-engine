import { ChatConversationContext, IWorkflowAction, WorkflowAction } from '@jss-rule-engine/workflow';
import { WorkflowExecutionContext } from '@jss-rule-engine/workflow';
import { cleanId } from '../../lib/helper';


export class RAGSearchAction implements IWorkflowAction {

    constructor() {

    }

    async execute(action: WorkflowAction, context: WorkflowExecutionContext): Promise<void> {
        const { fields } = action;

        console.log('Running RAGSearchAction', fields);

        const chatContext = context.ruleEngineContext?.sessionContext?.get<ChatConversationContext>("chatContext");

        if(!chatContext)
        {
            context.ruleEngine?.debugMessage('Chat context is not provided.');
            throw new Error("Chat context is not provided.")
        }    

        const message = chatContext.userInput
    
        const indexId = fields["RAG Index"] || '';

        // Clean GUID from braces and hyphens
        let cleanedIndexId = cleanId(indexId);

        const thresold = Number(fields["Thresold"]) || 1;
        const topN = Number(fields["TopN"]) || 5;

        let results;
        try {
            console.log('RAG search for - ', message, topN, thresold, cleanedIndexId);
            results = await context.workflowService?.findRelevantEmbeddings(message, cleanedIndexId, topN, thresold);

            // Convert embeddings (results) to JSON and concatenate
            let aiRagContent = '';
            if (Array.isArray(results)) {
                aiRagContent = results.map(r => JSON.stringify(r)).join('\n\n');
            } else if (results) {
                aiRagContent = JSON.stringify(results);
            }
            

            console.log('Results - ', results);

            chatContext.variables.set("aiRagContent", aiRagContent);
            chatContext.variables.set("aiRagResults", results);

        } catch (err) {
            console.error("Error searching RAG table with findRelevantEmbeddings:", err);
            throw err;
        }
    }
} 