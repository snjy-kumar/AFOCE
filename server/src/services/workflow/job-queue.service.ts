/**
 * AFOCE Background Job System with BullMQ
 * 
 * Distributed job queue for:
 * - Async notification delivery
 * - Scheduled tasks (overdue invoices, reminders)
 * - Report generation
 * - Data export/import
 * - Cleanup tasks
 * 
 * Features:
 * - Redis-backed persistent queue
 * - Automatic retry with exponential backoff
 * - Priority-based processing
 * - Job progress tracking
 * - Cron-based scheduling
 * - Dead letter queue for failed jobs
 */

import { Queue, Worker } from 'bullmq';
import { Redis } from 'ioredis';
import type { JobType } from '../../types/workflow.types.js';
import prisma from '../../lib/prisma.js';
import { notificationService } from './notification.service.js';

// ============================================
// REDIS CONNECTION
// ============================================

const redisConnection = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null, // Required for BullMQ
  enableReadyCheck: false,
});

// ============================================
// QUEUE DEFINITIONS
// ============================================

/**
 * Notification Queue - High priority, fast processing
 */
export const notificationQueue = new Queue('notifications', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000, // Start with 2 seconds
    },
    removeOnComplete: {
      age: 86400, // Keep completed jobs for 24 hours
      count: 1000,
    },
    removeOnFail: {
      age: 604800, // Keep failed jobs for 7 days
    },
  },
});

/**
 * Reports Queue - Lower priority, longer processing
 */
export const reportsQueue = new Queue('reports', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 2,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: {
      age: 3600, // 1 hour
      count: 100,
    },
  },
});

/**
 * Scheduled Tasks Queue - Cron-based jobs
 */
export const scheduledTasksQueue = new Queue('scheduled-tasks', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 10000,
    },
  },
});

// ============================================
// JOB WORKERS
// ============================================

/**
 * Notification Worker - Processes notification jobs
 */
const notificationWorker = new Worker(
  'notifications',
  async (job) => {
    const { type, data } = job.data;

    switch (type) {
      case 'SEND_EMAIL':
        await notificationService.send(data);
        break;

      case 'SEND_SMS':
        await notificationService.send({
          ...data,
          channels: ['SMS'],
        });
        break;

      default:
        throw new Error(`Unknown notification job type: ${type}`);
    }

    // Update job metadata
    await prisma.jobQueue.update({
      where: { jobId: job.id },
      data: {
        status: 'completed',
        completedAt: new Date(),
      },
    });
  },
  {
    connection: redisConnection,
    concurrency: 10, // Process 10 notifications in parallel
    limiter: {
      max: 100, // Max 100 jobs
      duration: 60000, // per minute (rate limiting)
    },
  }
);

/**
 * Reports Worker - Processes report generation jobs
 */
const reportsWorker = new Worker(
  'reports',
  async (job) => {
    const { type, data } = job.data;

    await job.updateProgress(10); // 10% progress

    switch (type) {
      case 'GENERATE_REPORT':
        // TODO: Implement report generation
        console.log('[ReportsWorker] Generating report:', data.reportType);
        await job.updateProgress(50);
        
        // Simulate report generation
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        await job.updateProgress(100);
        break;

      default:
        throw new Error(`Unknown report job type: ${type}`);
    }

    await prisma.jobQueue.update({
      where: { jobId: job.id },
      data: {
        status: 'completed',
        completedAt: new Date(),
        progress: 100,
      },
    });
  },
  {
    connection: redisConnection,
    concurrency: 2, // Process 2 reports at a time
  }
);

/**
 * Scheduled Tasks Worker - Processes cron jobs
 */
const scheduledTasksWorker = new Worker(
  'scheduled-tasks',
  async (job) => {
    const { type } = job.data;

    switch (type) {
      case 'DAILY_OVERDUE_CHECK':
        await processOverdueInvoices();
        break;

      case 'AUTO_REMINDER':
        await sendPaymentReminders();
        break;

      case 'MONTHLY_VAT_REPORT':
        await generateMonthlyVATReport();
        break;

      case 'CLEANUP_EXPIRED_NOTIFICATIONS':
        await cleanupExpiredNotifications();
        break;

      case 'BACKUP_DATABASE':
        await backupDatabase();
        break;

      default:
        throw new Error(`Unknown scheduled task type: ${type}`);
    }

    await prisma.jobQueue.update({
      where: { jobId: job.id },
      data: {
        status: 'completed',
        completedAt: new Date(),
      },
    });
  },
  {
    connection: redisConnection,
    concurrency: 1, // Sequential processing for scheduled tasks
  }
);

// ============================================
// SCHEDULED TASKS LOGIC
// ============================================

