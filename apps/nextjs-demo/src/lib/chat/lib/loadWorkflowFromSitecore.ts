import { Workflow, WorkflowState, WorkflowTrigger, WorkflowAction } from '@jss-rule-engine/workflow';
import { GraphQLClient, gql } from 'graphql-request';

export default async function loadWorkflowFromSitecore(graphQlEndpoint: string, itemId: string) : Promise<Workflow> {

        const apiKey = process.env.SITECORE_API_KEY;
        if (!apiKey) {
            throw new Error('SITECORE_API_KEY is not defined in the environment variables');
        }

        const client = new GraphQLClient(graphQlEndpoint, {
            headers: {
                sc_apikey: apiKey
            },
          });

        const query = gql`
            query GetItemWithChildren($itemId: String!, $language: String!) {
            item(path: $itemId, language: $language) {
                id
                name
                fields {
                    id
                    name
                    value
                }
                children {
                    results {
                        id
                        name
                        fields {
                            id
                            name
                            value
                        }
                        children {
                            results {
                                id
                                name
                                template {
                                    id
                                    name
                                    baseTemplates {
                                        id
                                        name
                                    }
                                }
                                fields {
                                    id
                                    name
                                    value
                                }
                            }
                        }
                    }
                }
            }
            }
        `;

        try {
            console.log('Loading workflow from Sitecore - ', itemId);
            const variables = { itemId: itemId, language: 'en' }; // Replace 'en' with the desired language code

            const data = await client.request<any>(query, variables);
            
            if(!data)
            {
                throw new Error("GraphQL response failed.");
            }

            const startField = data.item.fields.find((x:any) => x.name == 'Start State');
            const defaultStateId = startField.value;

            console.log("Parsing Sitecore graphq response");
            console.log('Default state ', defaultStateId);

            //parse sitecore data here
            const states: Record<string, WorkflowState> = {};

            data.item.children.results.forEach((child: any) => {
                const stateId = child.id;
                const stateName = child.name;

                const newState: WorkflowState = {
                    id: stateId,
                    name: stateName,
                    triggers: [],
                    actions: []
                };

                console.log('Parsing state', stateId, stateName)
                console.log(child.children.results);

                child.children.results.map((grandChild: any) => {

                    console.log('Parsing grandchild', grandChild.id, grandChild.name, grandChild.template);

                    const isTrigger = grandChild.template.baseTemplates.some((baseTemplate: any) => baseTemplate.name === 'Trigger');
                    const isAction = grandChild.template.baseTemplates.some((baseTemplate: any) => baseTemplate.name === 'Action');

                    if(isTrigger) {
                        const trigger: WorkflowTrigger = {
                            id: grandChild.id,
                            condition: grandChild.fields.find((field: any) => field.name === 'Condition')?.value || '',
                            type: grandChild.template.name,
                            templateId: grandChild.template.id,
                            fields: grandChild.fields.reduce((acc: Record<string, string>, field: any) => {
                                acc[field.name] = field.value;
                                return acc;
                            }, {})
                        };
                        console.log('Adding trigger ', trigger);
                        newState.triggers.push(trigger);
                    }

                    if(isAction) {
                        const action: WorkflowAction = {
                            id: grandChild.id,
                            templateId: grandChild.template.id,
                            condition: grandChild.fields.find((field: any) => field.name === 'Condition')?.value || '',
                            nextStateId: grandChild.fields.find((field: any) => field.name === 'NextState')?.value || '',
                            fields: grandChild.fields.reduce((acc: Record<string, string>, field: any) => {
                                acc[field.name] = field.value;
                                return acc;
                            }, {})
                        };
 
                        console.log('Adding action ', action)
                        newState.actions.push(action);
                    }
                });

                states[stateId] = newState;
            });

            const workflowResult: Workflow = {
                id: itemId,
                states: states,
                defaultStateId: defaultStateId
            }

            //console.log(workflowResult);

            return workflowResult;
        } catch (error) 
        {
            console.error('Error loading workflow from Sitecore:', error);
            throw error;
        }
    
}