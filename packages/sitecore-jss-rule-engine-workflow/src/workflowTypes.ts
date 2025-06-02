import { JssRuleEngine } from "@jss-rule-engine/core";
import { IDatabaseService } from "./databaseService";
import { IWorkflowActionFactory } from "./actionFactory";

export type Workflow = {
  id: string;
  name: string;
  states: Record<string, WorkflowState>;
  defaultStateId?: string;
}

export type WorkflowExecutionContext = {
    workflowService?: IWorkflowService;
    workflow: Workflow;
    visitor?: WorkflowVisitor;
    ruleEngine?: JssRuleEngine;
    clientCommands: WorkflowActionCommand[];
    trigger?: string;
    triggerParameters?: string;
}


export type WorkflowServiceOptions = {
    databaseService: IDatabaseService,
    ruleEngine: JssRuleEngine,
    actionFactory: IWorkflowActionFactory,
    graphqlEndpoint: string,
    apiKey?: string
}

export type WorkflowActionCommand = {
    operation: string;
    parameters: string;
}

export type WorkflowExecutionResult = {
    visitorId: string;
    workflowId: string;
    stateId: string;
    clientCommands: WorkflowActionCommand[];
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
  name: string;
  condition: string;
  type: string;
  templateId: string;
  fields: Record<string, string>;
}

export type WorkflowAction = {
  id: string;
  name: string;
  templateId: string;
  condition: string;
  nextStateId?: string;  
  fields: Record<string, string>;
}

export type WorkflowScheduledTask = {
    id: string;
    visitorId: string;
    workflowId: string;
    taskType: string;
    scheduledTime: number;
    payload: string | null;
    triggerDate: Date;
}

export type WorkflowVisitor = {
    id: string;
}

export type WorkflowExecutionOptions = {
  visitorId: string;
  workflowId: string;
  eventName: string;
  eventParameters: string;
  defaultStateId?: string;
}

export type WorkflowScheduledTaskParams = {
    taskId: string;
    visitorId: string;
    workflowId: string;
    triggerType: string;
    scheduledTime: number;
    triggerParameters: string;
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
    getWorkflow(workflowId: string): Workflow | null;
    parseGraphQLResponse(response: any): Promise<Workflow>;
    getSitecoreQuery(path: string, language: string): Promise<string>;
    addScheduledTask(params: WorkflowScheduledTaskParams): Promise<void>;
}