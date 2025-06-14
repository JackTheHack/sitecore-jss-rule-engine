import { RuleData, RuleEngineContext } from "../types/ruleEngine";

export default async function(rule:RuleData, ruleContext: RuleEngineContext) {
    var operatorId = rule.attributes?.get('operatorid');
    var operator = ruleContext.ruleEngine?.operatorDefinitions.get(operatorId);

    if(!operator)
    {
        throw new Error("Operator definition is missing for id " + operatorId);
    }        

    var key = rule.attributes?.get('ParameterName');
    var value = rule.attributes?.get('value');

    console.log('Checking request param rule', key, value, ruleContext?.requestContext?.url);

    if(!ruleContext.requestContext || 
       !ruleContext.requestContext.urlParams ||
       !ruleContext.requestContext.urlParams.get)
    {
        throw new Error("Request context params are missing for this rule. Try running the personalization in SSR or FE-mode.");
    }

    const operatorContext = {
        parameter1: ruleContext.requestContext.urlParams.get(key),
        parameter2: value
    };

    console.log('Operator context', operatorContext);

    const result = await operator(operatorContext, ruleContext);
    console.log('Param rule result - ', result)
    return result;
}