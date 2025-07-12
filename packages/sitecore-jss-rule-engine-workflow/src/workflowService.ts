import { IDatabaseService, RAGItem } from './databaseService';
import { Workflow, WorkflowState, WorkflowExecutionContext, WorkflowServiceOptions, IWorkflowService, WorkflowExecutionResult, WorkflowExecutionOptions, WorkflowScheduledTaskParams, WorkflowAction, WorkflowActionSubitem, WorkflowTrigger } from './workflowTypes';
import { AddScheduledTaskParams } from './databaseService';
import { sitecoreQuery } from './graphql/workflowQuery';
import { cleanId } from './lib/helper';

export class WorkflowService implements IWorkflowService {
    private workflows: Record<string, Workflow> = {};
    private databaseService: IDatabaseService;
    private options: WorkflowServiceOptions;

    constructor(options: WorkflowServiceOptions) {
        this.options = options;
        this.databaseService = options.databaseService;
    }

    async findRelevantEmbeddings(data: string, indexId: string, topN: number, thresold: number): Promise<RAGItem[]> {        
        return await this.databaseService.findRelevantEmbeddings(data, indexId, topN, thresold);
    }
    
    async addScheduledTask(params: WorkflowScheduledTaskParams): Promise<void> {
        const dbParams: AddScheduledTaskParams = {
            id: cleanId(params.taskId),
            visitorId: cleanId(params.visitorId),
            workflowId: cleanId(params.workflowId),
            taskType: params.triggerType,
            scheduledTime: params.scheduledTime,
            payload: params.triggerParameters
        };
        await this.databaseService.addScheduledTask(dbParams);
    }
    
    getWorkflow(workflowId: string): Workflow | null {
        const id = cleanId(workflowId);        
        return this.workflows[id] || null;
    }
    
    async init(): Promise<void> {
        await this.databaseService.init();
    }

    

    async load(workflowConfig: Workflow): Promise<void> {
        this.workflows[cleanId(workflowConfig.id)] = workflowConfig;
        console.log('Loaded ', workflowConfig.id)
    }

    async addVisitorToState(
        workflowId: string,
        stateId: string,
        visitorId: string
    ): Promise<void> {
        const workflow = this.getWorkflow(workflowId);
        if (!workflow) throw new Error('Workflow not found');

        const state = workflow.states[cleanId(stateId)];
        if (!state) throw new Error('State not found');

        await this.databaseService.addVisitor(
            cleanId(visitorId), 
            cleanId(stateId), 
            cleanId(workflowId));
    }

