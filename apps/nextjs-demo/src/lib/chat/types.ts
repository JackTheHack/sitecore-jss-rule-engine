import { JssRuleEngine } from "@jss-rule-engine/core";
import { Flow } from "react-chatbotify";


export type CommandExecutionContext = {
    ruleEngine: JssRuleEngine;
};

export type ChatConversationContext = {
    injectMessage: any;
    flow: Flow;
    userInput: string;
    ruleEngine: JssRuleEngine,
    prevPath?: string, 
    currPath?: string
};

export type Action = {
  type: string;
  content: string;
};

export type Metadata = {
  timestamp: string;
  messageLength: number;
};

export type SuccessResponse = {
  success: true;
  actions: Action[];
  metadata: Metadata;
};

export type ErrorResponse = {
  success: false;
  error: string;
};