import { RuleActionData, RuleEngineContext } from "@jss-rule-engine/core";
import { WorkflowExecutionContext } from "@jss-rule-engine/workflow";

export default async function (command: RuleActionData, ruleContext: RuleEngineContext) {
    const workflowContext = ruleContext.sessionContext?.get<WorkflowExecutionContext>("workflowContext");    

    if (!workflowContext) {
        throw new Error("Rule engine context missing workflow context.");
    }

    const message = command.attributes.get("message");

    if (!message) {
        throw new Error("Command missing message attribute")
        return;
    }

    // Get the workflow service from context
    workflowContext.clientCommands.push({
        operation: "chat:sendmessage",
        parameters: JSON.stringify({
            message: message
        })
    })

}; 