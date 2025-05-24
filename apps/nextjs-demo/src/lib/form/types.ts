import { JssRuleEngine } from "@jss-rule-engine/core";

export type CommandExecutionContext = {
    ruleEngine: JssRuleEngine;
};

export type Metadata = {
  timestamp: string;
};

export type SuccessResponse = {
  success: true;
  metadata: Metadata;
};

export type ErrorResponse = {
  success: false;
  error: string;
};