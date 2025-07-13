import { getRuleEngineInstance, GraphQLItemProvider } from "@jss-rule-engine/core";
import { WorkflowActionFactory } from "../actionFactory";
import { DatabaseService } from "../databaseService";
import { getDatabaseServiceOptions } from "../db/dbOptions";
import { registerWorkflowActions } from "../registerWorkflowActions";
import { registerWorkflowRuleEngine } from "../registerWorkflowRuleEngine";
import { ScheduledTaskService } from "../scheduledTaskService";
import { ScheduledTaskServiceOptions } from "../scheduledTaskServiceTypes";
import WorkflowService from "../workflowService";
import { WorkflowServiceOptions } from "../workflowTypes";

export async function handleScheduledTasks() {
  try {
    const sitecoreEdgeUrl = process.env.EDGE_QL_ENDPOINT || '';
    const sitecoreApiKey = process.env.SITECORE_API_KEY || '';

    console.log('Triggering workflow actions');

    const ruleEngine = getRuleEngineInstance();
    registerWorkflowRuleEngine(ruleEngine);

    ruleEngine.setSitecoreContext({
      itemProvider: new GraphQLItemProvider({
        apiKey: sitecoreApiKey,
        graphEndpoint: sitecoreEdgeUrl
      })
    });

    const ruleEngineContext = ruleEngine.getRuleEngineContext();

    console.log('Rule engine: ', ruleEngine?.requestContext, ruleEngine?.sitecoreContext, ruleEngine.commandDefinitions?.size);

    const dbServiceOptions = getDatabaseServiceOptions();

    const dbService = new DatabaseService(dbServiceOptions);

    const actionFactory = new WorkflowActionFactory();
    registerWorkflowActions(actionFactory);

    const workflowOptions: WorkflowServiceOptions = {
      databaseService: dbService,
      ruleEngine: ruleEngine,
      actionFactory: actionFactory,
      graphqlEndpoint: sitecoreEdgeUrl,
      ruleEngineContext: ruleEngineContext
    };

    console.log('Creating workflow service', dbServiceOptions);
    const workflowService = new WorkflowService(workflowOptions);

    const scheduleServiceOptions: ScheduledTaskServiceOptions = {
      databaseService: dbService,
      workflowService: workflowService,
      graphqlEndpoint: sitecoreEdgeUrl || '',
      sitecoreApiKey: sitecoreApiKey || ''
    };

    const scheduledService = new ScheduledTaskService(scheduleServiceOptions);

    console.log("Initializing workflow...");
    await workflowService.init();

    console.log('Executing triggers', scheduleServiceOptions);

    const workflowResult = await scheduledService.executeTasks();

    if (!workflowResult.success) {
      console.log('Failed to execute workflow triggers', workflowResult.errorMessage);
      return {
        success: false,
        errorCode: 500,
        metadata: {
            timestamp: new Date().toISOString(),
            tasksExecuted: workflowResult?.tasksExecuted,
            totalTasks: workflowResult?.totalTasks
        },
        errorMessage: 'Failed to execute workflow triggers'
      };
    }

    const okResult = {
      success: true,
      metadata: {
        timestamp: new Date().toISOString(),
        tasksExecuted: workflowResult?.tasksExecuted,
        totalTasks: workflowResult?.totalTasks
      },
      errorMessage: undefined,
      errorCode: undefined
    };

    console.log('Returning OK result', okResult);

    return okResult;
  } catch (error) {
    console.log('Something weird happened - ', error);
    return { 
        success: false, 
        metadata: {
            timestamp: new Date().toISOString(),
            tasksExecuted: undefined,
            totalTasks: 0
        },
        errorMessage: 'Failed to execute workflow triggers', 
        errorCode: 500 };
  }
}