import { Workflow } from '../src/workflowTypes';

export default {
        id: 'testworkflow',
        name: 'test-workflow',
        states: {
            'teststate': {
                id: 'teststate',
                name: 'Test State',
                triggers: [{
                    id: 'testtrigger',
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
                    id: 'testaction',
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
        'teststate2': {
            id: 'teststate2',
            name: 'Next State',
            triggers: [{
                id: 'nexttrigger',
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
                id: 'nextaction',
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