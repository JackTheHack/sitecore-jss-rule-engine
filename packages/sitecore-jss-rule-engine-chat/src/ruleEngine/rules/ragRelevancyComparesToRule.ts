import { ConditionFunctionDefinition, RuleConditionData } from "@jss-rule-engine/core";
import { RuleEngineContext } from "@jss-rule-engine/core";
import { ChatConversationContext, WorkflowExecutionContext } from "@jss-rule-engine/workflow";

const ragRelevancyComparesToRule : ConditionFunctionDefinition = async function(rule:RuleConditionData, ruleContext: RuleEngineContext) {
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

    const maxDistance = chatContext.variables.get<number>('aiRagMaxDistance');    

    const operatorId = rule.attributes?.get('operatorid');
    const operator = ruleContext.ruleEngine?.operatorDefinitions.get(operatorId);

    if(!operator)
    {
        ruleContext.ruleEngine?.debugMessage('Operator definition is missing for id " + operatorId');
        throw new Error("Operator definition is missing for id " + operatorId);
    }

    ruleContext.ruleEngine?.debugMessage('Running aiReplyComparesToRule ', rule.attributes);

    const valueText = rule.attributes?.get("value");    

    if (!valueText) {
        ruleContext.ruleEngine?.debugMessage('Message parameter is empty.');
        return false;
    }

    try {
        
        const operatorContext = {
            parameter1: maxDistance,
            parameter2: Number(valueText)
        };

        const result = await operator(operatorContext, ruleContext) as boolean;        

        ruleContext.ruleEngine?.debugMessage('AI message - "', maxDistance, '" Expected: "', valueText, '" Result: ', result);

        return result;
    } catch (error) {
        console.error('Error in aiReplyComparesToRule:', error);
        return false;
    }
}; 

export default ragRelevancyComparesToRule;