import { IDatabaseService } from './databaseService';
import { Workflow, WorkflowState, WorkflowExecutionContext, WorkflowServiceOptions, IWorkflowService, WorkflowExecutionResult, WorkflowExecutionOptions, WorkflowScheduledTaskParams } from './workflowTypes';
import { AddScheduledTaskParams } from './databaseService';
import {sitecoreQuery } from './workflowQuery';

export class WorkflowService implements IWorkflowService {
    private workflows: Record<string, Workflow> = {};
    private databaseService: IDatabaseService;
    private options: WorkflowServiceOptions;

    constructor(options: WorkflowServiceOptions) {
        this.options = options;
        this.databaseService = options.databaseService;
    }
    
    async addScheduledTask(params: WorkflowScheduledTaskParams): Promise<void> {
        const dbParams: AddScheduledTaskParams = {
            id: params.taskId,
            visitorId: params.visitorId,
            workflowId: params.workflowId,
            taskType: params.triggerType,
            scheduledTime: params.scheduledTime,
            payload: params.triggerParameters
        };
        await this.databaseService.addScheduledTask(dbParams);
    }
    
    getWorkflow(workflowId: string): Workflow | null {
        const id = this.cleanId(workflowId);        
        return this.workflows[id] || null;
    }
    
    async init(): Promise<void> {
        await this.databaseService.init();
    }

    async load(workflowConfig: Workflow): Promise<void> {
        this.workflows[workflowConfig.id] = workflowConfig;
        console.log('Loaded ', workflowConfig.id)
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

    cleanId(id: string){

        if(!id)
        {
            return id;
        }

        return id.replace(/[{}]/g, '').replace(/-/g, '');
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

        currentStateId = this.cleanId(currentStateId);

        const cleanWorkflowId = this.cleanId(options.workflowId);

        console.log('Workflows - ', this.workflows);

        const workflow = this.workflows[cleanWorkflowId];        

        if (!workflow) throw new Error('Workflow not found for the state '+ currentStateId + ' ' + options.workflowId);

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
            workflowId: this.cleanId(workflow.id),
            stateId: currentStateId,
        } as WorkflowExecutionResult;

        try{            
            const state = workflow.states[currentStateId];

            if(!state){
                throw new Error("Can't find the state in workflow "+ currentStateId);
            }

            console.log(`Checking ${state.id} triggers - ${state.triggers?.length}`);
            for (const trigger of state.triggers) {
                console.log(`Processing ${trigger.id}. Has condition - ${trigger.condition != null}`);
                console.log(trigger.condition);
                if (!trigger.condition || await evaluateCondition(trigger.condition, workflowContext)) {
                    console.log(`Trigger ${trigger.id} condition is true. Executing actions.`);
                    await this.executeActions(options.visitorId, workflowContext, state);
                } else {
                    console.log('Trigger condition is false - skipping trigger');
                }
            }
            result.clientCommands = workflowContext.clientCommands;
            return result;
        }catch(ex){
            console.log('Error - ',ex);
            result.success = false;
        }

        return result;
    }

    async executeActions(visitorId: string, workflowExecutionContext: WorkflowExecutionContext, state: WorkflowState): Promise<void> {
        console.log(`Executing actions - ${state?.actions?.length}`);

        if(!state)
        {
            return;
        }

        for (const action of state.actions) {
            if (!action.condition || await evaluateCondition(action.condition, workflowExecutionContext)) {
                console.log(`Executing action ${action.id}`);
                const actionCommand = this.options.actionFactory.getAction(action.templateId);

                if(actionCommand)
                {
                    await actionCommand.execute(workflowExecutionContext);
                } else {
                    console.warn('Action command not found', action.templateId);
                }

                if (action.nextStateId) {
                    console.log(`Changing visitor ${visitorId} state to ${action.nextStateId}`);
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

    async parseGraphQLResponse(response: any): Promise<Workflow> {
        const item = response?.data?.item;

        if(!item)
        {
            console.warn("Can't find valid GraphQL response");
            throw new Error("Invalid GraphQL response");
        }

        const workflow: Workflow = {
            id: this.cleanId(item.id),
            name: item.name,
            states: {},
            defaultStateId: this.cleanId(item.field?.value) // Remove curly braces from GUID
        };

        // Process each state
        item.stateItems.results.forEach((stateItem: any) => {
            console.log("Parsing state - ", stateItem?.id);
            const state: WorkflowState = {
                id: this.cleanId(stateItem.id),
                name: stateItem.name,
                triggers: [],
                actions: []
            };

            // Process children (triggers and actions)
            stateItem.children.results.forEach((child: any) => {
                console.log("Parsing state child item - ", child?.id);
                const fields = child.fields.reduce((acc: Record<string, string>, field: any) => {
                    acc[field.name] = field.value;
                    return acc;
                }, {});

                if (child.template.name === 'Trigger') {
                    state.triggers.push({
                        id: this.cleanId(child.id),
                        name: child.name,
                        type: 'trigger',
                        templateId: this.cleanId(child.template.id),
                        condition: fields.Condition || '',
                        fields: fields
                    });
                } else {
                    state.actions.push({
                        id: this.cleanId(child.id),
                        name: child.name,
                        templateId: this.cleanId(child.template.id),
                        condition: fields.Condition || '',
                        nextStateId: this.cleanId(fields.NextState) || undefined,
                        fields: fields
                    });
                }
            });

            workflow.states[state.id] = state;
        });

        console.log("Parsed workflow - ", workflow.id);

        return workflow;
    }

    async getSitecoreQuery(path: string, language: string): Promise<string> {
        return await sitecoreQuery(path, language);
    }
}

async function evaluateCondition(
    condition: string,
    context: WorkflowExecutionContext
): Promise<boolean> {
    try {
        const ruleEngineContext = context.ruleEngine?.getRuleEngineContext();   
                     
        console.log('Evaluating condition.');
        const result = await context.ruleEngine?.parseAndRunRule(condition, ruleEngineContext);
        console.log('Result - ', result);
        return result ? result : false;
    } catch (error) {
        return false;
    }
}

export default WorkflowService;