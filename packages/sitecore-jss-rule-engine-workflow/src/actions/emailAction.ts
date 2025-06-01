import { IWorkflowAction } from '../actionFactory';
import { WorkflowExecutionContext } from '../workflowTypes';
import { MailgunService, EmailOptions } from '../lib/mailgun';

interface EmailFields {
    to: string;
    subject: string;
    text?: string;
    html?: string;
}

export class EmailAction implements IWorkflowAction {
    private mailgunService: MailgunService;

    constructor() {
        this.mailgunService = MailgunService.getInstance();
    }

    async execute(context: WorkflowExecutionContext): Promise<void> {
        const { fields } = context.workflow.states[context.workflow.defaultStateId || ''].actions.find(
            action => action.templateId === 'email-action'
        ) || { fields: {} as EmailFields };

        const emailOptions: EmailOptions = {
            to: fields.to || '',
            subject: fields.subject || '',
            text: fields.text,
            html: fields.html
        };

        await this.mailgunService.sendEmail(emailOptions);
    }
} 