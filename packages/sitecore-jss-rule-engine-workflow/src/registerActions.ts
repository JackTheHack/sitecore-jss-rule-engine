import { IWorkflowActionFactory } from './actionFactory';
import { EmailAction } from './actions/emailAction';
import { ChatbotMessageAction } from './actions/chatbotMessageAction';
import { WaitAction } from './actions/waitAction';
import { AIAction } from './actions/aiAction';

export function registerActions(actionFactory: IWorkflowActionFactory): void {
    actionFactory.registerAction('email-action', EmailAction);
    actionFactory.registerAction('chatbot-message-action', ChatbotMessageAction);
    actionFactory.registerAction('wait-action', WaitAction);
    actionFactory.registerAction('ai-action', AIAction);
}