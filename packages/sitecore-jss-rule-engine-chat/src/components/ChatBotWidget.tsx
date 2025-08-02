import React from 'react';
import ChatBot from "react-chatbotify";
import SitecoreChatPlugin from "../client/plugins/sitecoreChatPluginFactory"
import { SitecoreChatBlock } from 'src/client/plugins/SitecoreChatBlock';

interface ChatBotWidgetProps {
	welcomeMessage: string;
	startOptions: string[];
	iconUrl?: string;
	flowId: string;
	title: string;
}

export const ChatBotWidget = ({ welcomeMessage, startOptions, iconUrl, flowId, title }: ChatBotWidgetProps) => {

	// example openai conversation
	// you can replace with other LLMs such as Google Gemini
	const flow = {
		start: {
			message: welcomeMessage,
			options: {
				items: startOptions,
				reusable: true
			},
			chatDisabled: false,
			start: true,
			waitForAnswer: false,
			transition: 0,
			path: "loop"
		},
		loop: {
			flowId: flowId
		} as SitecoreChatBlock
	}

	console.log('Chatbot flow: ', flow, flowId, startOptions);

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
			title: title,
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
			id='chatbot-widget'
			key={`chatbot-widget-${flowId}`}
			plugins={[SitecoreChatPlugin({ autoConfig: true, hostUrl: process.env.PUBLIC_URL })]} />
	);
};

export default ChatBotWidget;