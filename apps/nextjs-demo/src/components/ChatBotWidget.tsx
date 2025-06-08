import ChatBot from "react-chatbotify";
import SitecoreChatPlugin from "./../lib/chat/plugins/sitecoreChatPluginFactory"
import { SitecoreChatBlock } from "lib/chat/plugins/SitecoreChatBlock";

const ChatBotWidget = () => {

	// example openai conversation
	// you can replace with other LLMs such as Google Gemini
	const flow={
		start: {
			message: "Hello and welcome to chatbot!",
            chatDisabled: true,			
			transition: 0,
			path: "loop"			
		},		
		loop: {
			flowId: "{EBAA5C94-B003-4169-AA19-BC0EADDB05DC}"
		} as SitecoreChatBlock
	}

    const chatBotSettings = {
        general: {
            embedded: false
        }, 
        fileAttachment: {
            disabled: true
        },       
        tooltip: {
            mode: "NEVER",
            title: "Talk to Sitecore chatbot"
        },
        header: {
            showAvatar: false,
            title: "Peter The Bot",
        },		
		chatWindow: {
			showTypingIndicator: true
		},
		emoji: {
			disabled: true
		}
    }

	return (
		<ChatBot 
		flow={flow} 
		settings={chatBotSettings} 		
		plugins={[SitecoreChatPlugin({ autoConfig: true, hostUrl: process.env.PUBLIC_URL })]}/>
	);
};

export default ChatBotWidget;