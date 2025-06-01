// @ts-nocheck
import test from 'ava';
import { WorkflowService } from '../../src/workflowService';
import { getMockActionFactory, getRuleEngine, getWorkflowService, resetTest } from '../_testHelper';
import chatbotWorkflowMock from '../../mocks/chatbotWorkflowMock.json';

test('should load chatbot workflow mock data successfully', async t => {
    await resetTest(t);
    
    const workflowService = getWorkflowService(t);
    await workflowService.init();
    
    // Parse the GraphQL response using the service's method
    const workflowConfig = await workflowService.parseGraphQLResponse(chatbotWorkflowMock);
    await workflowService.load(workflowConfig);

    // Verify the workflow was loaded correctly
    const loadedWorkflow = workflowService.getWorkflow(workflowConfig.id);
    t.truthy(loadedWorkflow);
    t.is(loadedWorkflow.id, workflowConfig.id);
    
    // Verify states were loaded
    const states = Object.keys(loadedWorkflow.states);
    t.true(states.length > 0);
    
    // Verify Welcome state exists and has correct triggers and actions
    const welcomeState = loadedWorkflow.states['290E750C39E946C5AF8B51ADFF8B508D'];
    t.truthy(welcomeState);
    t.is(welcomeState.name, 'Welcome');
    t.true(welcomeState.triggers.length > 0);
    t.true(welcomeState.actions.length > 0);

    // Verify AI Assistant state exists and has correct triggers and actions
    const aiAssistantState = loadedWorkflow.states['E39F428E0AAB4FD7AE150271F11CD052'];
    t.truthy(aiAssistantState);
    t.is(aiAssistantState.name, 'AI Assistant');
    t.true(aiAssistantState.triggers.length > 0);
    t.true(aiAssistantState.actions.length > 0);
}); 