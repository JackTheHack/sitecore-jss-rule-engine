import { JssRuleEngine, IJssRuleEngine} from './src/ruleEngine';
import { RuleData, RuleActionData, ClientCommand, RuleEngineContext, RuleConditionData, ConditionFunctionDefinition, ActionFunctionDefinition, OperatorFunctionDefinition } from './src/types/ruleEngine';
import {RuleEngineSessionContext} from './src/types/ruleEngineSessionContext'

declare global {
    var EdgeRuntime: string;
    var JssEngine: JssRuleEngine;
}

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

export { JssRuleEngine, RuleEngineSessionContext };
export type { IJssRuleEngine, RuleEngineContext, ClientCommand, RuleConditionData, RuleData, RuleActionData, ConditionFunctionDefinition, ActionFunctionDefinition, OperatorFunctionDefinition };
export { GraphQLItemProvider } from './src/graphQl/graphQLItemProvider';