import { WorkflowExecutionContext } from "./workflowTypes";

export interface IWorkflowAction {
    execute(context: WorkflowExecutionContext): Promise<void>;
}

export interface IWorkflowActionFactory {
    registerAction(templateId: string, action: new () => IWorkflowAction): void;
    getAction(templateId: string): IWorkflowAction;
}

export class WorkflowActionFactory implements IWorkflowActionFactory {

    private registeredActions: Map<string, new () => IWorkflowAction> = new Map();

    registerAction(templateId: string, action: new () => IWorkflowAction): void {
        this.registeredActions.set(templateId, action);
    }

    getAction(templateId: string): IWorkflowAction {
        const ActionClass = this.registeredActions.get(templateId);
        if (ActionClass) {
            return new ActionClass();
        }
        throw new Error(`No action found for templateId: ${templateId}`);
    }

}