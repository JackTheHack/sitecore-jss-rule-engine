import { JssRuleEngine } from '@jss-rule-engine/core';
import workflowTriggerNameComparesToRule from './ruleEngine/rules/workflowTriggerNameComparesToRule';
import setWorkflowStateAction from './ruleEngine/commands/setWorkflowStateAction';

export const registerWorkflowRuleEngine = (ruleEngine: JssRuleEngine): void => {
    ruleEngine.registerCondition('{0FF3ABD2-064E-42B9-8442-1B9B2F51008E}', workflowTriggerNameComparesToRule) //trigger name compares to
    ruleEngine.registerAction('{B4F98CF3-08CA-4D2B-987E-4E0B4D8E72EF}', setWorkflowStateAction) //set workflow state
};