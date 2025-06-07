import { JssRuleEngine } from "@jss-rule-engine/core";
import { IWorkflowAction, IWorkflowActionFactory } from "../src/actionFactory";
import WorkflowService from "../src/workflowService";
import { DatabaseService } from "../src/databaseService";
import { ExecutionContext } from "ava";

export async function  resetTest(t:ExecutionContext){    

    var workflowService = getDatabaseService(t);    
    await workflowService.init();
    await workflowService.cleanDb();
}

export function getWorkflowService(t:ExecutionContext){
    const ruleEngine = getRuleEngine();    
            const actionFactory = getMockActionFactory();
            const dbService = getDatabaseService(t);
            const workflow = new WorkflowService({
                databaseService: dbService,
                ruleEngine: ruleEngine,
                actionFactory: actionFactory,
                graphqlEndpoint: 'https://ruledemo.sitecorecloud.io/api/graphql'
            });

            return workflow;
}

export function getDatabaseService(t:ExecutionContext){    
    const testTitle = t.title.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const result =  new DatabaseService({
        //url: 'file:test.sqlite'
        //url: `file:${testTitle}:memory:?cache=shared`
        url: `file:./testData/${testTitle}.sqlite`
    });
    return result;
}

export function getRuleEngine(){
    let ruleEngineOptions =  {} ;    
    var ruleEngine = new JssRuleEngine(ruleEngineOptions);        
    return ruleEngine;
}

export function getMockActionFactory() : IWorkflowActionFactory {
    return {
        getAction(templateId:string) : IWorkflowAction {
            // Return a mock WorkflowActionCommand object
            return {
                execute: async () => {
                    console.log(`Executing action for templateId: ${templateId}`); 
                }
            } as IWorkflowAction;
        },
        registerAction(_templateId: string, _action: new () => any) {
            // mock implementation
        }
    };
}
