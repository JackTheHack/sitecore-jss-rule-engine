export interface ActionCommand {
    execute(visitorId: string): Promise<void>;
}

export class EmailAction implements ActionCommand {
    async execute(visitorId: string): Promise<void> {
        console.log(`Sending email to visitor: ${visitorId}`);
        // Add email sending logic here
    }
}

export class LogAction implements ActionCommand {
    async execute(visitorId: string): Promise<void> {
        console.log(`Logging action for visitor: ${visitorId}`);
        // Add logging logic here
    }
}

export class ActionFactory {
    static getAction(templateId: string): ActionCommand {
        switch (templateId) {
            case 'email':
                return new EmailAction();
            case 'log':
                return new LogAction();
            default:
                throw new Error(`No action found for templateId: ${templateId}`);
        }
    }
}