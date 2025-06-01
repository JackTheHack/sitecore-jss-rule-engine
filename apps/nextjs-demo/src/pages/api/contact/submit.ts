import { WorkflowService, WorkflowExecutionOptions, WorkflowActionFactory } from '@jss-rule-engine/workflow';
import { WorkflowServiceOptions } from '@jss-rule-engine/workflow/dist/src/workflowTypes';
import { getRuleEngineInstance } from '@jss-rule-engine/core';
import { NextApiRequest, NextApiResponse } from 'next';
import { ErrorResponse, Metadata, SuccessResponse} from '../../../lib/form/types'
import loadWorkflowFromSitecore from 'lib/chat/lib/loadWorkflowFromSitecore';
import { DatabaseService, IDatabaseService } from '@jss-rule-engine/workflow';
import  {getDatabaseServiceOptions}  from '../../../lib/db/dbOptions';

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
        actionFactory: actionFactory 
      }
      
      console.log('Creating workflow service', dbServiceOptions);
      const workflowService = new WorkflowService(workflowOptions);
      
      console.log("Initializing workflow...")
      await workflowService.init();

      const sitecoreEdgeUrl = process.env.EDGE_QL_ENDPOINT || '';

      const workflowConfig = await loadWorkflowFromSitecore(sitecoreEdgeUrl, workflowId);

      const executionOptions : WorkflowExecutionOptions = {
        visitorId: visitorId,
        eventName: "form:onmessage",
        eventParameters: JSON.stringify({ message: message }),
        workflowId: workflowId,
        defaultStateId: workflowConfig.defaultStateId || ''
      }

      await workflowService.load(workflowConfig);

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

    const metadata: Metadata = {
      timestamp: new Date().toISOString(),
    };

    const okResult : SuccessResponse = { success: true, metadata };

    console.log('Returning OK result', okResult);

    return res.status(200).json(okResult);
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: `Method ${req.method} not allowed` });
  }
}