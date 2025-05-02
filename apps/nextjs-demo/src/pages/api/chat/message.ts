import { WorkflowService, WorkflowExecutionOptions, WorkflowActionFactory } from '@jss-rule-engine/workflow';
import { WorkflowServiceOptions } from '@jss-rule-engine/workflow/dist/src/workflowTypes';
import { JssRuleEngine, getRuleEngineInstance } from '@jss-rule-engine/core';
import { NextApiRequest, NextApiResponse } from 'next';
import {Action, ErrorResponse, Metadata, SuccessResponse} from '../../../lib/chat/types'

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
      const actionFactory = new WorkflowActionFactory();

      const workflowOptions: WorkflowServiceOptions = {
        db: {
          authToken: process.env.SQLITE_AUTHTOKEN || '',
          url: process.env.SQLITE_URL || '',
          syncUrl: process.env.SQLITE_SYNCURL || ''
        },
        ruleEngine: ruleEngine,
        actionFactory: actionFactory 
      }

      const executionOptions : WorkflowExecutionOptions = {
        visitorId: visitorId,
        eventName: "event:onmessage",
        eventParameters: JSON.stringify({ message: message }),
        workflowId: workflowId
      }
      const workflowService = new WorkflowService(workflowOptions);
      const workflowResult = await workflowService.executeTriggers(executionOptions);

      if (!workflowResult.success) {
        return res.status(500).json({ success: false, error: 'Failed to execute workflow triggers' });
      }
    } catch (error) {
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

    return res.status(200).json({ success: true, actions, metadata });
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: `Method ${req.method} not allowed` });
  }
}