import { IWorkflowActionFactory } from './actionFactory';
import { EmailAction } from './actions/emailAction';
import { ChatbotMessageAction } from './actions/chatbotMessageAction';
import { WaitAction } from './actions/waitAction';
import { ChatbotAIAction } from './actions/chatbotAIAction';

export function registerWorkflowActions(actionFactory: IWorkflowActionFactory): void {
    actionFactory.registerAction('{DE1A6157-8D0F-42CA-8951-941E8AF1BB82}', EmailAction);
    actionFactory.registerAction('{B44783BE-EBC7-4CE8-80D9-EE7A08DF3245}', ChatbotMessageAction);
    actionFactory.registerAction('{F3F30F6B-2590-4588-8754-021F350A6FBF}', WaitAction);
    actionFactory.registerAction('{05187080-DD07-4FAF-B501-F1C53CDF90F5}', ChatbotAIAction);
}