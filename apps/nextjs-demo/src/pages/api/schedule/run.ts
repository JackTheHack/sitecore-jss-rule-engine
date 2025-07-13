import { NextApiRequest, NextApiResponse } from 'next';
import { ErrorResponse, SuccessResponse} from '../../../lib/form/types'
import {handleScheduledTasks} from '@jss-rule-engine/workflow'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SuccessResponse | ErrorResponse>
) {
  if (req.method === 'POST') {
    
      const runResult = await handleScheduledTasks();

      if(runResult.success){

        const okResult : SuccessResponse = {
          success: true,
          metadata: {
            timestamp: runResult?.metadata?.timestamp,
            tasksExecuted: runResult?.metadata?.tasksExecuted,
            totalTasks: runResult?.metadata?.totalTasks
          }          
        }
        return res.status(200).json(okResult);
      } else {
        const errorResult: ErrorResponse = {
          success: false,
          error: runResult?.errorMessage || 'Something bad happened'
        }
        return res.status(runResult.errorCode || 500).json(errorResult);
      }

    
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: `Method ${req.method} not allowed` });
  }
}