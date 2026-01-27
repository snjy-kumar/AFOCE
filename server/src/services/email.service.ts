import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

/**
 * Email Service - Handles all email communications
 * Supports password reset, invoice reminders, payment confirmations, and overdue alerts
 */

// Email templates
const templates = {
    passwordReset: (resetUrl: string, businessName: string) => ({
        subject: 'Reset Your Password - AFOCE',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
                    .button { display: inline-block; background: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
                    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
                    .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 12px; border-radius: 6px; margin: 15px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1 style="margin: 0;">🔐 Password Reset</h1>
                    </div>
                    <div class="content">
                        <p>Hello,</p>
                        <p>We received a request to reset the password for your AFOCE account associated with <strong>${businessName}</strong>.</p>
                        <p>Click the button below to reset your password:</p>
                        <p style="text-align: center;">
                            <a href="${resetUrl}" class="button">Reset Password</a>
                        </p>
                        <div class="warning">
                            ⏰ This link will expire in <strong>1 hour</strong> for security reasons.
                        </div>
                        <p>If you didn't request this password reset, please ignore this email or contact support if you have concerns.</p>
                        <p>Best regards,<br>The AFOCE Team</p>
                    </div>
                    <div class="footer">
                        <p>AFOCE - Adaptive Financial Operations & Compliance Engine</p>
                        <p>This is an automated message. Please do not reply directly to this email.</p>
                    </div>
                </div>
            </body>
            </html>
        `,
        text: `
Password Reset Request

Hello,

We received a request to reset the password for your AFOCE account associated with ${businessName}.

Click the following link to reset your password:
${resetUrl}

This link will expire in 1 hour for security reasons.

If you didn't request this password reset, please ignore this email.

Best regards,
The AFOCE Team
        `.trim(),
    }),

    invoiceReminder: (data: {
        customerName: string;
        invoiceNumber: string;
        amount: string;
        dueDate: string;
        daysOverdue: number;
        paymentLink?: string;
    }) => ({
        subject: `Payment Reminder: Invoice ${data.invoiceNumber} - ${data.daysOverdue > 0 ? `${data.daysOverdue} Days Overdue` : 'Due Soon'}`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: ${data.daysOverdue > 0 ? '#dc2626' : '#f59e0b'}; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
                    .invoice-box { background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; }
                    .amount { font-size: 28px; font-weight: bold; color: #1e40af; }
                    .button { display: inline-block; background: #16a34a; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; }
                    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1 style="margin: 0;">📄 Payment Reminder</h1>
                    </div>
                    <div class="content">
                        <p>Dear ${data.customerName},</p>
                        <p>${data.daysOverdue > 0 
                            ? `This is a reminder that payment for the following invoice is <strong>${data.daysOverdue} days overdue</strong>.`
                            : 'This is a friendly reminder that the following invoice is due soon.'
                        }</p>
                        <div class="invoice-box">
                            <p><strong>Invoice Number:</strong> ${data.invoiceNumber}</p>
                            <p><strong>Amount Due:</strong> <span class="amount">${data.amount}</span></p>
                            <p><strong>Due Date:</strong> ${data.dueDate}</p>
                        </div>
                        ${data.paymentLink ? `
                        <p style="text-align: center;">
                            <a href="${data.paymentLink}" class="button">Pay Now</a>
                        </p>
                        ` : ''}
                        <p>If you have already made this payment, please disregard this reminder.</p>
                        <p>Thank you for your business!</p>
                    </div>
                    <div class="footer">
                        <p>Questions? Contact us at support@afoce.com</p>
                    </div>
                </div>
            </body>
            </html>
        `,
        text: `
Payment Reminder

Dear ${data.customerName},

${data.daysOverdue > 0 
    ? `This is a reminder that payment for invoice ${data.invoiceNumber} is ${data.daysOverdue} days overdue.`
    : `This is a friendly reminder that invoice ${data.invoiceNumber} is due soon.`
}

Invoice Number: ${data.invoiceNumber}
Amount Due: ${data.amount}
Due Date: ${data.dueDate}

${data.paymentLink ? `Pay now: ${data.paymentLink}` : ''}

If you have already made this payment, please disregard this reminder.

Thank you for your business!
        `.trim(),
    }),

    paymentConfirmation: (data: {
        customerName: string;
        invoiceNumber: string;
        amount: string;
        paymentDate: string;
        paymentMethod: string;
    }) => ({
        subject: `Payment Received: Invoice ${data.invoiceNumber} - Thank You!`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
                    .success-box { background: #dcfce7; border: 1px solid #16a34a; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
                    .checkmark { font-size: 48px; }
                    .amount { font-size: 28px; font-weight: bold; color: #16a34a; }
                    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1 style="margin: 0;">✅ Payment Confirmed</h1>
                    </div>
                    <div class="content">
                        <div class="success-box">
                            <div class="checkmark">✓</div>
                            <p class="amount">${data.amount}</p>
                            <p>Payment Received</p>
                        </div>
                        <p>Dear ${data.customerName},</p>
                        <p>Thank you! We have received your payment for invoice <strong>${data.invoiceNumber}</strong>.</p>
                        <table style="width: 100%; margin: 20px 0;">
                            <tr><td><strong>Invoice Number:</strong></td><td>${data.invoiceNumber}</td></tr>
                            <tr><td><strong>Amount Paid:</strong></td><td>${data.amount}</td></tr>
                            <tr><td><strong>Payment Date:</strong></td><td>${data.paymentDate}</td></tr>
                            <tr><td><strong>Payment Method:</strong></td><td>${data.paymentMethod}</td></tr>
                        </table>
                        <p>A receipt has been attached to this email for your records.</p>
                        <p>Thank you for your business!</p>
                    </div>
                    <div class="footer">
                        <p>AFOCE - Adaptive Financial Operations & Compliance Engine</p>
                    </div>
                </div>
            </body>
            </html>
        `,
        text: `
Payment Confirmed

Dear ${data.customerName},

Thank you! We have received your payment.

Invoice Number: ${data.invoiceNumber}
Amount Paid: ${data.amount}
Payment Date: ${data.paymentDate}
Payment Method: ${data.paymentMethod}

Thank you for your business!
        `.trim(),
    }),

    overdueAlert: (data: {
        businessName: string;
        overdueCount: number;
        totalOverdue: string;
        invoices: Array<{ number: string; customer: string; amount: string; daysOverdue: number }>;
    }) => ({
        subject: `⚠️ Overdue Alert: ${data.overdueCount} Invoices Need Attention`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #dc2626; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
                    .stat-box { background: #fef2f2; border: 1px solid #dc2626; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
                    .big-number { font-size: 36px; font-weight: bold; color: #dc2626; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
                    th { background: #f3f4f6; }
                    .button { display: inline-block; background: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; }
                    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1 style="margin: 0;">⚠️ Overdue Invoice Alert</h1>
                    </div>
                    <div class="content">
                        <p>Hello ${data.businessName},</p>
                        <div class="stat-box">
                            <div class="big-number">${data.overdueCount}</div>
                            <p>Overdue Invoices</p>
                            <div class="big-number">${data.totalOverdue}</div>
                            <p>Total Outstanding</p>
                        </div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Invoice</th>
                                    <th>Customer</th>
                                    <th>Amount</th>
                                    <th>Days Overdue</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.invoices.map(inv => `
                                    <tr>
                                        <td>${inv.number}</td>
                                        <td>${inv.customer}</td>
                                        <td>${inv.amount}</td>
                                        <td style="color: #dc2626; font-weight: bold;">${inv.daysOverdue} days</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                        <p style="text-align: center;">
                            <a href="${env.FRONTEND_URL}/invoices?status=overdue" class="button">View Overdue Invoices</a>
                        </p>
                    </div>
                    <div class="footer">
                        <p>AFOCE - Keeping your finances on track</p>
                    </div>
                </div>
            </body>
            </html>
        `,
        text: `
Overdue Invoice Alert

Hello ${data.businessName},

You have ${data.overdueCount} overdue invoices totaling ${data.totalOverdue}.

${data.invoices.map(inv => `${inv.number} - ${inv.customer} - ${inv.amount} (${inv.daysOverdue} days overdue)`).join('\n')}

Log in to AFOCE to take action on these invoices.
        `.trim(),
    }),
};

// Create transporter
const createTransporter = () => {
    // Support multiple email providers
    if (env.SMTP_HOST) {
        // Custom SMTP
        return nodemailer.createTransport({
            host: env.SMTP_HOST,
            port: env.SMTP_PORT || 587,
            secure: env.SMTP_SECURE || false,
            auth: {
                user: env.SMTP_USER,
                pass: env.SMTP_PASS,
            },
        });
    } else if (env.SENDGRID_API_KEY) {
        // SendGrid
        return nodemailer.createTransport({
            host: 'smtp.sendgrid.net',
            port: 587,
            auth: {
                user: 'apikey',
                pass: env.SENDGRID_API_KEY,
            },
        });
    } else {
        // Development: Use ethereal.email or console logging
        console.warn('⚠️ No email provider configured. Emails will be logged to console.');
        return null;
    }
};

let transporter: nodemailer.Transporter | null = null;

export const emailService = {
    /**
     * Initialize the email service
     */
    async initialize() {
        transporter = createTransporter();
        if (transporter) {
            try {
                await transporter.verify();
                console.log('✅ Email service initialized successfully');
            } catch (error) {
                console.error('❌ Email service initialization failed:', error);
                transporter = null;
            }
        }
    },

    /**
     * Send an email
     */
    async sendEmail(to: string, template: { subject: string; html: string; text: string }) {
        const mailOptions = {
            from: env.EMAIL_FROM || 'AFOCE <noreply@afoce.com>',
            to,
            subject: template.subject,
            html: template.html,
            text: template.text,
        };

        if (!transporter) {
            // Log to console in development
            console.log('\n📧 EMAIL (Development Mode)');
            console.log('To:', to);
            console.log('Subject:', template.subject);
            console.log('---');
            console.log(template.text);
            console.log('---\n');
            return { success: true, messageId: 'dev-' + Date.now() };
        }

        try {
            const result = await transporter.sendMail(mailOptions);
            console.log(`✅ Email sent to ${to}: ${result.messageId}`);
            return { success: true, messageId: result.messageId };
        } catch (error) {
            console.error(`❌ Failed to send email to ${to}:`, error);
            throw error;
        }
    },

    /**
     * Send password reset email
     */
    async sendPasswordResetEmail(email: string, resetToken: string, businessName: string) {
        const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${resetToken}`;
        const template = templates.passwordReset(resetUrl, businessName);
        return this.sendEmail(email, template);
    },

    /**
     * Send invoice reminder
     */
    async sendInvoiceReminder(
        email: string,
        data: {
            customerName: string;
            invoiceNumber: string;
            amount: string;
            dueDate: string;
            daysOverdue: number;
            paymentLink?: string;
        }
    ) {
        const template = templates.invoiceReminder(data);
        return this.sendEmail(email, template);
    },

    /**
     * Send payment confirmation
     */
    async sendPaymentConfirmation(
        email: string,
        data: {
            customerName: string;
            invoiceNumber: string;
            amount: string;
            paymentDate: string;
            paymentMethod: string;
        }
    ) {
        const template = templates.paymentConfirmation(data);
        return this.sendEmail(email, template);
    },

    /**
     * Send overdue alert to business owner
     */
    async sendOverdueAlert(
        email: string,
        data: {
            businessName: string;
            overdueCount: number;
            totalOverdue: string;
            invoices: Array<{ number: string; customer: string; amount: string; daysOverdue: number }>;
        }
    ) {
        const template = templates.overdueAlert(data);
        return this.sendEmail(email, template);
    },
};

export default emailService;