    async executeTriggers(options: WorkflowExecutionOptions): Promise<WorkflowExecutionResult> {

        let currentStateId = await this.databaseService.getVisitorState(
            cleanId(options.visitorId), 
            cleanId(options.workflowId));        

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
                    newStateId: currentStateId                    
                } as WorkflowExecutionResult;
            }            

            await this.databaseService.addVisitor(
                cleanId(options.visitorId), 
                cleanId(currentStateId), 
                cleanId(options.workflowId));
        };

        if (!currentStateId) {
            throw new Error('Current state ID is null or undefined.');
        }

        currentStateId = cleanId(currentStateId);

        const cleanWorkflowId = cleanId(options.workflowId);

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
            metadata: {
                newStateId: currentStateId
            },
            ruleEngineContext: this.options.ruleEngineContext
        };

        const ruleEngineContext = this.options.ruleEngineContext ? this.options.ruleEngineContext : this.options.ruleEngine?.getRuleEngineContext();   
        ruleEngineContext?.sessionContext?.set('workflowContext', workflowContext);

        const result = {
            success: true,
            visitorId: options.visitorId,
            clientCommands: [],
            workflowId: cleanId(workflow.id),
            prevStateId: currentStateId,
            newStateId: currentStateId,
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

            result.newStateId = workflowContext.metadata.newStateId;

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
                await this.executeAction(visitorId, action, workflowExecutionContext);
            }
        }
    }

    async executeAction(visitorId: string, action: WorkflowAction, workflowExecutionContext: WorkflowExecutionContext): Promise<void> {
        console.log(`Executing action ${action.id}`);
        const actionCommand = this.options.actionFactory.getAction(action.templateId);

        if(actionCommand)
        {
            await actionCommand.execute(action, workflowExecutionContext);
        } else {
            console.warn('Action command not found', action.templateId);
        }

        if (action.nextStateId) {                                        
            await this.changeVisitorState(
                cleanId(visitorId), 
                cleanId(workflowExecutionContext.workflow?.id),
                cleanId(action.nextStateId),                         
                workflowExecutionContext);
        }
    }

    async removeVisitorFromWorkflow(visitorId: string, workflowId: string): Promise<void> {
        await this.databaseService.removeVisitor(
            cleanId(visitorId), 
            cleanId(workflowId));
    }

    async changeVisitorState(
        visitorId: string,
        workflowId: string,
        nextStateId: string,
        context: WorkflowExecutionContext
    ): Promise<void> {
        context.metadata.newStateId = cleanId(nextStateId);
        await this.databaseService.updateVisitorState(
            cleanId(visitorId), 
            cleanId(nextStateId), 
            cleanId(workflowId));
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
            id: cleanId(item.id),
            name: item.name,
            states: {},
            defaultStateId: cleanId(item.field?.value) // Remove curly braces from GUID
        };

        // Process each state
        item.stateItems.results.forEach((stateItem: any) => {
            console.log("Parsing state - ", stateItem?.id);
            const state: WorkflowState = {
                id: cleanId(stateItem.id),
                name: stateItem.name,
                triggers: [],
                actions: []
            };

            // Process children (triggers and actions)
            stateItem.children.results.forEach((child: any) => {                                
                const parsedItem = this.parseWorkflowItem(child);
                if (parsedItem) {
                    if (child.template.name === 'Trigger') {
                        state.triggers.push(parsedItem as WorkflowTrigger);
                    } else {
                        state.actions.push(parsedItem as WorkflowAction);
                    }
                }
            });

            workflow.states[state.id] = state;
        });

        console.log("Parsed workflow - ", workflow.id);

        return workflow;
    }

    parseWorkflowItem(child: any): WorkflowAction | WorkflowTrigger | null {

        const fields = child.fields.reduce((acc: Record<string, string>, field: any) => {
            acc[field.name] = field.value;
            return acc;
        }, {});

        const id = cleanId(child.id);
        const name = child.name;
        const templateId = child.template.id;

        if (child.template.name === 'Trigger') {
            const trigger: WorkflowTrigger = {
                id: id,
                name: name,
                type: 'trigger',
                templateId: templateId,
                condition: fields.Condition || '',
                fields: fields
            };
            return trigger;
        } else {
            // Map children items to actionObj.subitems with id, name, template (id, name), and fields (id, name, value)
            let subitems: WorkflowActionSubitem[] = [];
            if (child.children && child.children.results && Array.isArray(child.children.results)) {
                subitems = child.children.results.map((subitem: any) => ({
                    id: cleanId(subitem.id),
                    name: subitem.name,
                    templateId: subitem?.template?.id,
                    fields: Array.isArray(subitem.fields)
                        ? subitem.fields.map((field: any) => ({
                            id: field.id,
                            name: field.name,
                            value: field.value
                        }))
                        : []
                } as WorkflowActionSubitem));
            }

            const action: WorkflowAction = {
                id: id,
                name: name,
                templateId: templateId,
                condition: fields.Condition || '',
                nextStateId: cleanId(fields.NextState) || undefined,
                fields: fields,
                subitems: subitems
            };
            return action;
        }
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

        console.log('Evaluating condition.');
        const result = await context.ruleEngine?.parseAndRunRule(condition, context.ruleEngineContext);
        console.log('Result - ', result);
        return result ? result : false;
    } catch (error) {
        return false;
    }
}

export default WorkflowService;