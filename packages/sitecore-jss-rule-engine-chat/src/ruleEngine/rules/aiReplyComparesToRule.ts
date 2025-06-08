import { ConditionFunctionDefinition, RuleConditionData } from "@jss-rule-engine/core";
import { RuleEngineContext } from "@jss-rule-engine/core";
import { ChatConversationContext, WorkflowExecutionContext } from "@jss-rule-engine/workflow";

const aiReplyComparesToRule : ConditionFunctionDefinition = async function(rule:RuleConditionData, ruleContext: RuleEngineContext) {
    const workflowContext = ruleContext.sessionContext?.get<WorkflowExecutionContext>("workflowContext");    

    if (!workflowContext) {
        ruleContext.ruleEngine?.debugMessage('Rule engine context missing workflow context.');
        throw new Error("Rule engine context missing workflow context.");
    }

    const chatContext = ruleContext.sessionContext?.get<ChatConversationContext>("chatContext");

    if (!chatContext) {
        ruleContext.ruleEngine?.debugMessage('Rule engine context missing chat context.');
        throw new Error("Rule engine context missing chat context.");
    }

    const aiResponse = chatContext.variables.get<string>('aiResponse');    

    const operatorId = rule.attributes?.get('operatorid');
    const operator = ruleContext.ruleEngine?.operatorDefinitions.get(operatorId);

    if(!operator)
    {
        ruleContext.ruleEngine?.debugMessage('Operator definition is missing for id " + operatorId');
        throw new Error("Operator definition is missing for id " + operatorId);
    }

    ruleContext.ruleEngine?.debugMessage('Running aiReplyComparesToRule ', rule.attributes);

    const messageText = rule.attributes?.get("value");    

    if (!messageText) {
        ruleContext.ruleEngine?.debugMessage('Message parameter is empty.');
        return false;
    }

    try {
        // Get the current chat message from context
        const currentMessage = aiResponse;
        
        if (!currentMessage) {
            ruleContext.ruleEngine?.debugMessage('AI messsage is empty. Skipping.');
            return false;
        }        
        
        const operatorContext = {
            parameter1: currentMessage?.toLowerCase(),
            parameter2: messageText?.toLowerCase()
        };

        const result = await operator(operatorContext, ruleContext) as boolean;        

        ruleContext.ruleEngine?.debugMessage('AI message - ', currentMessage, ' Expected: ', messageText, ' Result: ', result);

        return result;
    } catch (error) {
        console.error('Error in aiReplyComparesToRule:', error);
        return false;
    }
}; 

export default aiReplyComparesToRule;