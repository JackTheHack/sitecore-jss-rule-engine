import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";

export interface EmailOptions {
    from: string;
    to: string;
    subject: string;
    text?: string;
    html?: string;
}

export class MailService {

    private static instance: MailService;

    private smtpUrl: string;
    private smtpPort: number;
    private smtpUser: string;
    private smtpPassword: string;

    private constructor() {
        this.smtpUrl = process.env.SMTP_SERVER || '';
        this.smtpPort = Number.parseInt(process.env.SMTP_PORT || '2525');
        this.smtpUser = process.env.SMTP_USER || '';
        this.smtpPassword = process.env.SMTP_PASSWORD || '';
    }

    public static getInstance(): MailService {
        if (!MailService.instance) {
            MailService.instance = new MailService();
        }
        return MailService.instance;
    }

    public async sendEmail(options: EmailOptions): Promise<void> {
        if (!this.smtpUrl ) {
            throw new Error('Mail configuration is missing');
        }

        if (!options.to || !options.subject || (!options.text && !options.html)) {
            throw new Error('Missing required email fields');
        }

        try {

            const mailerOptions ={
                host: this.smtpUrl,
                port: this.smtpPort,
                auth: {
                    user: this.smtpUser,
                    pass: this.smtpPassword
                }
            } as SMTPTransport.Options;

            console.log('smtp options - ', mailerOptions)
           
            // Looking to send emails in production? Check out our Email API/SMTP product!
            var transporter = nodemailer.createTransport(mailerOptions);

            const mailOptions = {
                from: options.from,
                to: options.to,
                subject: options.subject,
                text: options.text, // or use html: 'HTML content'
                html: options.html
              };

              console.log('mail optiojns - ', mailOptions)

              transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                  console.log('Error sending email:', error);
                } else {
                  console.log('Email sent:', info.response);
                }
              });
        } catch (error) {
            console.error('Failed to send email:', error);
            throw error;
        }
    }
}