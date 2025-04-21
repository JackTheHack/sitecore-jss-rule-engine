
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
  condition: any; // Replace with actual condition type
}

interface Action {
  id: string;
  condition: any; // Replace with actual condition type
  nextStateId?: string;
  execute(visitorId: string): void;
}

interface WorkflowVisitor {
    id: string;
}