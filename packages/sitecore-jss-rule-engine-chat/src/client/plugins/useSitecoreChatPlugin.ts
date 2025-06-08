import { useEffect } from "react";
import {
	useBotId,
	useFlow,
	RcbUserSubmitTextEvent,
	Plugin,
	useMessages,
	RcbChangePathEvent,
	useTextArea,
	useChatWindow
} from "react-chatbotify";
import { PluginConfig } from "./pluginConfig";
import { SitecoreChatBlock } from "./SitecoreChatBlock";
import { Action,  CommandExecutionContext } from "../types";
import { ChatActionFactory } from "../chatActionFactory";
import { getRuleEngineInstance, RuleEngineSessionContext } from "@jss-rule-engine/core";
import { ChatConversationContext } from "@jss-rule-engine/workflow";
import { registerChatCommands } from "../../registerChatCommands";


/**
 * Plugin hook that handles all the core logic.
 *
 * @param pluginConfig configurations for the plugin
 */
const useSitecoreChatPlugin = (pluginConfig?: PluginConfig) => {
	const { getBotId } = useBotId();
	const { injectMessage, simulateStreamMessage } = useMessages();	
	const { setTextAreaValue } = useTextArea();
    const { getFlow } = useFlow();
	const { toggleIsBotTyping } = useChatWindow();

	const actionFactory = new ChatActionFactory();	
	

	useEffect(() => {		
		registerChatCommands(actionFactory);
	})

	const ruleEngine = getRuleEngineInstance();

    const DefaultPluginConfig = {

    }

	const mergedPluginConfig = { ...pluginConfig, ...DefaultPluginConfig };

	
	async function executeClientActions(actions: any, chatContext: ChatConversationContext) {
		if(!actions || !Array.isArray(actions)) return;		

		console.log('Executing chat actions...', chatContext);		

		actions.forEach(async (action: Action) => {
			const actionCommand = actionFactory.getAction(action.type);
			const commandContext: CommandExecutionContext = { 
				action,
				messageApis: {
					injectMessage,
					simulateStreamMessage,
					toggleIsBotTyping
				}				
			}
			console.log('Executing client action', actionCommand, commandContext);
			actionCommand.execute(commandContext);
		});
	}

	async function getWorkflowResponse(sitecoreUrl?: string, params?:any) {
		const userInput = params.userInput;
		const flow = params.flow;

		try {
			console.log('Calling /api/chat/message', sitecoreUrl, params);

			await injectMessage(userInput, "user");

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
		

		const handleMessageEvent = async (
			event: RcbUserSubmitTextEvent | RcbChangePathEvent
		) => {
			console.log('handleMessageEvent', event);

			const {hostUrl } = mergedPluginConfig;
			//const nextPath = (event as RcbChangePathEvent).data.nextPath;
            const userInput = (event as RcbUserSubmitTextEvent)?.data?.inputText;

			if(!userInput || userInput.length == 0)
			{
				return;
			}

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

				await setTextAreaValue('');

				const reply = await getWorkflowResponse(hostUrl, jsonBody);

				console.log('Reply - ', reply);

				if(reply.success){
					const chatContext: ChatConversationContext = {
						injectMessage: injectMessage,
						variables: new RuleEngineSessionContext(),
						userInput: userInput,
						ruleEngine: ruleEngine,
						prevPath: event.detail.prevPath || undefined,
						currPath: event.detail.currPath || undefined,
					}
					chatContext.variables.set("flow", flow);

					await executeClientActions(reply.actions, chatContext);
				}
			}
		};

		// Remove any existing event listeners first to prevent duplicates
		window.removeEventListener("rcb-user-submit-text", handleMessageEvent as any);

		// Add event listeners
		window.addEventListener("rcb-user-submit-text", handleMessageEvent as any);

		// Cleanup function to remove event listeners when component unmounts
		return () => {
			window.removeEventListener("rcb-user-submit-text", handleMessageEvent as any);
		};
	}, []); // Add dependencies to prevent stale closures

	// initializes plugin metadata with plugin name
	const pluginMetaData: ReturnType<Plugin> = {
		name: "@rcb-plugins/sitecore-chat-plugin",
	};

	// adds required events in settings if auto config is true
	if (mergedPluginConfig?.autoConfig) {
		pluginMetaData.settings = {
			event: {
                rcbUserSubmitText: true				
			},
		};
	}

	return pluginMetaData;
};

export default useSitecoreChatPlugin;

