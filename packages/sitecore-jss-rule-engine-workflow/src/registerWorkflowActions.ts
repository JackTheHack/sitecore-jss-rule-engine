import { IWorkflowActionFactory } from './actionFactory';
import { ConditionAction } from './actions/conditionAction';
import { EmailAction } from './actions/emailAction';
import { WaitAction } from './actions/waitAction';

export function registerWorkflowActions(actionFactory: IWorkflowActionFactory): void {
    actionFactory.registerAction('{DE1A6157-8D0F-42CA-8951-941E8AF1BB82}', EmailAction);
    actionFactory.registerAction('{F3F30F6B-2590-4588-8754-021F350A6FBF}', WaitAction);
    actionFactory.registerAction('{634D3227-1D66-477B-B4B2-5820F206A412}', ConditionAction);
}