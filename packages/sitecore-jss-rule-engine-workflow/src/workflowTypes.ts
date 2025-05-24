import { JssRuleEngine } from "@jss-rule-engine/core";
import { DatabaseServiceOptions } from "./databaseService";
import { IWorkflowActionFactory } from "./actionFactory";

export type Workflow = {
  id: string;
  states: Record<string, WorkflowState>;
  defaultStateId?: string;
}

export type WorkflowExecutionContext = {
    workflowService?: IWorkflowService;
    workflow: Workflow;
    visitor?: WorkflowVisitor;
    ruleEngine?: JssRuleEngine;
    commands: WorkflowActionCommand[];
    trigger?: string;
    triggerParameters?: string;
}


export type WorkflowServiceOptions = {
    db: DatabaseServiceOptions,
    ruleEngine: JssRuleEngine,
    actionFactory: IWorkflowActionFactory
}

export type WorkflowActionCommand = {
    operation: string;
    parameters: string;
}

export type WorkflowExecutionResult = {
    visitorId: string;
    workflowId: string;
    stateId: string;
    commands: WorkflowActionCommand[];
    success: boolean;
    error?: string;
}

export type WorkflowState = {
  id: string;
  name: string;
  triggers: WorkflowTrigger[];
  actions: WorkflowAction[];
}

export type WorkflowTrigger = {
  id: string;
  condition: string;
  type: string;
  templateId: string;
  fields: Record<string, string>;
}

export type WorkflowAction = {
  id: string;
  templateId: string;
  condition: string;
  nextStateId?: string;  
  fields: Record<string, string>;
}

export type WorkflowVisitor = {
    id: string;
}


export type WorkflowExecutionOptions = {
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