import { RuleConditionData } from "@jss-rule-engine/core";
import { RuleEngineContext } from "@jss-rule-engine/core";
import { ChatConversationContext, WorkflowExecutionContext } from "@root/src/workflowTypes";

export default async function(rule:RuleConditionData, ruleContext: RuleEngineContext) {
    const workflowContext = ruleContext.sessionContext?.get<WorkflowExecutionContext>("workflowContext");    

    if (!workflowContext) {
        throw new Error("Rule engine context missing workflow context.");
    }

    const chatContext = ruleContext.sessionContext?.get<ChatConversationContext>("chatContext");

    if (!chatContext) {
        throw new Error("Rule engine context missing chat context.");
    }

    ruleContext.ruleEngine?.debugMessage('Running chatMessageComparesToRule ', rule.attributes);

    const messageText = rule.attributes?.get("value");
    const comparisonValue = rule.attributes?.get("ParameterName");

    if (!messageText || !comparisonValue) {
        return false;
    }

    try {
        // Get the current chat message from context
        const currentMessage = chatContext.userInput;
        
        if (!currentMessage) {
            ruleContext.ruleEngine?.debugMessage('Chat messsage is empty. Skipping.');
            return false;
        }

        // Compare the messages
        ruleContext.ruleEngine?.debugMessage('Comparing ', currentMessage, ' with ', messageText);
        return currentMessage.toLowerCase() === messageText.toLowerCase();
    } catch (error) {
        console.error('Error in chatMessageComparesToRule:', error);
        return false;
    }
}; 