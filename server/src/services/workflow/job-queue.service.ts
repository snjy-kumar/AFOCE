/**
 * Job Queue Service — simplified, database-backed (no Redis/BullMQ).
 * Jobs are tracked in the database. No background workers.
 */

import prisma from '../../lib/prisma.js';
import { notificationService } from './notification.service.js';

// ============================================
// SCHEDULED TASK LOGIC (called directly on demand)
// ============================================

export async function processOverdueInvoices(): Promise<void> {
    console.log('[Task] Processing overdue invoices...');
    const now = new Date();

    const overdueInvoices = await prisma.invoice.findMany({
        where: {
            status: { in: ['SENT', 'PARTIALLY_PAID'] },
            dueDate: { lt: now },
        },
        include: { customer: true },
    });

    console.log(`[Task] Found ${overdueInvoices.length} overdue invoices`);

    for (const invoice of overdueInvoices) {
        await prisma.invoice.update({
            where: { id: invoice.id },
            data: { status: 'OVERDUE' },
        });

        const daysOverdue = Math.floor(
            (now.getTime() - invoice.dueDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        await notificationService.send({
            userId: invoice.userId,
            type: 'INVOICE_OVERDUE',
            channels: ['IN_APP'],
            title: 'Invoice Overdue',
            message: `Invoice ${invoice.invoiceNumber} for ${invoice.customer.name} is ${daysOverdue} days overdue.`,
            entityType: 'INVOICE',
            entityId: invoice.id,
            actionUrl: `/invoices/${invoice.id}`,
            priority: 'URGENT',
        });
    }
}

export async function cleanupExpiredNotifications(): Promise<void> {
    const result = await prisma.notification.deleteMany({
        where: {
            expiresAt: { lt: new Date() },
            status: { in: ['SENT', 'READ'] },
        },
    });
    console.log(`[Task] Deleted ${result.count} expired notifications`);
}

// ============================================
// JOB QUEUE SERVICE
// ============================================

export class JobQueueService {
    /**
     * Get job status from database
     */
    async getJobStatus(jobId: string): Promise<any> {
        return prisma.jobQueue.findUnique({ where: { jobId } });
    }

    /**
     * Get queue statistics from database
     */
    async getQueueStats(_queueName: string): Promise<any> {
        const [pending, completed, failed] = await Promise.all([
            prisma.jobQueue.count({ where: { status: 'PENDING' } }),
            prisma.jobQueue.count({ where: { status: 'COMPLETED' } }),
            prisma.jobQueue.count({ where: { status: 'FAILED' } }),
        ]);
        return { pending, completed, failed };
    }

    /**
     * Requeue a failed job (mark as pending for manual retry)
     */
    async requeueJob(job: any): Promise<void> {
        await prisma.jobQueue.update({
            where: { id: job.id },
            data: { status: 'PENDING', attempts: 0 },
        });
    }

    /**
     * Health check — just verify DB connection works
     */
    async healthCheck(): Promise<boolean> {
        try {
            await prisma.$queryRaw`SELECT 1`;
            return true;
        } catch {
            return false;
        }
    }

    async shutdown(): Promise<void> {
        // Nothing to shut down
    }
}

// Export singleton
export const jobQueueService = new JobQueueService();

// Kept for backward-compat — no-op now
export async function initializeScheduledJobs(): Promise<void> {
    console.log('[JobQueue] Scheduled jobs skipped (no Redis/BullMQ in simplified mode)');
}
