import emailService from './email.service.js';

/**
 * Simple email service wrapper — no Redis/BullMQ queue.
 * Emails are sent directly (synchronously) via nodemailer.
 */
export const emailQueueService = {
    async queuePasswordReset(to: string, resetToken: string, businessName: string) {
        return emailService.sendPasswordResetEmail(to, resetToken, businessName);
    },

    async queueInvoiceReminder(to: string, data: {
        customerName: string;
        invoiceNumber: string;
        amount: string;
        dueDate: string;
        daysOverdue: number;
        paymentLink?: string;
    }) {
        return emailService.sendInvoiceReminder(to, data);
    },

    async queuePaymentConfirmation(to: string, data: {
        customerName: string;
        invoiceNumber: string;
        amount: string;
        paymentDate: string;
        paymentMethod: string;
    }) {
        return emailService.sendPaymentConfirmation(to, data);
    },

    async queueOverdueAlert(to: string, data: {
        businessName: string;
        overdueCount: number;
        totalOverdue: string;
        invoices: Array<{ number: string; customer: string; amount: string; daysOverdue: number }>;
    }) {
        return emailService.sendOverdueAlert(to, data);
    },

    async sendGeneric(to: string, subject: string, html: string, text: string) {
        return emailService.sendEmail(to, { subject, html, text });
    },

    // No-op close for compatibility
    async close() {
        // Nothing to close
    },
};

export default emailQueueService;
