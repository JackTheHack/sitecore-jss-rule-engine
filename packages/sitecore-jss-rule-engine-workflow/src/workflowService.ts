import { JssRuleEngine } from '@jss-rule-engine/core';
import { DatabaseService, DatabaseServiceOptions } from './databaseService';

interface WorkflowServiceOptions {
    db: DatabaseServiceOptions,
    ruleEngine: JssRuleEngine
}

export class WorkflowService {
    private workflows: Record<string, Workflow> = {};
    private databaseService: DatabaseService;
    private options: WorkflowServiceOptions;

    constructor(options: WorkflowServiceOptions) {
        this.options = options;
        this.databaseService = new DatabaseService(this.options.db);
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
        visitorId: string,
        executeActions: boolean
    ): Promise<void> {
        const workflow = this.workflows[workflowId];
        if (!workflow) throw new Error('Workflow not found');

        const state = workflow.states[stateId];
        if (!state) throw new Error('State not found');

        await this.databaseService.addVisitor(visitorId, stateId);

        if (executeActions) {
            await this.execute(visitorId);
        }
    }

    async execute(visitorId: string): Promise<void> {
        const currentStateId = await this.databaseService.getVisitorState(visitorId);
        if (!currentStateId) throw new Error('Visitor not assigned to any state');

        const workflow = Object.values(this.workflows).find((wf) =>
            Object.keys(wf.states).includes(currentStateId)
        );
        if (!workflow) throw new Error('Workflow not found for the state');

        const state = workflow.states[currentStateId];
        for (const trigger of state.triggers) {
            const visitorObject = {
                id: visitorId,
            };

            const workflowConditionContext = {
                ruleEngine: this.options.ruleEngine,
                visitor: visitorObject,
                workflowService: this,
            } as WorkflowConditionContext;

            if (await evaluateCondition(trigger.condition, workflowConditionContext)) {
                for (const action of state.actions) {
                    if (await evaluateCondition(action.condition, workflowConditionContext)) {
                        action.execute(visitorId);
                        if (action.nextStateId) {
                            await this.changeVisitorState(visitorId, action.nextStateId);
                        }
                    }
                }
            }
        }
    }

    async removeVisitorFromWorkflow(visitorId: string): Promise<void> {
        await this.databaseService.removeVisitor(visitorId);
    }

    async changeVisitorState(
        visitorId: string,
        nextStateId: string
    ): Promise<void> {
        await this.databaseService.updateVisitorState(visitorId, nextStateId);
    }

    async getStateVisitors(stateId: string): Promise<string[]> {
        return await this.databaseService.getStateVisitors(stateId);
    }
}

interface WorkflowConditionContext {
    workflowService?: WorkflowService;
    workflow?: Workflow;
    visitor?: WorkflowVisitor;
    ruleEngine?: JssRuleEngine;
}

async function evaluateCondition(
    condition: string,
    context: WorkflowConditionContext
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