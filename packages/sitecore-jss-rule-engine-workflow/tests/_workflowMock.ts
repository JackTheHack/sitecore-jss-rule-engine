import { Workflow } from '../src/workflowTypes';

export default {
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
                }]
            }
        },
    } as Workflow;   