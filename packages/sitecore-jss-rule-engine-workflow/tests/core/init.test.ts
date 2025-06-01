// @ts-nocheck
import test from 'ava';
import { WorkflowService } from '../../src/workflowService';
import { getMockActionFactory, getRuleEngine, getWorkflowService, resetTest } from '../_testHelper';

test('should run init', async t => {
    await resetTest(t);

    try {        
        const workflow = getWorkflowService(t);
        await workflow.init();

        t.pass('WorkflowService initialized successfully');
    } catch (err) {
        console.error('Test failed:', err);
        t.fail(err.message);
    }
});