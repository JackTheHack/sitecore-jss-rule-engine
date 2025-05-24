import test from 'ava';
import { getDatabaseService, resetTest } from '../_testHelper';

test('addVisitor and getVisitorState', async t => {
    await resetTest();

    var db = getDatabaseService();

    await db.addVisitor('visitor1', 'stateA', 'wf1');
    const state = await db.getVisitorState('visitor1', 'wf1');
    t.is(state, 'stateA');
});

test('updateVisitorState', async t => {
    await resetTest();

    var db = getDatabaseService();

    await db.addVisitor('visitor2', 'stateA', 'wf1');
    await db.updateVisitorState('visitor2', 'stateB', 'wf1');
    const state = await db.getVisitorState('visitor2', 'wf1');
    t.is(state, 'stateB');
});

test('removeVisitor', async t => {
    await resetTest();

    var db = getDatabaseService();

    await db.addVisitor('visitor3', 'stateA', 'wf1');
    await db.removeVisitor('visitor3', 'wf1');
    const state = await db.getVisitorState('visitor3', 'wf1');
    t.is(state, null);
});

test('getStateVisitors', async t => {
    
    await resetTest();

    var db = getDatabaseService();

    await db.addVisitor('visitor4', 'stateC', 'wf2');
    await db.addVisitor('visitor5', 'stateC', 'wf2');
    await db.addVisitor('visitor6', 'stateD', 'wf2');
    const visitors = await db.getStateVisitors('stateC', 'wf2');
    t.deepEqual(visitors.sort(), ['visitor4', 'visitor5']);
});
