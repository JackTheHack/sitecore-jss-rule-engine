import { useEffect } from "react";
import {
	useBotId,
	useFlow,
	RcbUserSubmitTextEvent,
	Plugin,
	useMessages,
	useSettings,
	RcbChangePathEvent,
	RcbPostLoadChatBotEvent,
	RcbPreLoadChatBotEvent
} from "react-chatbotify";
import { PluginConfig } from "./pluginConfig";
import { SitecoreChatBlock } from "./SitecoreChatBlock";
import { Action, ChatConversationContext, CommandExecutionContext } from "../types";
import { ChatActionFactory } from "../chatActionFactory";
import { getRuleEngineInstance } from "@jss-rule-engine/core";
import { json } from "stream/consumers";


/**
 * Plugin hook that handles all the core logic.
 *
 * @param pluginConfig configurations for the plugin
 */
const useSitecoreChatPlugin = (pluginConfig?: PluginConfig) => {
	const { getBotId } = useBotId();
	const { injectMessage, messages } = useMessages();	
    const { getFlow } = useFlow();

	const actionFactory = new ChatActionFactory();
	const ruleEngine = getRuleEngineInstance();

    const DefaultPluginConfig = {

    }

	const mergedPluginConfig = { ...pluginConfig, ...DefaultPluginConfig };

	
	async function executeActions(actions: any, chatContext: ChatConversationContext) {
		if(!actions || !Array.isArray(actions)) return;

		console.log('Executing chat actions...');
		console.log(chatContext);

		actions.forEach(async (action: Action) => {
			const actionCommand = actionFactory.getAction(action.type);
			const commandContext: CommandExecutionContext = { 
				ruleEngine: chatContext.ruleEngine,
			}
			actionCommand.execute(commandContext);
		});
	}

	async function getWorkflowResponse(sitecoreUrl?: string, params?:any) {
		const userInput = params.userInput;
		const flow = params.flow;

		try {
			console.log('Calling /api/chat/message', sitecoreUrl, params);

			const response = await fetch(`${sitecoreUrl}/api/chat/message`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					message: userInput,
					visitorId: getBotId(),
					workflowId: flow,
				}),
			});

			if (!response.ok) {
				throw new Error(`Error: ${response.status} ${response.statusText}`);
			}

			const data = await response.json();
			return data;
		} catch (error) {
			console.error("Failed to fetch reply from Sitecore:", error);
			throw error;
		}
	}

	useEffect(() => {

		console.log("Loading Chatbotify component.");

		const handlePostLoadEvent = async (
			event: RcbUserSubmitTextEvent | RcbChangePathEvent | RcbPostLoadChatBotEvent | RcbPreLoadChatBotEvent
		) => {
			console.log('Post load', event);
		}

		/**
		 * Handles message events and adds wrapper to render markdown if applicable.
		 * 
		 * @param event message event received
		 */
		const handleMessageEvent = async (
			event: RcbUserSubmitTextEvent | RcbChangePathEvent
		) => {

			console.log('handleMessageEvent', event);

			const {hostUrl } = mergedPluginConfig;
			const nextPath = (event as RcbChangePathEvent).data.nextPath;
            const userInput = (event as RcbUserSubmitTextEvent)?.data?.inputText;
			const currPath = event.detail.currPath;
            const flow = getFlow();

			if(!currPath || !flow) return;

			const currBlock = flow[currPath] as SitecoreChatBlock;

			console.log("Current block ", currBlock)

			if(currBlock && currBlock.flowId)
			{
				if(event.type == "rcb-user-submit-text"){
					event.preventDefault();
					event.stopPropagation();
				}

				if(event.type == "rcb-change-path"){
					//load next path here and trigger event on workflow
				}

				if(event.type == "rcb-chat-load"){
					//trigger workflow for the chatbot load event 
				}

				console.log("Flow id: ", currBlock.flowId);

				const jsonBody = { flow: currBlock.flowId, userInput: userInput };

				console.log('Calling Sitecore workflow api....', jsonBody)

				const reply = await getWorkflowResponse(hostUrl, jsonBody);

				console.log('Reply - ', reply);

				if(reply.success){
					const chatContext: ChatConversationContext = {
						injectMessage: injectMessage,
						flow: flow,
						userInput: userInput,
						ruleEngine: ruleEngine,
						prevPath: event.detail.prevPath || undefined,
						currPath: event.detail.currPath || undefined,
					}

					await executeActions(reply.actions, chatContext);
				}
			}
		};
 
		

   	    // adds required events
		window.addEventListener("rcb-user-submit-text", handleMessageEvent);
		window.addEventListener("rcb-change-path", handlePostLoadEvent);
		window.addEventListener("rcb-post-load-chatbot", handlePostLoadEvent);
		window.addEventListener("rcb-pre-load-chatbot", handlePostLoadEvent);

		return () => {
			window.removeEventListener("rcb-user-submit-text", handleMessageEvent);
			window.removeEventListener("rcb-change-path", handlePostLoadEvent);
			window.removeEventListener("rcb-post-load-chatbot", handlePostLoadEvent);
			window.removeEventListener("rcb-pre-load-chatbot", handlePostLoadEvent);
		};
	}, [getBotId, getFlow]);

	// initializes plugin metadata with plugin name
	const pluginMetaData: ReturnType<Plugin> = {
		name: "@rcb-plugins/sitecore-chat-plugin",
	};

	// adds required events in settings if auto config is true
	if (mergedPluginConfig?.autoConfig) {
		pluginMetaData.settings = {
			event: {
                rcbUserSubmitText: true,
				rcbChangePath: true,
				rcbPostLoadChatBot: true,
				rcbPreLoadChatBot: true
			},
		};
	}

	return pluginMetaData;
};

export default useSitecoreChatPlugin;

