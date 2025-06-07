import { cleanId } from "./lib/helper";
import { WorkflowAction, WorkflowExecutionContext } from "./workflowTypes";

export interface IWorkflowAction {
    execute(action: WorkflowAction, context: WorkflowExecutionContext): Promise<void>;
}

export interface IWorkflowActionFactory {
    registerAction(templateId: string, action: new () => IWorkflowAction): void;
    getAction(templateId: string): IWorkflowAction;
}

export class WorkflowActionFactory implements IWorkflowActionFactory {

    private registeredActions: Map<string, new () => IWorkflowAction> = new Map();

    registerAction(templateId: string, action: new () => IWorkflowAction): void {

        const id = cleanId(templateId);

        this.registeredActions.set(id, action);
    }

    getAction(templateId: string): IWorkflowAction {

        const id = cleanId(templateId);

        const ActionClass = this.registeredActions.get(id);
        if (ActionClass) {
            return new ActionClass();
        }
        throw new Error(`No action found for templateId: ${templateId}`);
    }

}