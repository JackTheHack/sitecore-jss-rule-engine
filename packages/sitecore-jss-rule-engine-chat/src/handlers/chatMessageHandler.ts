import { getRuleEngineInstance, GraphQLItemProvider, JssRuleEngine, RuleEngineSessionContext } from "@jss-rule-engine/core";
import { registerWorkflowRuleEngine, ChatConversationContext, WorkflowActionFactory, registerWorkflowActions, DatabaseService, WorkflowServiceOptions, WorkflowService, loadWorkflowFromSitecore, WorkflowExecutionOptions, getDatabaseServiceOptions } from "@jss-rule-engine/workflow";
import { Action, Metadata } from "../client/types";
import { registerChatActions } from "../registerChatActions";
import { registerChatRuleEngine } from "../registerChatRuleEngine";

export async function handleChatMessage({
    message,
    visitorId,
    workflowId,
    registerRuleEngine,
    registerActionFactory
}: {
    message: string;
    visitorId: string;
    workflowId: string;
    registerRuleEngine?: (ruleEngine: JssRuleEngine) => void;
    registerActionFactory?: (actionFactory: WorkflowActionFactory) => void;
}) {

    try {
        const sitecoreEdgeUrl = process.env.EDGE_QL_ENDPOINT || '';
        const sitecoreApiKey = process.env.SITECORE_API_KEY || '';

        const actions: Action[] = [];

        console.log('Handling message', message, visitorId, workflowId);

        const ruleEngine = getRuleEngineInstance();
        ruleEngine.setSitecoreContext({
            itemProvider: new GraphQLItemProvider({
                apiKey: sitecoreApiKey,
                graphEndpoint: sitecoreEdgeUrl
            })
        });

        registerWorkflowRuleEngine(ruleEngine);
        registerChatRuleEngine(ruleEngine);
        if (registerRuleEngine) {
            registerRuleEngine(ruleEngine);
        }


        const ruleEngineContext = ruleEngine.getRuleEngineContext();
        const chatContext = {
            ruleEngine: ruleEngine,
            userInput: message,
            variables: new RuleEngineSessionContext()
        } as ChatConversationContext;

        ruleEngineContext?.sessionContext?.set('chatContext', chatContext);

        ruleEngine.debug = true;

        console.log(`Rule engine: (commands - ${ruleEngine.commandDefinitions?.size}) `);

        const actionFactory = new WorkflowActionFactory();
        registerWorkflowActions(actionFactory);
        registerChatActions(actionFactory);
        if (registerActionFactory) {
            registerActionFactory(actionFactory);
        }

        const dbServiceOptions = getDatabaseServiceOptions();
        const dbService = new DatabaseService(dbServiceOptions);

        const workflowOptions: WorkflowServiceOptions = {
            databaseService: dbService,
            ruleEngine: ruleEngine,
            ruleEngineContext: ruleEngineContext,
            actionFactory: actionFactory,
            graphqlEndpoint: sitecoreEdgeUrl,
            apiKey: sitecoreApiKey
        };

        console.log('Creating workflow service', dbServiceOptions);
        const workflowService = new WorkflowService(workflowOptions);

        console.log("Initializing workflow...");
        await workflowService.init();

        console.log("Loading workflow...");

        const workflowConfig = await loadWorkflowFromSitecore(sitecoreEdgeUrl, sitecoreApiKey, workflowId, workflowService);

        console.log('Workflow loaded.');

        const executionOptions: WorkflowExecutionOptions = {
            visitorId: visitorId,
            eventName: "chat:message",
            eventParameters: JSON.stringify({ message: message }),
            workflowId: workflowId,
            defaultStateId: workflowConfig.defaultStateId || ''
        };

        console.log('Executing triggers', executionOptions);

        const workflowResult = await workflowService.executeTriggers(executionOptions);

        if (!workflowResult.success) {
            console.log('Failed to execute workflow triggers', workflowResult.error);
            return {
                success: false,
                errorCode: 500,
                errorMessage: 'Failed to execute workflow triggers'
            };
        }

        if (workflowResult.clientCommands && workflowResult.clientCommands.length > 0) {
            for (const command of workflowResult.clientCommands) {
                const action: Action = {
                    type: command.operation,
                    content: command.parameters
                };
                actions.push(action);
            }
        }

        const metadata: Metadata = {
            timestamp: new Date().toISOString(),
            messageLength: message.length,
            visitorId: workflowResult?.visitorId,
            newStateId: workflowResult?.newStateId,
            prevStateId: workflowResult?.prevStateId,
            triggerName: executionOptions.eventName
        };

        return {
            success: true,
            actions,
            metadata
        };
    }
    catch (err) {
        return {
            success: false,
            errorCode: 500,
            errorMessage: err?.toString() || 'Something bad happened.'
        }
    }
}