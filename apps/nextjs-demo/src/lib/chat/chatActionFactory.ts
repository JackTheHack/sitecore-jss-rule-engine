import { WorkflowActionFactory, IWorkflowActionFactory } from "@jss-rule-engine/workflow";
import sendMessage from "./actions/sendMessage";
import sendOptions from "./actions/sendOptions";

export class ChatActionFactory extends WorkflowActionFactory implements IWorkflowActionFactory {
  constructor() {
    super();
    //this.registerAction("ChatAction", sendMessage);
    //this.registerAction("ChatAction2", sendOptions);
  }
}