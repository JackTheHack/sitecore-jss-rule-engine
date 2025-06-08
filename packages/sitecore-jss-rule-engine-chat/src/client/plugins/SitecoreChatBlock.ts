import { Block } from "react-chatbotify";

/**
 * Extends the Block from React ChatBotify to support markdown renderer attributes.
 */
export type SitecoreChatBlock = Block & {
    flowId?: string;
};