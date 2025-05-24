import test from 'ava';
import { getDatabaseService, resetTest } from '../_testHelper';


test('addScheduledTask and getScheduledTasks', async t => {
    
    await resetTest();

    const db = getDatabaseService();

    await db.addScheduledTask(
        'task1',
        'visitor1',
        'wf1',
        'typeA',
        12345,
        'payload'
    );

    const tasks = await db.getScheduledTasks();

    t.is(tasks.length, 1);
    t.is(tasks[0].id, 'task1');
});

test('updateScheduledTask', async t => {
    await resetTest();

    const db = getDatabaseService();

    const id = 'task2';
    await db.addScheduledTask(id, 'visitor2', 'wf2', 'typeB', 12345, 'old');
    await db.updateScheduledTask(id, { payload: 'new-payload', scheduledTime: 54321 });

    const tasks = await db.getScheduledTasks();

    t.is(tasks.length, 1);
    t.is(tasks[0].payload, 'new-payload');
    t.is(tasks[0].scheduledTime, 54321);
});

test('deleteScheduledTask', async t => {

    await resetTest();

    const db = getDatabaseService();

    const id = 'task3';
    await db.addScheduledTask(id, 'visitor3', 'wf3', 'typeC', 11111, 'to-delete');
    await db.deleteScheduledTask(id);

    const tasks = await db.getScheduledTasks();
    t.is(tasks.length, 0);
});
