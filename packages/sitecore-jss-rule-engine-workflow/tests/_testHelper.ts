import { JssRuleEngine } from "@jss-rule-engine/core";
import { IWorkflowAction, IWorkflowActionFactory } from "../src/actionFactory";
import WorkflowService from "../src/workflowService";
import { DatabaseService } from "../src/databaseService";

export async function  resetTest(){    

    var workflowService = getDatabaseService();
    await workflowService.cleanDb();
    await workflowService.init();
}

export function getWorkflowService(){
    const ruleEngine = getRuleEngine();
            const actionFactory = getMockActionFactory();
            const dbService = getDatabaseService();
            const workflow = new WorkflowService({
                databaseService: dbService,
                ruleEngine: ruleEngine,
                actionFactory: actionFactory
            });

            return workflow;
}

export function getDatabaseService(){
    const result =  new DatabaseService({
        url: 'file:test.sqlite'
        //url: 'file::memory:?cache=shared'
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
