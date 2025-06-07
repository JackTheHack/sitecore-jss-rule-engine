import { ConditionFunctionDefinition } from "@jss-rule-engine/core";
import { RuleConditionData,RuleEngineContext } from "@jss-rule-engine/core";
import { WorkflowExecutionContext } from "@root/src/workflowTypes";

const workflowTriggerNameComparesTo : ConditionFunctionDefinition = async function(rule:RuleConditionData, ruleContext: RuleEngineContext) : Promise<boolean> {

    const workflowContext = ruleContext.sessionContext?.get<WorkflowExecutionContext>("workflowContext");    

    if (!workflowContext) {
        ruleContext.ruleEngine?.debugMessage('Rule engine context missing workflow context.');
        throw new Error("Rule engine context missing workflow context.");
    }
    
    ruleContext.ruleEngine?.debugMessage('Running workflowTriggerNameComparesToRule...', rule.attributes);

    const messageText = rule.attributes?.get("value");

    if (!messageText) {
        ruleContext.ruleEngine?.debugMessage('Rule parameters are false. Skipping.');
        return false;
    }

    var operatorId = rule.attributes?.get('operatorid');
    var operator = ruleContext.ruleEngine?.operatorDefinitions.get(operatorId);

    if(!operator)
    {
        ruleContext.ruleEngine?.debugMessage('Operator definition is missing for id " + operatorId');
        throw new Error("Operator definition is missing for id " + operatorId);
    }        

    try {
        // Get the current chat message from context
        const currentTriggerName = workflowContext.trigger;
        
        if (!currentTriggerName) {
            ruleContext.ruleEngine?.debugMessage('Current workflow trigger is empty. Skipping.');    
            return false;
        }

        // Compare the messages        

        const operatorContext = {
            parameter1: currentTriggerName?.toLowerCase(),
            parameter2: messageText?.toLowerCase()
        };
    
        const result = await operator(operatorContext, ruleContext) as boolean;        

        ruleContext.ruleEngine?.debugMessage('Current trigger - ', currentTriggerName, ' Expected: ', messageText, ' Result: ', result);

        return result;
    } catch (error) {
        console.error('Error in chatMessageComparesToRule:', error);
        return false;
    }
}; 

export default workflowTriggerNameComparesTo;