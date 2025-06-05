import { JssRuleEngine } from "@jss-rule-engine/core";
import { Flow } from "react-chatbotify";


export type CommandExecutionContext = {
    ruleEngine: JssRuleEngine;
};


export type Action = {
  type: string;
  content: string;
};

export type Metadata = {
  timestamp: string;
  messageLength: number;
  stateId: string;
  visitorId: string;
  triggerName: string;
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