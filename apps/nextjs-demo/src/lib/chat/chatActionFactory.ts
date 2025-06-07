import { CommandExecutionContext } from "./types";
import { cleanId } from "./lib/helper";

export interface IChatActionCommand {
    execute(context: CommandExecutionContext): Promise<void>;
}

export class ChatActionFactory  {
  private registeredActions: Map<string, new () => IChatActionCommand> = new Map();

  registerAction(commandName: string, action: new () => IChatActionCommand): void {
      this.registeredActions.set(commandName, action);
  }

  getAction(commandName: string): IChatActionCommand {

    console.log('Registered action', this.registeredActions)
      

      const actionClass = this.registeredActions.get(commandName);

      if (actionClass) {
          return new actionClass();
      }
      throw new Error(`No action found for templateId: ${commandName}`);
  }

}