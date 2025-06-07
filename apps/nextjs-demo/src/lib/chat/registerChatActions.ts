import { ChatActionFactory } from "./chatActionFactory";
import sendMessageCommand from "./actions/sendMessage"; 
import aiResponseCommand from "./actions/aiResponse";

export function registerChatActions(factory: ChatActionFactory){
    factory.registerAction("chatbot:message", sendMessageCommand)
    factory.registerAction("chatbot:ai-response", aiResponseCommand)
}