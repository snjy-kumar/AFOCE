import { Queue, Worker, Job, QueueEvents } from 'bullmq';
import Redis from 'ioredis';
import emailService from './email.service.js';

/**
 * Email Queue Service - Handles async email sending with BullMQ
 * Features: Retry on failure, rate limiting, job logging, and priority
 */

// Redis connection - use env or fallback to default
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const connection = new Redis.default(redisUrl, {
    maxRetriesPerRequest: null,
});

// Queue name
const QUEUE_NAME = 'email-queue';

// Email job types
export type EmailJobType = 
    | 'password-reset'
    | 'invoice-reminder'
    | 'payment-confirmation'
    | 'overdue-alert'
    | 'generic';

// Job data interfaces
interface BaseEmailJob {
    type: EmailJobType;
    to: string;
    priority?: number;
    retries?: number;
}

interface PasswordResetJob extends BaseEmailJob {
    type: 'password-reset';
    data: {
        resetToken: string;
        businessName: string;
    };
}

interface InvoiceReminderJob extends BaseEmailJob {
    type: 'invoice-reminder';
    data: {
        customerName: string;
        invoiceNumber: string;
        amount: string;
        dueDate: string;
        daysOverdue: number;
        paymentLink?: string;
    };
}

interface PaymentConfirmationJob extends BaseEmailJob {
    type: 'payment-confirmation';
    data: {
        customerName: string;
        invoiceNumber: string;
        amount: string;
        paymentDate: string;
        paymentMethod: string;
    };
}

interface OverdueAlertJob extends BaseEmailJob {
    type: 'overdue-alert';
    data: {
        businessName: string;
        overdueCount: number;
        totalOverdue: string;
        invoices: Array<{ number: string; customer: string; amount: string; daysOverdue: number }>;
    };
}

interface GenericEmailJob extends BaseEmailJob {
    type: 'generic';
    data: {
        subject: string;
        html: string;
        text: string;
    };
}

export type EmailJob = 
    | PasswordResetJob 
    | InvoiceReminderJob 
    | PaymentConfirmationJob 
    | OverdueAlertJob
    | GenericEmailJob;

// Create queue
const emailQueue = new Queue<EmailJob>(QUEUE_NAME, { 
    connection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000,
        },
        removeOnComplete: {
            age: 24 * 3600, // Keep completed jobs for 24 hours
            count: 1000,
        },
        removeOnFail: {
            age: 7 * 24 * 3600, // Keep failed jobs for 7 days
        },
    },
});

// Queue events for monitoring
const queueEvents = new QueueEvents(QUEUE_NAME, { connection });

queueEvents.on('completed', ({ jobId }) => {
    console.log(`✅ Email job ${jobId} completed`);
});

queueEvents.on('failed', ({ jobId, failedReason }) => {
    console.error(`❌ Email job ${jobId} failed: ${failedReason}`);
});

// Worker to process jobs
let worker: Worker<EmailJob> | null = null;

const processEmailJob = async (job: Job<EmailJob>) => {
    const { type, to, data } = job.data;
    console.log(`📧 Processing ${type} email to ${to} (Job ${job.id})`);

    switch (type) {
        case 'password-reset':
            return emailService.sendPasswordResetEmail(
                to,
                (data as PasswordResetJob['data']).resetToken,
                (data as PasswordResetJob['data']).businessName
            );

        case 'invoice-reminder':
            return emailService.sendInvoiceReminder(
                to,
                data as InvoiceReminderJob['data']
            );

        case 'payment-confirmation':
            return emailService.sendPaymentConfirmation(
                to,
                data as PaymentConfirmationJob['data']
            );

        case 'overdue-alert':
            return emailService.sendOverdueAlert(
                to,
                data as OverdueAlertJob['data']
            );

        case 'generic':
            return emailService.sendEmail(
                to,
                data as GenericEmailJob['data']
            );

        default:
            throw new Error(`Unknown email job type: ${type}`);
    }
};

