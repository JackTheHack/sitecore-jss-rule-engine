import { registerNextJS } from '@jss-rule-engine/edge';
import { getRuleEngineInstance } from '@jss-rule-engine/core'

//register commands for global instance
let ruleEngine = getRuleEngineInstance();
registerNextJS(ruleEngine);

//module index.js
export {WorkflowService} from "./src/workflowService";
export {WorkflowExecutionContext} from "./src/workflowTypes";
export {WorkflowExecutionOptions} from "./src/workflowTypes";
export {WorkflowExecutionResult} from "./src/workflowTypes";
export {Workflow} from "./src/workflowTypes";
export {WorkflowActionCommand} from "./src/workflowTypes";
export {WorkflowActionFactory, IWorkflowActionFactory} from "./src/actionFactory";
export {WorkflowAction, WorkflowState, WorkflowTrigger} from "./src/workflowTypes";
export {DatabaseService, IDatabaseService} from "./src/databaseService";
export {WorkflowScheduledTask, IWorkflowService} from "./src/workflowTypes";
export {ScheduledTaskService, IScheduledTaskService} from "./src/scheduledTaskService";
export {ScheduledTaskServiceOptions} from "./src/scheduledTaskServiceTypes";
export {WorkflowServiceOptions} from "./src/workflowTypes";
export {DatabaseServiceOptions} from "./src/databaseService";