import { JssRuleEngine } from '../ruleEngine'

declare global {
    var EdgeRuntime: string;
    var JssEngine: JssRuleEngine;
}

export {}; // <-- Required to make this a module