export const emailQueueService = {
    /**
     * Start the email worker
     */
    startWorker() {
        if (worker) {
            console.log('⚠️ Email worker already running');
            return;
        }

        worker = new Worker<EmailJob>(QUEUE_NAME, processEmailJob, {
            connection,
            concurrency: 5, // Process 5 emails at a time
            limiter: {
                max: 100, // Max 100 emails
                duration: 60000, // Per minute (rate limiting)
            },
        });

        worker.on('completed', (job) => {
            console.log(`✅ Email sent successfully: ${job.data.type} to ${job.data.to}`);
        });

        worker.on('failed', (job, err) => {
            console.error(`❌ Email failed: ${job?.data.type} to ${job?.data.to}`, err.message);
        });

        console.log('📧 Email queue worker started');
    },

    /**
     * Stop the email worker
     */
    async stopWorker() {
        if (worker) {
            await worker.close();
            worker = null;
            console.log('📧 Email queue worker stopped');
        }
    },

    /**
     * Add email job to queue
     */
    async addJob(jobData: EmailJob, options?: { priority?: number; delay?: number }) {
        const job = await emailQueue.add(jobData.type, jobData, {
            priority: options?.priority ?? jobData.priority ?? 0,
            delay: options?.delay ?? 0,
        });
        console.log(`📥 Email job ${job.id} added: ${jobData.type} to ${jobData.to}`);
        return job;
    },

    /**
     * Queue password reset email
     */
    async queuePasswordReset(to: string, resetToken: string, businessName: string) {
        return this.addJob({
            type: 'password-reset',
            to,
            priority: 10, // High priority
            data: { resetToken, businessName },
        });
    },

    /**
     * Queue invoice reminder email
     */
    async queueInvoiceReminder(
        to: string,
        data: InvoiceReminderJob['data']
    ) {
        return this.addJob({
            type: 'invoice-reminder',
            to,
            priority: 5,
            data,
        });
    },

    /**
     * Queue payment confirmation email
     */
    async queuePaymentConfirmation(
        to: string,
        data: PaymentConfirmationJob['data']
    ) {
        return this.addJob({
            type: 'payment-confirmation',
            to,
            priority: 8,
            data,
        });
    },

    /**
     * Queue overdue alert email
     */
    async queueOverdueAlert(
        to: string,
        data: OverdueAlertJob['data']
    ) {
        return this.addJob({
            type: 'overdue-alert',
            to,
            priority: 3,
            data,
        });
    },

    /**
     * Queue bulk emails (for batch operations)
     */
    async queueBulkEmails(jobs: EmailJob[]) {
        const addedJobs = await Promise.all(
            jobs.map((job) => this.addJob(job))
        );
        console.log(`📥 ${addedJobs.length} bulk email jobs queued`);
        return addedJobs;
    },

    /**
     * Get queue statistics
     */
    async getQueueStats() {
        const [waiting, active, completed, failed, delayed] = await Promise.all([
            emailQueue.getWaitingCount(),
            emailQueue.getActiveCount(),
            emailQueue.getCompletedCount(),
            emailQueue.getFailedCount(),
            emailQueue.getDelayedCount(),
        ]);

        return {
            waiting,
            active,
            completed,
            failed,
            delayed,
            total: waiting + active + delayed,
        };
    },

    /**
     * Get recent jobs
     */
    async getRecentJobs(count = 20) {
        const [completed, failed, waiting] = await Promise.all([
            emailQueue.getCompleted(0, count / 2),
            emailQueue.getFailed(0, count / 4),
            emailQueue.getWaiting(0, count / 4),
        ]);

        return {
            completed: completed.map((j) => ({
                id: j.id,
                type: j.data.type,
                to: j.data.to,
                finishedOn: j.finishedOn,
            })),
            failed: failed.map((j) => ({
                id: j.id,
                type: j.data.type,
                to: j.data.to,
                failedReason: j.failedReason,
            })),
            waiting: waiting.map((j) => ({
                id: j.id,
                type: j.data.type,
                to: j.data.to,
            })),
        };
    },

    /**
     * Retry failed job
     */
    async retryJob(jobId: string) {
        const job = await emailQueue.getJob(jobId);
        if (job) {
            await job.retry();
            console.log(`🔄 Retrying email job ${jobId}`);
            return true;
        }
        return false;
    },

    /**
     * Clean old jobs
     */
    async cleanOldJobs(olderThanMs: number = 7 * 24 * 3600 * 1000) {
        await emailQueue.clean(olderThanMs, 1000, 'completed');
        await emailQueue.clean(olderThanMs, 1000, 'failed');
        console.log('🧹 Cleaned old email queue jobs');
    },

    /**
     * Pause the queue
     */
    async pauseQueue() {
        await emailQueue.pause();
        console.log('⏸️ Email queue paused');
    },

    /**
     * Resume the queue
     */
    async resumeQueue() {
        await emailQueue.resume();
        console.log('▶️ Email queue resumed');
    },

    /**
     * Close connections (for graceful shutdown)
     */
    async close() {
        await this.stopWorker();
        await emailQueue.close();
        await queueEvents.close();
        await connection.quit();
        console.log('📧 Email queue connections closed');
    },
};

export default emailQueueService;
