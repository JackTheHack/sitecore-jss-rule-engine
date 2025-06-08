import { IWorkflowActionFactory } from '@jss-rule-engine/workflow';
import { ChatbotMessageAction } from './ruleEngine/actions/chatbotMessageAction';
import { ChatbotAIAction } from './ruleEngine/actions/chatbotAIAction';

export function registerChatActions(actionFactory: IWorkflowActionFactory): void {
    actionFactory.registerAction('{B44783BE-EBC7-4CE8-80D9-EE7A08DF3245}', ChatbotMessageAction);
    actionFactory.registerAction('{05187080-DD07-4FAF-B501-F1C53CDF90F5}', ChatbotAIAction);
}