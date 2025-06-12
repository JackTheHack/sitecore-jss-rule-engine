import { JssRuleEngine } from "@jss-rule-engine/core";

export type CommandExecutionContext = {
    ruleEngine: JssRuleEngine;
};

export type Metadata = {
  timestamp: string;
}

export type ScheduleRunMetadata = {
  timestamp: string;
  totalTasks?: number;
  tasksExecuted?: {
    succeded: string[];
    failed: string[];
};
};

export type SuccessResponse = {
  success: true;
  metadata: Metadata | ScheduleRunMetadata;
};

export type ErrorResponse = {
  success: false;
  error: string;
  metadata?: Metadata | ScheduleRunMetadata;
};