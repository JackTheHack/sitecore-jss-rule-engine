import { RuleData, RuleEngineContext } from "../types/ruleEngine";

export default async function (rule:RuleData, ruleEngineContext: RuleEngineContext) {
    var ruleResult = false;

    ruleEngineContext.ruleEngine?.debugMessage('running OR rule - ', rule.conditions?.length)

    if (rule.conditions && rule.conditions.length > 0) {
        await Promise.all(rule.conditions.map(async(condition)=> {
            var conditionId = typeof(condition.id) !== "undefined" && condition.id ? condition.id : condition.className;

            var conditionFunction = ruleEngineContext.ruleEngine?.ruleDefinitions.get(conditionId);

            if (!conditionFunction) {
                ruleEngineContext.ruleEngine?.debugMessage('Rule definition is missing for id ' + conditionId);
                throw new Error('Rule definitions missing for id ' + conditionId);
            }

            ruleEngineContext.ruleEngine?.debugMessage('Running condition ' + conditionId, conditionFunction);
            
            var conditionResult = await conditionFunction(condition, ruleEngineContext);

            if(condition.except)
            {
                conditionResult = !conditionResult;
            }

            if(typeof(conditionResult) !== 'undefined')
            {
                ruleResult = ruleResult || conditionResult;
            }
        }))
    }

    return ruleResult;

}