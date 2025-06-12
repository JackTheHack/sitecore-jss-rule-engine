import { IWorkflowAction } from '../actionFactory';
import { WorkflowAction, WorkflowExecutionContext } from '../workflowTypes';
import { MailService, EmailOptions } from '../lib/nodemailer';

/* interface EmailFields {
    to: string;
    subject: string;
    text?: string;
    html?: string;
} */

export class EmailAction implements IWorkflowAction {
    private mailgunService: MailService;

    constructor() {
        this.mailgunService = MailService.getInstance();
    }

    async execute(action: WorkflowAction, _context: WorkflowExecutionContext): Promise<void> {
        const { fields } = action;
        
        console.log('Running EmailAction', fields);

        const emailOptions: EmailOptions = {
            from: fields["From"] ||'',
            to: fields["To"] || '',
            subject: fields["Subject"] || '',
            text: fields["HtmlTemplate"],
            html: fields["HtmlTemplate"]
        };

        console.log('Email options - ', emailOptions)

        await this.mailgunService.sendEmail(emailOptions);
    }
} 