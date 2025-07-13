import { IWorkflowService, Workflow } from "../workflowTypes";

export async function loadWorkflowFromSitecore(
    graphQlEndpoint: string, 
    apiKey: string,
    itemId: string, 
    workflowService: IWorkflowService): Promise<Workflow> {

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
        } as any);

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