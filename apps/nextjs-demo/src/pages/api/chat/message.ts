import { WorkflowService, WorkflowExecutionOptions, WorkflowActionFactory, registerWorkflowRuleEngine, registerWorkflowActions } from '@jss-rule-engine/workflow';
import { WorkflowServiceOptions } from '@jss-rule-engine/workflow';
import { JssRuleEngine, RuleEngineSessionContext, getRuleEngineInstance } from '@jss-rule-engine/core';
import { NextApiRequest, NextApiResponse } from 'next';
import {Action, ErrorResponse, Metadata, SuccessResponse} from '@jss-rule-engine/chat'
import { registerChatActions, registerChatRuleEngine } from '@jss-rule-engine/chat';
import {loadWorkflowFromSitecore} from '@jss-rule-engine/workflow'
import { DatabaseService, ChatConversationContext} from '@jss-rule-engine/workflow';
import  { getDatabaseServiceOptions}  from '../../../lib/db/dbOptions';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SuccessResponse | ErrorResponse>
) {
  if (req.method === 'POST') {
    const { message, visitorId, workflowId } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, error: 'Message is required and must be a string' });
    }

    
    // Example logic to process the message and generate actions/metadata
    const actions: Action[] = [];

    try {      

      console.log('Handling message', message, visitorId, workflowId);

      const ruleEngine = getRuleEngineInstance();
      registerWorkflowRuleEngine(ruleEngine);      
      registerChatRuleEngine(ruleEngine);

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

      const dbServiceOptions = getDatabaseServiceOptions();
      const dbService = new DatabaseService(dbServiceOptions);

      const workflowOptions: WorkflowServiceOptions = {
        databaseService: dbService,
        ruleEngine: ruleEngine,
        ruleEngineContext: ruleEngineContext,
        actionFactory: actionFactory,
        graphqlEndpoint: "/",
        apiKey: "/"
      }
      
      console.log('Creating workflow service', dbServiceOptions);
      const workflowService = new WorkflowService(workflowOptions);
      
      console.log("Initializing workflow...")
      await workflowService.init();

      console.log("Loading workflow...")

      const sitecoreEdgeUrl = process.env.EDGE_QL_ENDPOINT || '';

      const workflowConfig = await loadWorkflowFromSitecore(sitecoreEdgeUrl, workflowId, workflowService);

      console.log('Workflow loaded.');

      const executionOptions : WorkflowExecutionOptions = {
        visitorId: visitorId,
        eventName: "chat:message",
        eventParameters: JSON.stringify({ message: message }),
        workflowId: workflowId,
        defaultStateId: workflowConfig.defaultStateId || ''        
      }

      console.log('Executing triggers', executionOptions);

      const workflowResult = await workflowService.executeTriggers(executionOptions);
      
      if (!workflowResult.success) {
        console.log('Failed to execute workflow triggers', workflowResult.error);
        return res.status(500).json({ success: false, error: 'Failed to execute workflow triggers' });
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

      const okResult : SuccessResponse = { success: true, actions, metadata };

      console.log('Returning OK result', okResult);

      return res.status(200).json(okResult);

      
    } catch (error) {
      console.log('Something weird happened - ', error);
      return res.status(500).json({ success: false, error: 'Failed to execute workflow triggers' });
    }

  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: `Method ${req.method} not allowed` });
  }
}