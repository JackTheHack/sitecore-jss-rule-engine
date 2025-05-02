import { WorkflowExecutionContext } from "./workflowTypes";

export interface WorkflowActionCommand {
    execute(context: WorkflowExecutionContext): Promise<void>;
}

export interface IWorkflowActionFactory {
    registerAction(templateId: string, action: new () => WorkflowActionCommand): void;
    getAction(templateId: string): WorkflowActionCommand;
}

export class WorkflowActionFactory implements IWorkflowActionFactory {

    private registeredActions: Map<string, new () => WorkflowActionCommand> = new Map();

    registerAction(templateId: string, action: new () => WorkflowActionCommand): void {
        this.registeredActions.set(templateId, action);
    }

    getAction(templateId: string): WorkflowActionCommand {
        const ActionClass = this.registeredActions.get(templateId);
        if (ActionClass) {
            return new ActionClass();
        }
        throw new Error(`No action found for templateId: ${templateId}`);
    }

}