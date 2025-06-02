import { RuleData, RuleEngineContext } from "@jss-rule-engine/core";
import { WorkflowExecutionContext } from "@root/src/workflowTypes";

export default async function(rule:RuleData, ruleContext: RuleEngineContext) {
    const workflowContext = ruleContext.sessionContext?.get<WorkflowExecutionContext>("workflowContext");    

    if (!workflowContext) {
        throw new Error("Rule engine context missing workflow context.");
    }

    const messageText = rule.attributes?.get("value");
    const comparisonValue = rule.attributes?.get("ParameterName");

    if (!messageText || !comparisonValue) {
        return false;
    }

    try {
        // Get the current chat message from context
        const currentTriggerName = workflowContext.trigger;
        
        if (!currentTriggerName) {
            return false;
        }

        // Compare the messages
        return currentTriggerName.toLowerCase() === messageText.toLowerCase();
    } catch (error) {
        console.error('Error in chatMessageComparesToRule:', error);
        return false;
    }
}; 