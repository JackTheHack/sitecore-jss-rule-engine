import { RuleActionData, RuleEngineContext } from "@jss-rule-engine/core";
import { WorkflowExecutionContext } from "../../workflowTypes";

export default async function(command:RuleActionData, ruleContext:RuleEngineContext) {
    
    const workflowContext = ruleContext.sessionContext?.get<WorkflowExecutionContext>("workflowContext");    

    if (!workflowContext) {
        throw new Error("Rule engine context missing workflow context.");
    }

    const stateId = command.attributes.get("stateId");

    if (!stateId) {
        throw new Error("Command missing stateid attribute")
        return;
    }

    try {
        // Get the workflow service from context
        const workflowService = workflowContext.workflowService;
        
        if (!workflowService) {
            throw new Error('Workflow service not available');
        }

        if(!workflowContext.visitor?.id || !workflowContext.workflow?.id)
        {
            throw new Error("Workflow and workflow visitor must be defined.")
        }

        // Set the workflow state
        await workflowService.changeVisitorState(
            workflowContext.visitor?.id, 
            workflowContext.workflow?.id, 
            stateId,
            workflowContext);        

    } catch (error) {
        console.error('Error in setWorkflowStateAction:', error);
        throw error;
    }
}; 