import { ragItemsIndexingHandler } from '@jss-rule-engine/workflow';
import type { NextApiRequest, NextApiResponse } from 'next';

// Example: You may want to validate a secret/token from Sitecore
const SITECORE_WEBHOOK_SECRET = process.env.SITECORE_WEBHOOK_SECRET;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ success: false, error: `Method ${req.method} not allowed` });
    }

    // Optional: Validate secret/token
    const receivedSecret = req.headers['x-sitecore-webhook-secret'] || req.query.secret;
    if (SITECORE_WEBHOOK_SECRET && receivedSecret !== SITECORE_WEBHOOK_SECRET) {
        return res.status(401).json({ success: false, error: 'Unauthorized: Invalid webhook secret' });
    }

    try {
        // Parse the webhook payload
        const event = JSON.parse(req.body);
        console.log('Received Sitecore publish webhook:', event);

        const eventType = event.EventName;
        const rootItemId = event.PublisherOptions?.RootItemId;

        // Example: Check for expected event structure
        if (eventType !== 'publish:end' && eventType !== 'publish:begin') {
            console.error('Invalid or missing event type - ', eventType)
            return res.status(400).json({ success: false, error: 'Invalid or missing event type' });
        }
        
        console.log("Indexing options - ", rootItemId)

        const runResult = await ragItemsIndexingHandler({itemId: rootItemId});

        if(runResult.success){
            return res.status(200).json({ success: true });
        }else {
            return res.status(runResult.errorCode || 500).json({ success: false, message: runResult.errorMessage || 'Something bad happened.' });

        }

        // Respond to Sitecore
    } catch (error) {
        console.error('Error processing Sitecore publish webhook:', error);
        return res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Internal server error' });
    }
} 