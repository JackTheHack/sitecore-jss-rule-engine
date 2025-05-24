// @ts-nocheck
import test from 'ava';
import {WorkflowService} from '../../src/workflowService';
import { Workflow } from '../../src/workflowTypes';
import { getMockActionFactory, getRuleEngine } from '../_testHelper';

test('should run init', async t => {
    const ruleEngine = getRuleEngine();
    const actionFactory = getMockActionFactory();
    const workflow = new WorkflowService({
        db: {
            url: 'file::memory:?cache=shared'
        },
        ruleEngine: ruleEngine,
        actionFactory: actionFactory
    });  

    workflow.init?.();

    t.pass('WorkflowService initialized successfully');
});  

test('should run load', async t => {
    const ruleEngine = getRuleEngine();
    const actionFactory = getMockActionFactory();
    const workflow = new WorkflowService({
        db: {
            url: 'file::memory:?cache=shared'
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
                triggers: [{
                    id: 'test-trigger',
                    condition: 'test-condition',
                    type: 'test-type',
                    templateId: 'test-template-id',
                    fields: {
                        field1: 'value1',
                        field2: 'value2'
                    }
                }],
                actions: [{
                    id: 'test-action',
                    condition: 'test-condition',
                    fields: {
                        field1: 'value1',
                        field2: 'value2'
                    },
                    templateId: 'test-template-id',
                    nextStateId: 'next-state-id',
                    type: 'mock-action',
                    params: {
                        param1: 'value1',
                        param2: 2
                    }
                }]
            }
        },
    }         

    await workflow.load(config);

    t.pass('WorkflowService loaded successfully');
});
