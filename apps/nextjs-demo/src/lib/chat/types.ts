import { JssRuleEngine } from "@jss-rule-engine/core";
import { Flow } from "react-chatbotify";


export type CommandExecutionContext = {
    action: Action;
    injectMessage: (content: string | JSX.Element, sender?: string) => Promise<string | null>;
};


export type Action = {
  type: string;
  content: string;
};

export type Metadata = {
  timestamp: string;
  messageLength: number;
  newStateId?: string;
  prevStateId?: string;
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