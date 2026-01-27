import { Router, Response } from 'express';
import { emailQueueService } from '../services/emailQueue.service.js';
import { AuthenticatedRequest } from '../types/index.js';

const router = Router();

/**
 * @swagger
 * /api/email-queue/stats:
 *   get:
 *     summary: Get email queue statistics
 *     tags: [Email Queue]
 *     responses:
 *       200:
 *         description: Queue statistics
 */
router.get('/stats', async (_req: AuthenticatedRequest, res: Response) => {
    const stats = await emailQueueService.getQueueStats();
    res.json(stats);
});

/**
 * @swagger
 * /api/email-queue/jobs:
 *   get:
 *     summary: Get recent email jobs
 *     tags: [Email Queue]
 *     parameters:
 *       - in: query
 *         name: count
 *         schema:
 *           type: number
 *         description: Number of jobs to retrieve
 */
router.get('/jobs', async (req: AuthenticatedRequest, res: Response) => {
    const count = parseInt(req.query.count as string) || 20;
    const jobs = await emailQueueService.getRecentJobs(count);
    res.json(jobs);
});

/**
 * @swagger
 * /api/email-queue/jobs/{jobId}/retry:
 *   post:
 *     summary: Retry a failed email job
 *     tags: [Email Queue]
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 */
router.post('/jobs/:jobId/retry', async (req: AuthenticatedRequest, res: Response) => {
    const success = await emailQueueService.retryJob(req.params.jobId);
    if (success) {
        res.json({ message: 'Job queued for retry' });
    } else {
        res.status(404).json({ error: 'Job not found' });
    }
});

/**
 * @swagger
 * /api/email-queue/clean:
 *   post:
 *     summary: Clean old jobs from the queue
 *     tags: [Email Queue]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               olderThanDays:
 *                 type: number
 */
router.post('/clean', async (req: AuthenticatedRequest, res: Response) => {
    const days = req.body.olderThanDays || 7;
    await emailQueueService.cleanOldJobs(days * 24 * 3600 * 1000);
    res.json({ message: `Cleaned jobs older than ${days} days` });
});

/**
 * @swagger
 * /api/email-queue/pause:
 *   post:
 *     summary: Pause the email queue
 *     tags: [Email Queue]
 */
router.post('/pause', async (_req: AuthenticatedRequest, res: Response) => {
    await emailQueueService.pauseQueue();
    res.json({ message: 'Email queue paused' });
});

/**
 * @swagger
 * /api/email-queue/resume:
 *   post:
 *     summary: Resume the email queue
 *     tags: [Email Queue]
 */
router.post('/resume', async (_req: AuthenticatedRequest, res: Response) => {
    await emailQueueService.resumeQueue();
    res.json({ message: 'Email queue resumed' });
});

/**
 * @swagger
 * /api/email-queue/test:
 *   post:
 *     summary: Send a test email via queue
 *     tags: [Email Queue]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - to
 *             properties:
 *               to:
 *                 type: string
 */
router.post('/test', async (req: AuthenticatedRequest, res: Response) => {
    const { to } = req.body;
    if (!to) {
        res.status(400).json({ error: 'Email address required' });
        return;
    }

    const job = await emailQueueService.addJob({
        type: 'generic',
        to,
        data: {
            subject: 'Test Email from AFOCE',
            html: `
                <h1>Test Email</h1>
                <p>This is a test email from AFOCE email queue.</p>
                <p>Sent at: ${new Date().toISOString()}</p>
            `,
            text: `Test Email\n\nThis is a test email from AFOCE email queue.\n\nSent at: ${new Date().toISOString()}`,
        },
    });

    res.json({ message: 'Test email queued', jobId: job.id });
});

export default router;
