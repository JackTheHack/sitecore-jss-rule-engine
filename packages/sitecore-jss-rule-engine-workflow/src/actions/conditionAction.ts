import { IWorkflowAction } from '../actionFactory';
import { WorkflowAction, WorkflowExecutionContext } from '../workflowTypes';
import { conditionActionQuery } from '../graphql/conditionActionQuery';
import { cleanId } from '../lib/helper';

/* interface ScheduleTriggerFields {
    seconds: string;
    triggerName: string;
    triggerParameters?: string;
}
 */
export class ConditionAction implements IWorkflowAction {
    async execute(action: WorkflowAction, context: WorkflowExecutionContext): Promise<void> {


        console.log('Running Condition action')

        if (!context.workflowService || !context.visitor) {
            console.warn('Missing required context for schedule trigger action');
            return;
        }

        const itemProvider = context.ruleEngineContext?.sitecoreContext?.itemProvider;

        if (!itemProvider) {
            console.warn('Sitecore provider required for running condition action.');
            return;
        }

        const conditionBranchTemplateId = cleanId("{C9B52E75-6107-4168-9890-5FCCC02FB64B}");
        const conditionElseBranchTemplateId = cleanId("{828EF052-F55C-4E01-B301-5D01FD1F5F44}");

        const breakOnFirstMatch = action.fields["BreakOnFirstMatch"] == "1";

        // Get all children items of template named ConditionBranch

        const actionItemData = await itemProvider.getItemById(action.id);

        console.log('Fetched item data')

        if (!actionItemData?.item?.children?.results?.length) {
            //no conditions found to test
            console.warn('No conditions to test.');
            return;
        }        

        const children = actionItemData?.item?.children?.results;

        const conditionChildren = children?.filter((child: any) => child.template.id === conditionBranchTemplateId) || [];

        let branchMatched = false;

        for (const child of conditionChildren) {

            console.log(`Checking condition for ${child.name}`, child.fields);

            // Run JssRuleEngine for "Condition" field
            const condition = child.fields.find((x:any) => x.name == "Condition")?.value;

            let result;

            if (condition) {
                try {
                    console.log('Running condition - ', condition)
                    result = context.ruleEngine && 
                    await context.ruleEngine.parseAndRunRule(condition, context.ruleEngineContext);
                } catch (e) {
                    console.warn('Error evaluating condition:', e);
                    result = false;
                }
            }else {
                console.warn('Condition is empty.');
                result = false;
            }

            if (result) {

                console.log(child.id, ' Branch condition is true')

                const graphQlQuery = await conditionActionQuery(child.id, "en");

                const graphQlResponse = await itemProvider.runQuery(graphQlQuery, {});

                console.log('Retrieve GraphQL response for if branch - ', graphQlResponse)

                const childItems = graphQlResponse?.item?.actionItems?.results;

                // If true - execute all the actions under the child and exit
                if (childItems) {
                    for (const actionItem of childItems) {
                        console.log('Parsing action - ', actionItem.id)
                        const parsedItem = await context.workflowService.parseWorkflowItem(actionItem)
                        if (parsedItem) {
                            console.log('Executing action ', parsedItem)
                            await context.workflowService.executeAction(context.visitor.id, parsedItem, context);
                        }
                    }
                }
                branchMatched = true;
                
                if(breakOnFirstMatch) {
                    console.log('Break on first match.');
                    break;
                }
            }
        }

        const elseChild = children?.find((child: any) => child.template.id === conditionElseBranchTemplateId);

        if (!branchMatched && elseChild) {
            // If no child item condition was true - execute all actions for child item with template ConditionBranchElse (if such exists)

            console.log('Executing else block.');

            const graphQlQuery = await conditionActionQuery(elseChild.id, "en");

            const graphQlResponse = await itemProvider.runQuery(graphQlQuery, {});

            console.log('Retrieved else branch data - ', graphQlResponse)

            const childItems = graphQlResponse?.item?.actionItems?.results;

            for (const actionItem of childItems) {
                console.log('Parsing action ', actionItem.id)
                const parsedaction = await context.workflowService.parseWorkflowItem(actionItem);
                if (parsedaction) {                    
                    await context.workflowService.executeAction(context.visitor.id, parsedaction, context);                    
                }
            }
        }

        console.log('Condition logic end.');
    }
} 