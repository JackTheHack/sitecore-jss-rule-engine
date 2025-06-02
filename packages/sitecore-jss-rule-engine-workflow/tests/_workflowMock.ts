import { Workflow } from '../src/workflowTypes';

export default {
        id: 'test-workflow',
        name: 'test-workflow',
        states: {
            'test-state': {
                id: 'test-state',
                name: 'Test State',
                triggers: [{
                    id: 'test-trigger',
                    name: 'test-trigger',
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
                    name: 'test-action',
                    condition: 'test-condition',
                    fields: {
                        field1: 'value1',
                        field2: 'value2'
                    },
                    templateId: 'test-template-id',
                    nextStateId: 'next-state-id',                                        
                }]
            },
        'test-state-2': {
            id: 'test-state-2',
            name: 'Next State',
            triggers: [{
                id: 'next-trigger',
                name: 'next-trigger',
                condition: 'next-condition',
                type: 'next-type',
                templateId: 'next-template-id',
                fields: {
                    field1: 'next-value1',
                    field2: 'next-value2'
                }
            }],
            actions: [{
                id: 'next-action',
                name: 'next-action',
                condition: 'next-condition',
                fields: {
                    field1: 'next-value1',
                    field2: 'next-value2'
                },
                templateId: 'next-template-id',
                nextStateId: 'final-state-id'
            }]
        },
        },
    } as Workflow;   