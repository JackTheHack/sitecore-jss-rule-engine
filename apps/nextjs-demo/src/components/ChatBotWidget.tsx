import ChatBot from "react-chatbotify";
import SitecoreChatPlugin from "./../lib/chat/plugins/sitecoreChatPluginFactory"
import { SitecoreChatBlock } from "lib/chat/plugins/SitecoreChatBlock";

interface ChatBotWidgetProps {
	welcomeMessage: string;
	iconUrl?: string;
}

const ChatBotWidget = ({ welcomeMessage, iconUrl }: ChatBotWidgetProps) => {

	// example openai conversation
	// you can replace with other LLMs such as Google Gemini
	const flow = {
		start: {
			message: welcomeMessage,
			chatDisabled: true,
			transition: 0,
			path: "loop"
		},
		loop: {
			flowId: "{EBAA5C94-B003-4169-AA19-BC0EADDB05DC}"
		} as SitecoreChatBlock
	}

	const styles = {
		// ...other styles
		chatButtonStyle: {
		}
	};



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
		chatButton: {

		},
		emoji: {
			disabled: true
		}
	}

	if (iconUrl) {
		chatBotSettings.chatButton = {
			icon: iconUrl
		}

		styles.chatButtonStyle = {
			background: 'none'
		};
	}

	return (
		<ChatBot
			flow={flow}
			settings={chatBotSettings}
			styles={styles}
			plugins={[SitecoreChatPlugin({ autoConfig: true, hostUrl: process.env.PUBLIC_URL })]} />
	);
};

export default ChatBotWidget;