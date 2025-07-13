import { NextApiRequest, NextApiResponse } from 'next';
import { ErrorResponse, SuccessResponse} from '../../../lib/form/types'
import { handleWorkflowRun } from '@jss-rule-engine/workflow';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SuccessResponse | ErrorResponse>
) {
  if (req.method === 'POST') {
    const { message, visitorId, workflowId } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, error: 'Message is required and must be a string' });
    }    

    const runResult = await handleWorkflowRun({
      message,
      visitorId,
      workflowId
    })

    if(runResult.success){
      const okResult : SuccessResponse = { 
        success: true, 
        metadata: {
          timestamp: runResult.metadata?.timestamp || '',
          }
      };

      console.log('Returning OK result', okResult);
      
      return res.status(200).json(okResult);
    }else {
      const errorResult : ErrorResponse = {
        success: false,
        error: runResult.errorMessage || 'Something bad happened.',
        metadata: {
          timestamp: runResult.metadata?.timestamp || ''
        }
      }

      return res.status(runResult.errorCode || 500).json(errorResult)
    }    

  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: `Method ${req.method} not allowed` });
  }
}