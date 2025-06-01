// @ts-nocheck
import test from 'ava';
import { WorkflowService } from '../../src/workflowService';
import { getMockActionFactory, getRuleEngine, getWorkflowService, resetTest } from '../_testHelper';
import submitWorkflowMock from '../../mocks/submitWorkflowMock.json';

test('should load submit workflow mock data successfully', async t => {
    await resetTest();
    
    const workflowService = getWorkflowService();
    await workflowService.init();
    
    // Parse the GraphQL response using the service's method
    const workflowConfig = await workflowService.parseGraphQLResponse(submitWorkflowMock);
    await workflowService.load(workflowConfig);    

    // Verify the workflow was loaded correctly
    const loadedWorkflow = workflowService.getWorkflow(workflowConfig.id);


    t.truthy(loadedWorkflow);
    t.is(loadedWorkflow.id, workflowConfig.id);
    
    // Verify states were loaded
    const states = Object.keys(loadedWorkflow.states);
    t.true(states.length > 0);
    
    // Verify Start state exists and has correct actions
    const startState = loadedWorkflow.states['4E23D557F0A3451C92540980D9867E0B'];
    t.truthy(startState);
    t.is(startState.name, 'Start');
    t.true(startState.actions.length > 0);
    t.is(startState.actions[0].name, 'Send Welcome Email');

    // Verify Wait 3 days state exists and has correct triggers and actions

    debugger;


    const wait3DaysState = loadedWorkflow.states['5D7E24C7DA7C4F14B019FC9980530759'];
    t.truthy(wait3DaysState);
    t.is(wait3DaysState.name, 'Wait 3 days');
    t.true(wait3DaysState.triggers.length > 0);
    t.true(wait3DaysState.actions.length > 0);
    t.is(wait3DaysState.triggers[0].name, 'OnSchedule');
    t.is(wait3DaysState.actions[0].name, 'Send 3 days email');
    t.is(wait3DaysState.actions[1].name, 'Wait');

    // Verify Wait 7 days state exists and has correct triggers and actions
    const wait7DaysState = loadedWorkflow.states['CC358B52BBD14CC3A5573993A90A1B7E'];
    t.truthy(wait7DaysState);
    t.is(wait7DaysState.name, 'Wait 7 days');
    t.true(wait7DaysState.triggers.length > 0);
    t.true(wait7DaysState.actions.length > 0);
    t.is(wait7DaysState.triggers[0].name, 'OnSchedule');
    t.is(wait7DaysState.actions[0].name, 'Send 7 days email');
    t.is(wait7DaysState.actions[1].name, 'Wait');

    // Verify Finish state exists
    const finishState = loadedWorkflow.states['657CD5956CFB419281DEFF14526C0ECB'];
    t.truthy(finishState);
    t.is(finishState.name, 'Finish');
}); 