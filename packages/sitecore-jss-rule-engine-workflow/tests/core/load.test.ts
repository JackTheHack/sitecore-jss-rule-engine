// @ts-nocheck
import test from 'ava';
import {WorkflowService} from '../../src/workflowService';
import { Workflow } from '../../src/workflowTypes';
import { getMockActionFactory, getRuleEngine } from '../_testHelper';
import workflowMock from '../_workflowMock'


test('should run load', async t => {
    const ruleEngine = getRuleEngine();
    const actionFactory = getMockActionFactory();
    const workflow = new WorkflowService({
        db: {
            url: 'file:test.sqlite'
        },
        ruleEngine: ruleEngine,
        actionFactory: actionFactory
    });    

    await workflow.load(workflowMock);

    t.pass('WorkflowService loaded successfully');
});
