import { WorkflowActionFactory, IWorkflowActionFactory } from "@jss-rule-engine/workflow";
import sendMessage from "./actions/sendMessage";
import sendOptions from "./actions/sendOptions";
import { CommandExecutionContext } from "./types";
import { cleanId } from "./lib/helper";

export interface ChatActionCommand {
    execute(context: CommandExecutionContext): Promise<void>;
}

export class ChatActionFactory  {
  private registeredActions: Map<string, new () => ChatActionCommand> = new Map();

  registerAction(templateId: string, action: new () => ChatActionCommand): void {

      const id = cleanId(templateId);

      this.registeredActions.set(id, action);
  }

  getAction(templateId: string): ChatActionCommand {

      const id = cleanId(templateId);

      const ActionClass = this.registeredActions.get(id);
      
      if (ActionClass) {
          return new ActionClass();
      }
      throw new Error(`No action found for templateId: ${templateId}`);
  }

}