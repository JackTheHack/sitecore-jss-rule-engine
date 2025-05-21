import { WorkflowActionFactory, IWorkflowActionFactory } from "@jss-rule-engine/workflow";
import sendMessage from "./actions/sendMessage";
import sendOptions from "./actions/sendOptions";
import { CommandExecutionContext } from "./types";

export interface ChatActionCommand {
    execute(context: CommandExecutionContext): Promise<void>;
}

export class ChatActionFactory  {
  private registeredActions: Map<string, new () => ChatActionCommand> = new Map();

  registerAction(templateId: string, action: new () => ChatActionCommand): void {
      this.registeredActions.set(templateId, action);
  }

  getAction(templateId: string): ChatActionCommand {
      const ActionClass = this.registeredActions.get(templateId);
      if (ActionClass) {
          return new ActionClass();
      }
      throw new Error(`No action found for templateId: ${templateId}`);
  }

}