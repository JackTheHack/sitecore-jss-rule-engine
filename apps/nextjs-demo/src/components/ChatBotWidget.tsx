import ChatBot from "react-chatbotify";

const ChatBotWidget = () => {
	let hasError = false;

	// example openai conversation
	// you can replace with other LLMs such as Google Gemini
	const call_server = async (params: any) : Promise<void> => {

        console.log('call_server', params);

		try {
			
			// for streaming responses in parts (real-time), refer to real-time stream example
			let userInput = "That's what you said: " + params.userInput.trim();

			await params.injectMessage(userInput);
        } catch (error) {
			await params.injectMessage("Unable to load model, is your API Key valid?");
			hasError = true;
		}
	}
	const flow={
		start: {
			message: "Hello and welcome to chatbot!",
			path: "loop"			
		},		
		loop: {
			message: async (params:any) => {
				await call_server(params);
			},
			path: () => {
				if (hasError) {
					return "start"
				}
				return "loop"
			}
		}
	}

    const chatBotSettings = {
        general: {
            embedded: false
        }, 
        fileAttachment: {
            disabled: true
        },
        chatHistory: {
            storageKey: "example_llm_conversation"
        },
        tooltip: {
            mode: "NEVER",
            title: "Talk to Sitecore chatbot"
        },
        header: {
            showAvatar: false,
            title: "Peter The Bot",

        }
    }

	return (
		<ChatBot settings={chatBotSettings} flow={flow}/>
	);
};

export default ChatBotWidget;