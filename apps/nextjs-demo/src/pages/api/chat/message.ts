import { NextApiRequest, NextApiResponse } from 'next';
import { ErrorResponse, Metadata, SuccessResponse, handleChatMessage} from '@jss-rule-engine/chat'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SuccessResponse | ErrorResponse>
) {
  if (req.method === 'POST') {
    const { message, visitorId, workflowId } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, error: 'Message is required and must be a string' });
    }

    const chatHandlerResult = await handleChatMessage({
      message,
      visitorId,
      workflowId
    });

    if(chatHandlerResult.success){
      const okResult : SuccessResponse = { 
        success: true, 
        actions: chatHandlerResult.actions || [], 
        metadata: chatHandlerResult.metadata || {} as Metadata 
      };      

      return res.status(200).json(okResult);
    } else {
      const errorResult : ErrorResponse = {
        success: false,
        error: chatHandlerResult.errorMessage || 'Unknown error during execution.'
      }
      return res.status(chatHandlerResult.errorCode || 500).json(errorResult);
    }
    
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: `Method ${req.method} not allowed` });
  }
}