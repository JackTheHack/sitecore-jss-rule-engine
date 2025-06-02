import { Workflow, IWorkflowService } from '@jss-rule-engine/workflow';

export default async function loadWorkflow(
    graphQlEndpoint: string, 
    itemId: string, 
    workflowService: IWorkflowService): Promise<Workflow> {

    const apiKey = process.env.SITECORE_API_KEY;

    if (!apiKey) {
        throw new Error('SITECORE_API_KEY is not defined in the environment variables');
    }

    try {
        console.log('Loading workflow from Sitecore - ', itemId);
        console.log('GraphQL endpoint - ', graphQlEndpoint);                

        const graphQlQuery = await workflowService.getSitecoreQuery(itemId, "en");

        const graphQlResponse = await fetch(graphQlEndpoint, {
            method: 'POST',
            body: JSON.stringify({query: graphQlQuery}),
            headers: {
                'Content-Type': 'application/json',
                'sc_apikey': `${apiKey}`
            },
            next: { revalidate: 3600 } // Cache for 1 hour
        });

        if(!graphQlResponse.ok)
        {
            throw new Error("GraphQL request failed.");
        }

        const jsonResponse = await graphQlResponse.json();

        console.log(jsonResponse);

        const workflowConfig = await workflowService.parseGraphQLResponse(jsonResponse);    
        
        await workflowService.load(workflowConfig);

        const workflow = workflowService.getWorkflow(itemId);

        if (!workflow) {
            throw new Error('Workflow not found');
        }

        return workflow;
    } catch (error) {
        console.error('Error loading workflow from Sitecore:', error);
        throw error;
    }

}