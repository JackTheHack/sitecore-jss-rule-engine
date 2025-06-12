import formData from 'form-data';
import Mailgun from 'mailgun.js';

export interface MailgunEmailOptions {
    to: string;
    subject: string;
    text?: string;
    html?: string;
}

export class MailgunService {
    private static instance: MailgunService;
    private mailgun: Mailgun;
    private domain: string;
    private apiKey: string;

    private constructor() {
        this.mailgun = new Mailgun(formData);
        this.domain = process.env.MAILGUN_DOMAIN || '';
        this.apiKey = process.env.MAILGUN_API_KEY || '';
    }

    public static getInstance(): MailgunService {
        if (!MailgunService.instance) {
            MailgunService.instance = new MailgunService();
        }
        return MailgunService.instance;
    }

    public async sendEmail(options: MailgunEmailOptions): Promise<void> {
        if (!this.domain || !this.apiKey) {
            throw new Error('Mailgun configuration is missing');
        }

        if (!options.to || !options.subject || (!options.text && !options.html)) {
            throw new Error('Missing required email fields');
        }

        const mg = this.mailgun.client({
            username: 'api',
            key: this.apiKey
        });

        try {
            const messageData = {
                from: `Workflow <noreply@${this.domain}>`,
                to: options.to,
                subject: options.subject,
                template: 'default',
                'h:X-Mailgun-Variables': JSON.stringify({
                    text: options.text,
                    html: options.html
                })
            };

            await mg.messages.create(this.domain, messageData);
        } catch (error) {
            console.error('Failed to send email:', error);
            throw error;
        }
    }
}