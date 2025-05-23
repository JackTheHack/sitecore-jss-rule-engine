import { JssRuleEngine, IJssRuleEngine} from './src/ruleEngine';
import { RuleEngineContext } from './src/types/ruleEngine';

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

export { JssRuleEngine, IJssRuleEngine, RuleEngineContext }