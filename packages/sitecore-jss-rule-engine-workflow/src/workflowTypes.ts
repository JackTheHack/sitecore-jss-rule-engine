
interface Workflow {
  id: string;
  states: Record<string, WorkflowState>;
}

interface WorkflowState {
  id: string;
  triggers: Trigger[];
  actions: Action[];
}

interface Trigger {
  condition: string;
}

interface Action {
  id: string;
  templateId: string;
  condition: string;
  nextStateId?: string;  
}

interface WorkflowVisitor {
    id: string;
}