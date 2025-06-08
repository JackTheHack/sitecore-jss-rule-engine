import { ChatActionFactory } from "./client/chatActionFactory";
import sendMessageCommand from "./client/actions/sendMessage"; 
import aiResponseCommand from "./client/actions/aiResponse";

export function registerChatCommands(factory: ChatActionFactory){
    factory.registerAction("chatbot:message", sendMessageCommand)
    factory.registerAction("chatbot:ai-response", aiResponseCommand)
}