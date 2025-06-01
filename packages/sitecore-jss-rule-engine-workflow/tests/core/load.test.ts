// @ts-nocheck
import test from 'ava';
import {WorkflowService} from '../../src/workflowService';
import { Workflow } from '../../src/workflowTypes';
import { getMockActionFactory, getRuleEngine, getWorkflowService, resetTest } from '../_testHelper';
import workflowMock from '../_workflowMock'


test('should run load', async t => {

    await resetTest(t);
    
    var workflow = getWorkflowService(t);
    await workflow.init();
    await workflow.load(workflowMock);

    t.pass('WorkflowService loaded successfully');
});
