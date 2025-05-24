// @ts-nocheck
import test from 'ava';
import { WorkflowService } from '../../src/workflowService';
import { getMockActionFactory, getRuleEngine } from '../_testHelper';

test('should run init', async t => {
    try {
        const ruleEngine = getRuleEngine();
        const actionFactory = getMockActionFactory();
        const workflow = new WorkflowService({
            db: {
                url: 'file::memory:?cache=shared'
            },
            ruleEngine: ruleEngine,
            actionFactory: actionFactory
        });

        await workflow.init?.();
        t.pass('WorkflowService initialized successfully');
    } catch (err) {
        console.error('Test failed:', err);
        t.fail(err.message);
    }
});