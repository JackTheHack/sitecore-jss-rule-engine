import { JssRuleEngine } from "@jss-rule-engine/core";
import { DatabaseServiceOptions } from "./databaseService";
import { WorkflowActionFactory } from "./actionFactory";

export interface Workflow {
  id: string;
  states: Record<string, WorkflowState>;
  defaultStateId?: string;
}

export interface WorkflowExecutionContext {
    workflowService?: IWorkflowService;
    workflow: Workflow;
    visitor?: WorkflowVisitor;
    ruleEngine?: JssRuleEngine;
    commands: WorkflowActionCommand[];
    trigger?: string;
    triggerParameters?: string;
}


export interface WorkflowServiceOptions {
    db: DatabaseServiceOptions,
    ruleEngine: JssRuleEngine,
    actionFactory: WorkflowActionFactory
}

export interface WorkflowActionCommand{
    operation: string;
    parameters: string;
}

export interface WorkflowExecutionResult {
    visitorId: string;
    workflowId: string;
    stateId: string;
    commands: WorkflowActionCommand[];
    success: boolean;
    error?: string;
}

export interface WorkflowState {
  id: string;
  name: string;
  triggers: WorkflowTrigger[];
  actions: WorkflowAction[];
}

export interface WorkflowTrigger {
  id: string;
  condition: string;
  type: string;
  templateId: string;
  fields: Record<string, string>;
}

export interface WorkflowAction {
  id: string;
  templateId: string;
  condition: string;
  nextStateId?: string;  
  fields: Record<string, string>;
}

export interface WorkflowVisitor {
    id: string;
}


export interface WorkflowExecutionOptions {
  visitorId: string;
  workflowId: string;
  eventName: string;
  eventParameters: string;
  defaultStateId: string;
}

export interface IWorkflowService {
    init(): Promise<void>;
    load(workflowConfig: Workflow): Promise<void>;
    addVisitorToState(workflowId: string, stateId: string, visitorId: string): Promise<void>;
    executeTriggers(options: WorkflowExecutionOptions): Promise<WorkflowExecutionResult>;
    executeActions(visitorId: string, workflowExecutionContext: WorkflowExecutionContext, state: WorkflowState): Promise<void>;
    removeVisitorFromWorkflow(visitorId: string, workflowId: string): Promise<void>;
    changeVisitorState(visitorId: string, workflowId: string, nextStateId: string): Promise<void>;
    getStateVisitors(workflowId: string, stateId: string): Promise<string[]>;
}