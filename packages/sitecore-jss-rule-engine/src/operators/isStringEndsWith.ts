import { RuleEngineContext, RuleOperatorContext } from "../types/ruleEngine";

export default async function(operatorContext:RuleOperatorContext, _ruleContext?: RuleEngineContext) {
    if(typeof(operatorContext.parameter1) != "string" ||
       typeof(operatorContext.parameter2) != "string"){
        return false;
    }

    return operatorContext.parameter1.endsWith(operatorContext.parameter2);
}