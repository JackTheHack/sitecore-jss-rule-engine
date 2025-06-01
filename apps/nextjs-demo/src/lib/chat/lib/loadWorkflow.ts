import { JssRuleEngine } from '@jss-rule-engine/core';
import { Workflow, WorkflowService, WorkflowActionFactory } from '@jss-rule-engine/workflow';
import { DatabaseServiceOptions, DatabaseService } from '@jss-rule-engine/workflow';

export default async function loadWorkflow(graphQlEndpoint: string, itemId: string): Promise<Workflow> {

    const apiKey = process.env.SITECORE_API_KEY;

    if (!apiKey) {
        throw new Error('SITECORE_API_KEY is not defined in the environment variables');
    }

    try {
        console.log('Loading workflow from Sitecore - ', itemId);


        const dbOptions: DatabaseServiceOptions = {
            url: process.env.DATABASE_URL || 'file:workflow.sqlite'
        }        

        const workflowService = new WorkflowService({
            graphqlEndpoint: graphQlEndpoint,
            apiKey: apiKey,
            actionFactory: new WorkflowActionFactory(),
            databaseService: new DatabaseService(dbOptions),
            ruleEngine: new JssRuleEngine()
        });

        const graphQlQuery = await workflowService.getSitecoreQuery(itemId, "en");

        const graphQlResponse = await fetch(graphQlEndpoint, {
            method: 'POST',
            body: graphQlQuery,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            next: { revalidate: 3600 } // Cache for 1 hour
        });

        workflowService.parseGraphQLResponse(graphQlResponse.json());

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