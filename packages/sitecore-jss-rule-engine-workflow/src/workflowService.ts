import { IDatabaseService } from './databaseService';
import { Workflow, WorkflowState, WorkflowExecutionContext, WorkflowServiceOptions, IWorkflowService, WorkflowExecutionResult, WorkflowExecutionOptions } from './workflowTypes';

export class WorkflowService implements IWorkflowService {
    private workflows: Record<string, Workflow> = {};
    private databaseService: IDatabaseService;
    private options: WorkflowServiceOptions;

    constructor(options: WorkflowServiceOptions) {
        this.options = options;
        this.databaseService = options.databaseService;
    }       
    
    getWorkflow(workflowId: string): Workflow | null {
        return this.workflows[workflowId] || null;
    }
    
    async init(): Promise<void> {
        await this.databaseService.init();
    }

    async load(workflowConfig: Workflow): Promise<void> {
        this.workflows[workflowConfig.id] = workflowConfig;
    }

    async addVisitorToState(
        workflowId: string,
        stateId: string,
        visitorId: string
    ): Promise<void> {
        const workflow = this.workflows[workflowId];
        if (!workflow) throw new Error('Workflow not found');

        const state = workflow.states[stateId];
        if (!state) throw new Error('State not found');

        await this.databaseService.addVisitor(visitorId, stateId, workflowId);
    }

    async executeTriggers(options: WorkflowExecutionOptions): Promise<WorkflowExecutionResult> {
        let currentStateId = await this.databaseService.getVisitorState(options.visitorId, options.workflowId);
        
        if (!currentStateId) {
            //get default state
            currentStateId = options.defaultStateId ?? null;

            if(!currentStateId)
            {
                return {
                    success: true,
                    visitorId: options.visitorId,
                    clientCommands: [],
                    workflowId: options.workflowId,
                    stateId: currentStateId,
                } as WorkflowExecutionResult;
            }

            await this.databaseService.addVisitor(options.visitorId, currentStateId, options.workflowId);
        };

        if (!currentStateId) {
            throw new Error('Current state ID is null or undefined.');
        }

        const workflow = Object.values(this.workflows).find((wf) =>
            Object.keys(wf.states).includes(currentStateId as string)
        );

        if (!workflow) throw new Error('Workflow not found for the state');

        const visitorObject = {
            id: options.visitorId,
        };

        const workflowContext: WorkflowExecutionContext = {
            ruleEngine: this.options.ruleEngine,
            visitor: visitorObject,
            workflowService: this,
            workflow: workflow,
            clientCommands: [],
            trigger: options.eventName,
            triggerParameters: options.eventParameters,
        };

        const result = {
            success: true,
            visitorId: options.visitorId,
            clientCommands: [],
            workflowId: workflow.id,
            stateId: currentStateId,
        } as WorkflowExecutionResult;

        try{
            const state = workflow.states[currentStateId];
            for (const trigger of state.triggers) {
                if (await evaluateCondition(trigger.condition, workflowContext)) {
                    await this.executeActions(options.visitorId, workflowContext, state);
                }
            }
            result.clientCommands = workflowContext.clientCommands;
            return result;
        }catch(ex){
            result.success = false;
        }

        return result;
    }

    async executeActions(visitorId: string, workflowExecutionContext: WorkflowExecutionContext, state: WorkflowState): Promise<void> {
        for (const action of state.actions) {
            if (await evaluateCondition(action.condition, workflowExecutionContext)) {
                const actionCommand = this.options.actionFactory.getAction(action.templateId);
                await actionCommand.execute(workflowExecutionContext);

                if (action.nextStateId) {
                    await this.changeVisitorState(visitorId, action.nextStateId, workflowExecutionContext.workflow?.id);
                }
            }
        }
    }

    async removeVisitorFromWorkflow(visitorId: string, workflowId: string): Promise<void> {
        await this.databaseService.removeVisitor(visitorId, workflowId);
    }

    async changeVisitorState(
        visitorId: string,
        workflowId: string,
        nextStateId: string
    ): Promise<void> {
        await this.databaseService.updateVisitorState(visitorId, workflowId, nextStateId);
    }

    async getStateVisitors(workflowId: string, stateId: string): Promise<string[]> {
        return await this.databaseService.getStateVisitors(workflowId, stateId);
    }
}

async function evaluateCondition(
    condition: string,
    context: WorkflowExecutionContext
): Promise<boolean> {
    try {
        const ruleEngineContext = context.ruleEngine?.getRuleEngineContext();
        const result = await context.ruleEngine?.parseAndRunRule(condition, ruleEngineContext);
        return result ? result : false;
    } catch (error) {
        return false;
    }
}

export default WorkflowService;