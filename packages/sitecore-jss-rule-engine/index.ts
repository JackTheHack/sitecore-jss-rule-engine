import { JssRuleEngine, IJssRuleEngine} from './src/ruleEngine';
import { RuleData, RuleActionData, RuleEngineContext, RuleConditionData, ConditionFunctionDefinition, ActionFunctionDefinition, OperatorFunctionDefinition } from './src/types/ruleEngine';
import {RuleEngineSessionContext} from './src/types/ruleEngineSessionContext'

var isEdgeRuntime = typeof global.EdgeRuntime == 'string';

if(!isEdgeRuntime && !global.JssEngine)
{
    global.JssEngine = new JssRuleEngine({})
}

export function getRuleEngineInstance() {
    if(!isEdgeRuntime)
    {
        return global.JssEngine;
    }
    
    return new JssRuleEngine();
}

export { JssRuleEngine, IJssRuleEngine, RuleEngineContext, RuleConditionData, RuleData, RuleActionData, RuleEngineSessionContext, ConditionFunctionDefinition, ActionFunctionDefinition, OperatorFunctionDefinition }