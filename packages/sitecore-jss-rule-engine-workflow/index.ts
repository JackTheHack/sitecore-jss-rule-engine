import { registerNextJS } from '@jss-rule-engine/edge';
import { getRuleEngineInstance } from '@jss-rule-engine/core'

//register commands for global instance
let ruleEngine = getRuleEngineInstance();
registerNextJS(ruleEngine);

//module index.js
export {WorkflowService} from "./src/workflowService";
export type {WorkflowExecutionContext} from "./src/workflowTypes";
export type {WorkflowExecutionOptions} from "./src/workflowTypes";
export type {WorkflowExecutionResult} from "./src/workflowTypes";
export type {Workflow} from "./src/workflowTypes";
export type {WorkflowActionCommand} from "./src/workflowTypes";
export { WorkflowActionFactory } from "./src/actionFactory";
export type { IWorkflowActionFactory, IWorkflowAction } from "./src/actionFactory";
export type {WorkflowAction, WorkflowState, WorkflowTrigger} from "./src/workflowTypes";
export { DatabaseService } from "./src/databaseService";
export type { IDatabaseService } from "./src/databaseService";
export type {WorkflowScheduledTask, IWorkflowService} from "./src/workflowTypes";
export { ScheduledTaskService } from "./src/scheduledTaskService";
export type { IScheduledTaskService } from "./src/scheduledTaskService";
export type {ScheduledTaskServiceOptions} from "./src/scheduledTaskServiceTypes";
export type {WorkflowServiceOptions} from "./src/workflowTypes";
export type {DatabaseServiceOptions} from "./src/databaseService";
export type {ChatConversationContext} from './src/workflowTypes'
export {registerWorkflowActions} from './src/registerWorkflowActions'
export {registerWorkflowRuleEngine} from './src/registerWorkflowRuleEngine'
export {loadWorkflowFromSitecore} from './src/lib/loadWorkflow'
export {getDatabaseServiceOptions} from './src/db/dbOptions'
export {handleWorkflowRun} from './src/handlers/workflowRunHandler'
export {handleScheduledTasks} from './src/handlers/scheduledTaskHandler'
export {ragItemsIndexingHandler} from './src/handlers/ragItemsIndexingHandler'