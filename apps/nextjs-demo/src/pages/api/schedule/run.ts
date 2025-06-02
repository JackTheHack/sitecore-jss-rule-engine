import { WorkflowService, WorkflowActionFactory, ScheduledTaskService } from '@jss-rule-engine/workflow';
import { WorkflowServiceOptions } from '@jss-rule-engine/workflow';
import { getRuleEngineInstance } from '@jss-rule-engine/core';
import { NextApiRequest, NextApiResponse } from 'next';
import { ErrorResponse, Metadata, SuccessResponse} from '../../../lib/form/types'
import { DatabaseService, ScheduledTaskServiceOptions } from '@jss-rule-engine/workflow';
import  {getDatabaseServiceOptions}  from '../../../lib/db/dbOptions';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SuccessResponse | ErrorResponse>
) {
  if (req.method === 'POST') {
    const {  } = req.body;

    try {

      const ruleEngine = getRuleEngineInstance();

      console.log('Rule engine: ', ruleEngine?.requestContext, ruleEngine?.sitecoreContext, ruleEngine.commandDefinitions?.size);

     const dbServiceOptions = getDatabaseServiceOptions();

      const dbService = new DatabaseService(dbServiceOptions);
      
      const actionFactory = new WorkflowActionFactory();

      const workflowOptions: WorkflowServiceOptions = {
        databaseService: dbService,
        ruleEngine: ruleEngine,
        actionFactory: actionFactory,
        graphqlEndpoint: "/"
      }
      
      console.log('Creating workflow service', dbServiceOptions);
      const workflowService = new WorkflowService(workflowOptions);
      
      const scheduleServiceOptions: ScheduledTaskServiceOptions = {
        databaseService: dbService,
        workflowService: workflowService
      }
      
      const scheduledService = new ScheduledTaskService(scheduleServiceOptions);      
      
      console.log("Initializing workflow...")
      await workflowService.init();

      const sitecoreEdgeUrl = process.env.EDGE_QL_ENDPOINT || '';
      
      console.log('Executing triggers', scheduleServiceOptions);

      const workflowResult = await scheduledService.executeTasks();

      if (!workflowResult.success) {
        console.log('Failed to execute workflow triggers');
        return res.status(500).json({ success: false, error: 'Failed to execute workflow triggers' });
      }
    } catch (error) {
      console.log('Something weird happened - ', error);
      return res.status(500).json({ success: false, error: 'Failed to execute workflow triggers' });
    }

    const metadata: Metadata = {
      timestamp: new Date().toISOString()      
    };

    const okResult : SuccessResponse = { success: true, metadata };

    console.log('Returning OK result', okResult);

    return res.status(200).json(okResult);
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: `Method ${req.method} not allowed` });
  }
}