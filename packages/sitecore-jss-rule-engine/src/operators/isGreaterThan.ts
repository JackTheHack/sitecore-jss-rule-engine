import { RuleEngineContext, RuleOperatorContext } from "../types/ruleEngine";

export default async function(operatorContext:RuleOperatorContext, _ruleContext?: RuleEngineContext) {
    return operatorContext.parameter1 > operatorContext.parameter2;
}