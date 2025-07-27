import { RuleEngineContext, RuleOperatorContext } from "../types/ruleEngine";

//works both for numbers and strings
export default async function(operatorContext:RuleOperatorContext, _ruleContext?: RuleEngineContext) {
    return operatorContext.parameter1 != operatorContext.parameter2;
}