import { JssRuleEngine } from '@jss-rule-engine/core';
import chatMessageComparesToRule from './ruleEngine/rules/chatMessageComparesToRule';
import sendChatMessageAction  from './ruleEngine/actions/sendChatMessageAction';
import aiReplyComparesToRule from './ruleEngine/rules/aiReplyComparesToRule';
import ragRelevancyComparesToRule from './ruleEngine/rules/ragRelevancyComparesToRule';

export const registerChatRuleEngine = (ruleEngine: JssRuleEngine): void => {
    ruleEngine.registerCondition('{FB533DCD-E59E-4FB5-ABD6-1ED7D130A6A6}', chatMessageComparesToRule) //chat message compares to
    ruleEngine.registerCondition('{32682081-1438-4DC1-8817-4330A3A883BE}', aiReplyComparesToRule) //chat message compares to
    ruleEngine.registerCondition('{8B68C1DC-19E2-475D-A980-1BA383BA649D}', ragRelevancyComparesToRule) //RAG relevancy compares to

    ruleEngine.registerAction('{15911B1E-4A68-439F-83C9-A063FAAF9A6C}', sendChatMessageAction) //send chat message    
};