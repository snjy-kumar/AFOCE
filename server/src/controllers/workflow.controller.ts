/**
 * AFOCE Workflow Controllers
 * 
 * HTTP controllers for workflow operations
 */

import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../types/index.js';
import { workflowOrchestrator } from '../services/workflow/orchestrator.service.js';
import { ruleManagementService } from '../services/workflow/rule-engine.service.js';
import { auditLogger } from '../services/workflow/audit-logger.service.js';
import { jobQueueService } from '../services/workflow/job-queue.service.js';
import prisma from '../lib/prisma.js';
import { ApiError } from '../middleware/errorHandler.js';
import type { RoleType } from '../generated/prisma/client.js';

// ============================================
// INVOICE WORKFLOW ENDPOINTS
// ============================================

/**
 * Submit invoice for approval
 * POST /api/invoices/:id/submit-for-approval
 */
export const submitInvoiceForApproval = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const user = req.user!; // From auth middleware

    const result = await workflowOrchestrator.submitInvoiceForApproval({
      userId: user.userId,
      userEmail: user.email,
      userRoles: user.roles as RoleType[],
      invoiceId: id,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Approve invoice
 * POST /api/invoices/:id/approve
 */
export const approveInvoice = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const result = await workflowOrchestrator.approveInvoice({
      userId: user.userId,
      userEmail: user.email,
      userRoles: user.roles as RoleType[],
      invoiceId: id,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reject invoice
 * POST /api/invoices/:id/reject
 */
export const rejectInvoice = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const user = req.user!;

    const result = await workflowOrchestrator.rejectInvoice({
      userId: user.userId,
      userEmail: user.email,
      userRoles: user.roles as RoleType[],
      invoiceId: id,
      reason,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get available actions for invoice
 * GET /api/invoices/:id/actions
 */
export const getInvoiceActions = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const actions = await workflowOrchestrator.getInvoiceActions({
      userId: user.userId,
      userRoles: user.roles as RoleType[],
      invoiceId: id,
    });

    res.json({
      success: true,
      data: actions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Transition invoice to specific state
 * POST /api/invoices/:id/transition
 */
export const transitionInvoice = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { toState, reason } = req.body;
    const user = req.user!;

    const result = await workflowOrchestrator.transitionInvoice({
      userId: user.userId,
      userEmail: user.email,
      userRoles: user.roles as RoleType[],
      invoiceId: id,
      toState,
      reason,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// BUSINESS RULES ENDPOINTS
// ============================================

/**
 * Get all business rules
 * GET /api/workflow/rules
 */
export const getBusinessRules = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { entityType, isActive } = req.query;

    const rules = await ruleManagementService.listRules({
      entityType: entityType as any,
      isActive: isActive === 'true',
    });

    res.json({
      success: true,
      data: rules,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create business rule
 * POST /api/workflow/rules
 */
export const createBusinessRule = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user!;
    const ruleData = req.body;

    const rule = await ruleManagementService.createRule(
      ruleData,
      user.userId
    );

    res.status(201).json({
      success: true,
      data: rule,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update business rule
 * PATCH /api/workflow/rules/:id
 */
export const updateBusinessRule = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const rule = await ruleManagementService.updateRule(id, updates);

    res.json({
      success: true,
      data: rule,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete business rule
 * DELETE /api/workflow/rules/:id
 */
export const deleteBusinessRule = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    await ruleManagementService.deleteRule(id);

    res.json({
      success: true,
      message: 'Rule deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Test business rule
 * POST /api/workflow/rules/:id/test
 */
export const testBusinessRule = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { testData } = req.body;

    const result = await ruleManagementService.testRule(id, testData);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// AUDIT LOG ENDPOINTS
// ============================================

/**
 * Get audit logs
 * GET /api/workflow/audit-logs
 */
export const getAuditLogs = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { 
      entityType, 
      entityId, 
      action, 
      actorId,
      startDate,
      endDate,
      page = '1',
      limit = '50'
    } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const where: any = {};
    
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;
    if (action) where.action = action;
    if (actorId) where.actorId = actorId;
    
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = new Date(startDate as string);
      if (endDate) where.timestamp.lte = new Date(endDate as string);
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          actor: {
            select: {
              id: true,
              email: true,
              businessName: true,
            },
          },
        },
        orderBy: { timestamp: 'desc' },
        skip,
        take,
      }),
      prisma.auditLog.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          total,
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          totalPages: Math.ceil(total / parseInt(limit as string)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get entity history
 * GET /api/workflow/audit-logs/entity/:entityType/:entityId
 */
export const getEntityHistory = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { entityType, entityId } = req.params;

    const history = await auditLogger.getEntityHistory(
      entityType as any,
      entityId
    );

    res.json({
      success: true,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate compliance report
 * POST /api/workflow/audit-logs/compliance-report
 */
export const generateComplianceReport = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate } = req.body;

    const report = await auditLogger.generateComplianceReport({
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// JOB QUEUE ENDPOINTS
// ============================================

/**
 * Get queue statistics
 * GET /api/workflow/queues/stats
 */
export const getQueueStats = async (
  _req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const stats = await jobQueueService.getQueueStats('workflow-jobs');

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get job status
 * GET /api/workflow/jobs/:jobId
 */
export const getJobStatus = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { jobId } = req.params;

    const job = await jobQueueService.getJobStatus(jobId);

    if (!job) {
      throw new ApiError(404, 'NOT_FOUND', 'Job not found');
    }

    res.json({
      success: true,
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retry failed job
 * POST /api/workflow/jobs/:jobId/retry
 */
export const retryJob = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { jobId } = req.params;

    // Get job from database
    const job = await prisma.jobQueue.findUnique({
      where: { jobId },
    });

    if (!job) {
      throw new ApiError(404, 'NOT_FOUND', 'Job not found');
    }

    if (job.status !== 'FAILED') {
      throw new ApiError(400, 'INVALID_STATE', 'Only failed jobs can be retried');
    }

    // Re-queue the job
    await jobQueueService.requeueJob(job);

    res.json({
      success: true,
      message: 'Job requeued successfully',
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// NOTIFICATIONS ENDPOINTS
// ============================================

/**
 * Get user notifications
 * GET /api/workflow/notifications
 */
export const getUserNotifications = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user!;
    const { status, type, page = '1', limit = '20' } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const where: any = { userId: user.userId };
    if (status) where.status = status;
    if (type) where.type = type;

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: [
          { createdAt: 'desc' },
        ],
        skip,
        take,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: {
          userId: user.userId,
          status: { in: ['PENDING', 'SENT'] },
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
        pagination: {
          total,
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          totalPages: Math.ceil(total / parseInt(limit as string)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark notification as read
 * PATCH /api/workflow/notifications/:id/read
 */
export const markNotificationRead = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const notification = await prisma.notification.update({
      where: {
        id,
        userId: user.userId, // Ensure user owns notification
      },
      data: {
        status: 'READ',
        readAt: new Date(),
      },
    });

    res.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark all notifications as read
 * POST /api/workflow/notifications/mark-all-read
 */
export const markAllNotificationsRead = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user!;

    const result = await prisma.notification.updateMany({
      where: {
        userId: user.userId,
        status: { in: ['PENDING', 'SENT'] },
      },
      data: {
        status: 'READ',
        readAt: new Date(),
      },
    });

    res.json({
      success: true,
      message: `Marked ${result.count} notifications as read`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete notification
 * DELETE /api/workflow/notifications/:id
 */
export const deleteNotification = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const user = req.user!;

    await prisma.notification.delete({
      where: {
        id,
        userId: user.userId,
      },
    });

    res.json({
      success: true,
      message: 'Notification deleted',
    });
  } catch (error) {
    next(error);
  }
};