/**
 * Check for overdue invoices and update status
 */
async function processOverdueInvoices(): Promise<void> {
  console.log('[ScheduledTask] Processing overdue invoices...');

  const now = new Date();
  
  // Find invoices past due date with SENT or PARTIALLY_PAID status
  const overdueInvoices = await prisma.invoice.findMany({
    where: {
      status: {
        in: ['SENT', 'PARTIALLY_PAID'],
      },
      dueDate: {
        lt: now,
      },
    },
    include: {
      customer: true,
    },
  });

  console.log(`[ScheduledTask] Found ${overdueInvoices.length} overdue invoices`);

  for (const invoice of overdueInvoices) {
    try {
      // Update status to OVERDUE
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: 'OVERDUE' },
      });

      // Calculate days overdue
      const daysOverdue = Math.floor(
        (now.getTime() - invoice.dueDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Send notification
      await notificationService.send({
        userId: invoice.userId,
        type: 'INVOICE_OVERDUE',
        channels: ['IN_APP', 'EMAIL'],
        title: 'Invoice Overdue',
        message: `Invoice ${invoice.invoiceNumber} for ${invoice.customer.name} is ${daysOverdue} days overdue.`,
        entityType: 'INVOICE',
        entityId: invoice.id,
        actionUrl: `/invoices/${invoice.id}`,
        priority: 'URGENT',
      });

      console.log(`[ScheduledTask] Marked invoice ${invoice.invoiceNumber} as overdue`);
    } catch (error) {
      console.error(`[ScheduledTask] Error processing invoice ${invoice.id}:`, error);
    }
  }
}

/**
 * Send payment reminders for upcoming due dates
 */
