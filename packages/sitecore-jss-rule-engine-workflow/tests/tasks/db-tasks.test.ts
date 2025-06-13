import test from 'ava';
import { getDatabaseService, resetTest } from '../_testHelper';


test('addScheduledTask and getScheduledTasks', async t => {
    
    await resetTest(t);

    const db = getDatabaseService(t);

    await db.addScheduledTask(
        {
            id: 'task1',
            visitorId: 'visitor1',
            workflowId: 'wf1',
            taskType: 'typeA',
            scheduledTime: new Date(),
            payload: 'payload'
        }
    );

    const tasks = await db.getScheduledTasks();

    t.is(tasks.length, 1);
    t.is(tasks[0].id, 'task1');
});

test('updateScheduledTask', async t => {
    await resetTest(t);

    const db = getDatabaseService(t);

    const id = 'task2';
    await db.addScheduledTask({
        id,
        visitorId: 'visitor2',
        workflowId: 'wf2',
        taskType: 'typeB',
        scheduledTime: new Date(),
        payload: 'old'
    });
    await db.updateScheduledTask(id, { payload: 'new-payload', scheduledTime: new Date() });

    const tasks = await db.getScheduledTasks();

    t.is(tasks.length, 1);
    t.is(tasks[0].payload, 'new-payload');
    t.is(tasks[0].scheduledTime, new Date());
});

test('deleteScheduledTask', async t => {

    await resetTest(t);

    const db = getDatabaseService(t);

    const id = 'task3';
    await db.addScheduledTask({
        id,
        visitorId: 'visitor3',
        workflowId: 'wf3',
        taskType: 'typeC',
        scheduledTime: new Date(),
        payload: 'to-delete'
    });
    await db.deleteScheduledTask(id);

    const tasks = await db.getScheduledTasks();
    t.is(tasks.length, 0);
});
