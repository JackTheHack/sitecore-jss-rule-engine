import { JssRuleEngine } from "@jss-rule-engine/core";
import { IWorkflowAction, IWorkflowActionFactory } from "../src/actionFactory";



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