async function sendPaymentReminders(): Promise<void> {
  console.log('[ScheduledTask] Sending payment reminders...');

  const now = new Date();
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  // Find invoices due within 3 days
  const upcomingInvoices = await prisma.invoice.findMany({
    where: {
      status: 'SENT',
      dueDate: {
        gte: now,
        lte: threeDaysFromNow,
      },
    },
    include: {
      customer: true,
    },
  });

  console.log(`[ScheduledTask] Found ${upcomingInvoices.length} invoices due soon`);

  for (const invoice of upcomingInvoices) {
    try {
      const daysUntilDue = Math.ceil(
        (invoice.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      await notificationService.send({
        userId: invoice.userId,
        type: 'INVOICE_OVERDUE',
        channels: ['IN_APP', 'EMAIL'],
        title: 'Payment Reminder',
        message: `Invoice ${invoice.invoiceNumber} for ${invoice.customer.name} is due in ${daysUntilDue} days.`,
        entityType: 'INVOICE',
        entityId: invoice.id,
        actionUrl: `/invoices/${invoice.id}`,
        priority: 'NORMAL',
      });

      console.log(`[ScheduledTask] Sent reminder for invoice ${invoice.invoiceNumber}`);
    } catch (error) {
      console.error(`[ScheduledTask] Error sending reminder for invoice ${invoice.id}:`, error);
    }
  }
}

/**
 * Generate monthly VAT report
 */
async function generateMonthlyVATReport(): Promise<void> {
  console.log('[ScheduledTask] Generating monthly VAT report...');
  // TODO: Implement VAT report generation
}

/**
 * Cleanup expired notifications
 */
async function cleanupExpiredNotifications(): Promise<void> {
  console.log('[ScheduledTask] Cleaning up expired notifications...');

  const now = new Date();

  const result = await prisma.notification.deleteMany({
    where: {
      expiresAt: {
        lt: now,
      },
      status: {
        in: ['SENT', 'READ'],
      },
    },
  });

  console.log(`[ScheduledTask] Deleted ${result.count} expired notifications`);
}

/**
 * Backup database
 */
async function backupDatabase(): Promise<void> {
  console.log('[ScheduledTask] Database backup triggered...');
  // TODO: Implement database backup (pg_dump to S3)
}

// ============================================
// JOB QUEUE SERVICE
// ============================================

export class JobQueueService {
  /**
   * Add notification job to queue
   */
  async queueNotification(
    type: 'SEND_EMAIL' | 'SEND_SMS',
    data: any,
    options?: {
      priority?: number;
      delay?: number;
    }
  ): Promise<string> {
    const job = await notificationQueue.add(type, {
      type,
      data,
    }, {
      priority: options?.priority || 10,
      delay: options?.delay,
    });

    // Track in database
    await prisma.jobQueue.create({
      data: {
        jobId: job.id!,
        queueName: 'notifications',
        jobType: type,
        payload: { type, data } as any,
        status: 'pending',
      },
    });

    return job.id!;
  }

  /**
   * Add report generation job
   */
  async queueReport(
    reportType: string,
    params: any,
    userId: string
  ): Promise<string> {
    const job = await reportsQueue.add('GENERATE_REPORT', {
      type: 'GENERATE_REPORT',
      data: { reportType, params },
      userId,
    });

    await prisma.jobQueue.create({
      data: {
        jobId: job.id!,
        queueName: 'reports',
        jobType: 'GENERATE_REPORT',
        payload: { reportType, params, userId } as any,
        status: 'pending',
      },
    });

    return job.id!;
  }

  /**
   * Schedule recurring job (cron)
   */
  async scheduleRecurring(
    type: JobType,
    cronPattern: string,
    data?: any
  ): Promise<void> {
    await scheduledTasksQueue.add(
      type,
      {
        type,
        data: data || {},
      },
      {
        repeat: {
          pattern: cronPattern,
        },
      }
    );

    console.log(`[JobQueue] Scheduled recurring job: ${type} (${cronPattern})`);
  }

  /**
   * Get job status
   */
  async getJobStatus(jobId: string): Promise<any> {
    const job = await prisma.jobQueue.findUnique({
      where: { jobId },
    });

    return job;
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(queueName: string): Promise<any> {
    const queue = queueName === 'notifications' 
      ? notificationQueue 
      : queueName === 'reports' 
      ? reportsQueue 
      : scheduledTasksQueue;

    const [waiting, active, completed, failed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
    ]);

    return {
      queueName,
      waiting,
      active,
      completed,
      failed,
      total: waiting + active + completed + failed,
    };
  }

  /**
   * Health check for Redis connection
   */
  async healthCheck(): Promise<boolean> {
    try {
      await redisConnection.ping();
      return true;
    } catch (error) {
      console.error('[JobQueue] Redis health check failed:', error);
      return false;
    }
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    console.log('[JobQueue] Closing workers and connections...');
    
    await Promise.all([
      notificationWorker.close(),
      reportsWorker.close(),
      scheduledTasksWorker.close(),
    ]);

    await Promise.all([
      notificationQueue.close(),
      reportsQueue.close(),
      scheduledTasksQueue.close(),
    ]);

    await redisConnection.quit();
    console.log('[JobQueue] All connections closed');
  }

  /**
   * Requeue a failed job
   */
  async requeueJob(job: any): Promise<void> {
    const queueName = job.queueName || 'notifications';
    let queue: Queue;

    switch (queueName) {
      case 'reports':
        queue = reportsQueue;
        break;
      case 'scheduled-tasks':
        queue = scheduledTasksQueue;
        break;
      default:
        queue = notificationQueue;
    }

    await queue.add(job.jobType, job.payload, {
      priority: job.priority,
    });

    // Update database
    await prisma.jobQueue.update({
      where: { id: job.id },
      data: {
        status: 'PENDING',
        attempts: 0,
      },
    });
  }
}

// ============================================
// INITIALIZE SCHEDULED JOBS
// ============================================

export async function initializeScheduledJobs(): Promise<void> {
  const jobQueue = new JobQueueService();

  // Daily overdue check at 9:00 AM
  await jobQueue.scheduleRecurring(
    'DAILY_OVERDUE_CHECK',
    '0 9 * * *'
  );

  // Payment reminders at 10:00 AM
  await jobQueue.scheduleRecurring(
    'AUTO_REMINDER',
    '0 10 * * *'
  );

  // Monthly VAT report on 1st of each month at 8:00 AM
  await jobQueue.scheduleRecurring(
    'MONTHLY_VAT_REPORT',
    '0 8 1 * *'
  );

  // Cleanup expired notifications daily at 2:00 AM
  await jobQueue.scheduleRecurring(
    'CLEANUP_EXPIRED_NOTIFICATIONS',
    '0 2 * * *'
  );

  // Database backup daily at 3:00 AM
  await jobQueue.scheduleRecurring(
    'BACKUP_DATABASE',
    '0 3 * * *'
  );

  console.log('[JobQueue] All scheduled jobs initialized');
}

// ============================================
// EVENT LISTENERS (for monitoring)
// ============================================

notificationWorker.on('completed', (job) => {
  console.log(`[NotificationWorker] Job ${job.id} completed`);
});

notificationWorker.on('failed', (job, error) => {
  console.error(`[NotificationWorker] Job ${job?.id} failed:`, error.message);
});

reportsWorker.on('completed', (job) => {
  console.log(`[ReportsWorker] Job ${job.id} completed`);
});

scheduledTasksWorker.on('completed', (job) => {
  console.log(`[ScheduledTasksWorker] Job ${job.id} completed`);
});

// Export singleton instance
export const jobQueueService = new JobQueueService();
