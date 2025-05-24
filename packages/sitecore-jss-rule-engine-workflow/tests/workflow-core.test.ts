// @ts-nocheck
import test from 'ava';
import {WorkflowService} from '../src/workflowService';
import { Workflow } from '../src/workflowTypes';
import { getMockActionFactory, getRuleEngine } from './_testHelper';

test('workflow module should be defined', t => {
  t.truthy(WorkflowService);
});

test('should run init', async _t => {
    const ruleEngine = getRuleEngine();
    const actionFactory = getMockActionFactory();
    const workflow = new WorkflowService({
        db: {
            url: 'file:memdb1?mode=memory&cache=shared'
        },
        ruleEngine: ruleEngine,
        actionFactory: actionFactory
    });  

    workflow.init?.();
});  

test('should run load', async _t => {
    const ruleEngine = getRuleEngine();
    const actionFactory = getMockActionFactory();
    const workflow = new WorkflowService({
        db: {
            url: 'sqlite::memory:'
        },
        ruleEngine: ruleEngine,
        actionFactory: actionFactory
    });  

    var config: Workflow = {
        id: 'test-workflow',
        states: {
            'test-state': {
                id: 'test-state',
                name: 'Test State',
                triggers: [],
                actions: []
            }
        },
    }         

    workflow.load(config);
});
