import { IWorkflowAction } from '../actionFactory';
import { cleanId } from '../lib/helper';
import { WorkflowAction, WorkflowActionSubitem, WorkflowExecutionContext } from '../workflowTypes';
import { conditionActionQuery } from '../graphql/conditionActionQuery';
import { parse } from 'uuid';

/* interface ScheduleTriggerFields {
    seconds: string;
    triggerName: string;
    triggerParameters?: string;
}
 */
export class ConditionAction implements IWorkflowAction {
    async execute(action: WorkflowAction, context: WorkflowExecutionContext): Promise<void> {

        if (!context.workflowService || !context.visitor) {
            console.warn('Missing required context for schedule trigger action');
            return;
        }

        const itemProvider = context.ruleEngineContext?.sitecoreContext?.itemProvider;

        if (!itemProvider) {
            console.warn('Sitecore provider required for running condition action.');
            return;
        }

        const conditionBranchTemplateId = "{C9B52E75-6107-4168-9890-5FCCC02FB64B}";
        const conditionElseBranchTemplateId = "{828EF052-F55C-4E01-B301-5D01FD1F5F44}"

        // Get all children items of template named ConditionBranch

        if (!action.subitems) {
            //no conditions found to test
            console.warn('No conditions to test.');
            return;
        }

        const children = action.subitems?.filter((child: WorkflowActionSubitem) => child.templateId === conditionBranchTemplateId) || [];

        let branchMatched = false;

        for (const child of children) {
            // Run JssRuleEngine for "Condition" field
            const condition = child.fields["Condition"];
            let result;

            if (condition) {
                try {
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

                const graphQlQuery = await conditionActionQuery(child.id, "en");

                const graphQlResponse = await itemProvider.runQuery(graphQlQuery, {});

                const childItems = graphQlResponse?.item?.children

                // If true - execute all the actions under the child and exit
                if (childItems) {
                    for (const actionItem of childItems) {
                        const parsedItem = await context.workflowService.parseWorkflowItem(actionItem)
                        if (parsedItem) {
                            await context.workflowService.executeAction(context.visitor.id, parsedItem, context);
                        }
                    }
                }
                branchMatched = true;
                break;
            }
        }

        const elseChild = action.subitems?.find((child: any) => child.templateId === conditionElseBranchTemplateId);

        if (!branchMatched && elseChild) {
            // If no child item condition was true - execute all actions for child item with template ConditionBranchElse (if such exists)

            const graphQlQuery = await conditionActionQuery(elseChild.id, "en");

            const graphQlResponse = await itemProvider.runQuery(graphQlQuery, {});

            const childItems = graphQlResponse?.item?.children;

            for (const actionItem of childItems) {
                const parsedaction = await context.workflowService.parseWorkflowItem(actionItem);

                if (parsedaction) {
                    await context.workflowService.executeAction(context.visitor.id, actionItem, context);
                }
            }
        }

        console.log('Condition logic end.');
    }
} 