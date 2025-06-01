// @ts-nocheck
import test from 'ava';
import WorkflowService from '../../src/workflowService';
import { getMockActionFactory, getWorkflowService, resetTest, getDatabaseService } from '../_testHelper';
import workflowMock from '../_workflowMock';
import { WorkflowExecutionOptions, WorkflowExecutionContext } from '../../src/workflowTypes';

// Helper: Rule engine that always returns true
const alwaysTrueRuleEngine = {
  getRuleEngineContext: () => ({}),
  parseAndRunRule: async () => true,
};

// Helper: Rule engine that always returns false
const alwaysFalseRuleEngine = {
  getRuleEngineContext: () => ({}),
  parseAndRunRule: async () => false,
};

test('executeTriggers: should execute actions if trigger condition is met', async t => {

  await resetTest();

  const workflowService = new WorkflowService({
    databaseService: getDatabaseService(),
    ruleEngine: alwaysTrueRuleEngine,
    actionFactory: getMockActionFactory(),
  });
  await workflowService.init();
  await workflowService.load(workflowMock);

  const options: WorkflowExecutionOptions = {
    visitorId: 'visitor-1',
    workflowId: 'test-workflow',
    eventName: 'test-trigger',
    eventParameters: '',
    defaultStateId: 'test-state',
  };

  const result = await workflowService.executeTriggers(options);

  t.true(result.success);
  t.is(result.visitorId, 'visitor-1');
  t.is(result.workflowId, 'test-workflow');
  t.is(result.stateId, 'test-state');

  t.true(Array.isArray(result.clientCommands));
});

test('executeTriggers: should not execute actions if trigger condition is not met', async t => {

  await resetTest();  

  const workflowService = new WorkflowService({
    databaseService: getDatabaseService(),
    ruleEngine: alwaysFalseRuleEngine,
    actionFactory: getMockActionFactory(),
  });
  await workflowService.init();
  await workflowService.load(workflowMock);

  const options: WorkflowExecutionOptions = {
    visitorId: 'visitor-2',
    workflowId: 'test-workflow',
    eventName: 'test-trigger',
    eventParameters: '',
    defaultStateId: 'test-state',
  };

  const result = await workflowService.executeTriggers(options);

  t.true(result.success);
  t.deepEqual(result.clientCommands, []);
});

test('executeActions: should execute actions and change state if condition is met', async t => {

  await resetTest();

  const dbService = getDatabaseService();
  const workflowService = new WorkflowService({
    databaseService: dbService,
    ruleEngine: alwaysTrueRuleEngine,
    actionFactory: getMockActionFactory(),
  });
  await workflowService.init();
  await workflowService.load(workflowMock);
  await dbService.addVisitor('visitor-3', 'test-state', 'test-workflow');

  const workflow = workflowMock;
  const state = workflow.states['test-state'];
  const context: WorkflowExecutionContext = {
    workflowService,
    workflow,
    visitor: { id: 'visitor-3' },
    ruleEngine: alwaysTrueRuleEngine,
    clientCommands: [],
    trigger: 'test-trigger',
    triggerParameters: '',
  };

  await workflowService.executeActions('visitor-3', context, state);

  // Should have changed state to nextStateId
  const newState = await dbService.getVisitorState('visitor-3', 'test-workflow');
  t.is(newState, 'next-state-id');
});

test('executeActions: should not execute actions if condition is not met', async t => {

  await resetTest();

  const dbService = getDatabaseService();
  const workflowService = new WorkflowService({
    databaseService: dbService,
    ruleEngine: alwaysFalseRuleEngine,
    actionFactory: getMockActionFactory(),
  });
  await workflowService.init();
  await workflowService.load(workflowMock);
  await dbService.addVisitor('visitor-4', 'test-state', 'test-workflow');

  const workflow = workflowMock;
  const state = workflow.states['test-state'];
  const context: WorkflowExecutionContext = {
    workflowService,
    workflow,
    visitor: { id: 'visitor-4' },
    ruleEngine: alwaysFalseRuleEngine,
    clientCommands: [],
    trigger: 'test-trigger',
    triggerParameters: '',
  };

  await workflowService.executeActions('visitor-4', context, state);

  // Should not have changed state
  const newState = await dbService.getVisitorState('visitor-4', 'test-workflow');
  t.is(newState, 'test-state');
});
