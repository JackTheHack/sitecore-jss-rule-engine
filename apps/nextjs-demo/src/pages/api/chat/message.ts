import { WorkflowService, WorkflowExecutionOptions, WorkflowActionFactory } from '@jss-rule-engine/workflow';
import { WorkflowServiceOptions } from '@jss-rule-engine/workflow/dist/src/workflowTypes';
import { JssRuleEngine, getRuleEngineInstance } from '@jss-rule-engine/core';
import { NextApiRequest, NextApiResponse } from 'next';
import {Action, ErrorResponse, Metadata, SuccessResponse} from '../../../lib/chat/types'
import loadWorkflow from 'lib/chat/lib/loadWorkflow';
import { DatabaseService, IDatabaseService } from '@jss-rule-engine/workflow';
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

    try {

      console.log('Handling message', message, visitorId, workflowId);

      const ruleEngine = getRuleEngineInstance();

      console.log('Rule engine: ', ruleEngine?.requestContext, ruleEngine?.sitecoreContext, ruleEngine.commandDefinitions?.size);

      const actionFactory = new WorkflowActionFactory();      

      const dbServiceOptions = getDatabaseServiceOptions();
      const dbService = new DatabaseService(dbServiceOptions);

      const workflowOptions: WorkflowServiceOptions = {
        databaseService: dbService,
        ruleEngine: ruleEngine,
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

      const workflowConfig = await loadWorkflow(sitecoreEdgeUrl, workflowId);

      const executionOptions : WorkflowExecutionOptions = {
        visitorId: visitorId,
        eventName: "event:onmessage",
        eventParameters: JSON.stringify({ message: message }),
        workflowId: workflowId,
        defaultStateId: workflowConfig.defaultStateId || ''
      }

      console.log('Executing triggers', executionOptions);

      const workflowResult = await workflowService.executeTriggers(executionOptions);

      if (!workflowResult.success) {
        console.log('Failed to execute workflow triggers');
        return res.status(500).json({ success: false, error: 'Failed to execute workflow triggers' });
      }
    } catch (error) {
      console.log('Something weird happened - ', error);
      return res.status(500).json({ success: false, error: 'Failed to execute workflow triggers' });
    }

    // Example logic to process the message and generate actions/metadata
    const actions: Action[] = [
      { type: 'reply', content: `You said: ${message}` },
      { type: 'suggestion', content: 'Would you like to learn more?' },
    ];

    const metadata: Metadata = {
      timestamp: new Date().toISOString(),
      messageLength: message.length,
    };

    const okResult : SuccessResponse = { success: true, actions, metadata };

    console.log('Returning OK result', okResult);

    return res.status(200).json(okResult);
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: `Method ${req.method} not allowed` });
  }
}