import { getRuleEngineInstance, JssRuleEngine } from "@jss-rule-engine/core";
import { WorkflowActionFactory } from "../actionFactory";
import { DatabaseService } from "../databaseService";
import { getDatabaseServiceOptions } from "../db/dbOptions";
import { loadWorkflowFromSitecore } from "../lib/loadWorkflow";
import { registerWorkflowActions } from "../registerWorkflowActions";
import { registerWorkflowRuleEngine } from "../registerWorkflowRuleEngine";
import WorkflowService from "../workflowService";
import { WorkflowServiceOptions, WorkflowExecutionOptions } from "../workflowTypes";

export async function handleWorkflowRun(
    {
        message, 
        visitorId, 
        workflowId,
        registerRuleEngine,
        registerActionFactory
    } : 
    {
        message: string,
        visitorId: string,
        workflowId: string,
        registerRuleEngine?: (ruleEngine: JssRuleEngine) => void,
        registerActionFactory?: (actionFactory: WorkflowActionFactory) => void
    }) 
{
  try {      
    
    const sitecoreEdgeUrl = process.env.EDGE_QL_ENDPOINT || '';
    const sitecoreApiKey = process.env.SITECORE_API_KEY || '';

    console.log('Handling workflow submit', message, visitorId, workflowId);

    const ruleEngine = getRuleEngineInstance();
    registerWorkflowRuleEngine(ruleEngine);      
    if(registerRuleEngine){
        registerRuleEngine(ruleEngine);
    }

    console.log('Rule engine: ', ruleEngine?.requestContext, ruleEngine?.sitecoreContext, ruleEngine.commandDefinitions?.size);

    const actionFactory = new WorkflowActionFactory();
    registerWorkflowActions(actionFactory);
    if(registerActionFactory){
        registerActionFactory(actionFactory);
    }

    const ruleEngineContext = ruleEngine.getRuleEngineContext();

    const dbServiceOptions = getDatabaseServiceOptions();
    const dbService = new DatabaseService(dbServiceOptions);

    const workflowOptions: WorkflowServiceOptions = {
      databaseService: dbService,
      ruleEngine: ruleEngine,
      actionFactory: actionFactory,
      graphqlEndpoint: sitecoreEdgeUrl,
      apiKey: sitecoreApiKey,
      ruleEngineContext: ruleEngineContext
    }
    
    console.log('Creating workflow service', dbServiceOptions);
    const workflowService = new WorkflowService(workflowOptions);
    
    console.log("Initializing workflow...")
    await workflowService.init();

    const workflowConfig = await loadWorkflowFromSitecore(sitecoreEdgeUrl, sitecoreApiKey, workflowId, workflowService);

    const executionOptions : WorkflowExecutionOptions = {
      visitorId: visitorId,
      eventName: "form:submit",
      eventParameters: JSON.stringify({ message: message }),
      workflowId: workflowId,
      defaultStateId: workflowConfig.defaultStateId || ''
    }      

    console.log('Executing triggers', executionOptions);

    const workflowResult = await workflowService.executeTriggers(executionOptions);

    if (!workflowResult.success) 
    {
      console.log('Failed to execute workflow triggers', workflowResult.error);
      return { success: false, errorCode: 500, errorMessage: 'Failed to execute workflow triggers' };
    }
  } catch (error) 
  {
    console.log('Something weird happened - ', error);
    return { success: false, errorCode: 500, errorMessage: 'Failed to execute workflow triggers' };
  }

  const metadata = {
    timestamp: new Date().toISOString()
  };

  return { success: true, metadata }
}