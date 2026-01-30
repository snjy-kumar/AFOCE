/**
 * AFOCE Workflow Routes
 * 
 * Routes for workflow operations:
 * - Invoice approval workflows
 * - Business rules management
 * - Audit logs
 * - Job queues
 * - Notifications
 */

import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import * as workflowController from '../controllers/workflow.controller.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// ============================================
// INVOICE WORKFLOW ROUTES
// ============================================

/**
 * Submit invoice for approval
 * POST /api/workflow/invoices/:id/submit-for-approval
 */
router.post(
  '/invoices/:id/submit-for-approval',
  workflowController.submitInvoiceForApproval
);

/**
 * Approve invoice
 * POST /api/workflow/invoices/:id/approve
 */
router.post(
  '/invoices/:id/approve',
  workflowController.approveInvoice
);

/**
 * Reject invoice
 * POST /api/workflow/invoices/:id/reject
 */
router.post(
  '/invoices/:id/reject',
  workflowController.rejectInvoice
);

// ============================================
// EXPENSE WORKFLOW ROUTES
// ============================================

/**
 * Submit expense for approval
 * POST /api/workflow/expenses/:id/submit-for-approval
 */
router.post(
  '/expenses/:id/submit-for-approval',
  workflowController.submitExpenseForApproval
);

/**
 * Approve expense
 * POST /api/workflow/expenses/:id/approve
 */
router.post(
  '/expenses/:id/approve',
  workflowController.approveExpense
);

/**
 * Reject expense
 * POST /api/workflow/expenses/:id/reject
 */
router.post(
  '/expenses/:id/reject',
  workflowController.rejectExpense
);

/**
 * Get available actions for expense
 * GET /api/workflow/expenses/:id/actions
 */
router.get(
  '/expenses/:id/actions',
  workflowController.getExpenseActions
);

/**
 * Transition expense state
 * POST /api/workflow/expenses/:id/transition
 */
router.post(
  '/expenses/:id/transition',
  workflowController.transitionExpense
);

/**
 * Get available actions for invoice
 * GET /api/workflow/invoices/:id/actions
 */
router.get(
  '/invoices/:id/actions',
  workflowController.getInvoiceActions
);

/**
 * Transition invoice to specific state
 * POST /api/workflow/invoices/:id/transition
 */
router.post(
  '/invoices/:id/transition',
  workflowController.transitionInvoice
);

// ============================================
// BUSINESS RULES ROUTES
// ============================================

/**
 * Get all business rules
 * GET /api/workflow/rules
 */
router.get('/rules', workflowController.getBusinessRules);

/**
 * Create business rule
 * POST /api/workflow/rules
 */
router.post('/rules', workflowController.createBusinessRule);

/**
 * Update business rule
 * PATCH /api/workflow/rules/:id
 */
router.patch('/rules/:id', workflowController.updateBusinessRule);

/**
 * Delete business rule
 * DELETE /api/workflow/rules/:id
 */
router.delete('/rules/:id', workflowController.deleteBusinessRule);

/**
 * Test business rule
 * POST /api/workflow/rules/:id/test
 */
router.post('/rules/:id/test', workflowController.testBusinessRule);

// ============================================
// AUDIT LOGS ROUTES
// ============================================

/**
 * Get audit logs
 * GET /api/workflow/audit-logs
 */
router.get('/audit-logs', workflowController.getAuditLogs);

/**
 * Get entity history
 * GET /api/workflow/audit-logs/entity/:entityType/:entityId
 */
router.get(
  '/audit-logs/entity/:entityType/:entityId',
  workflowController.getEntityHistory
);

/**
 * Generate compliance report
 * POST /api/workflow/audit-logs/compliance-report
 */
router.post(
  '/audit-logs/compliance-report',
  workflowController.generateComplianceReport
);

// ============================================
// JOB QUEUE ROUTES
// ============================================

/**
 * Get queue statistics
 * GET /api/workflow/queues/stats
 */
router.get('/queues/stats', workflowController.getQueueStats);

/**
 * Get job status
 * GET /api/workflow/jobs/:jobId
 */
router.get('/jobs/:jobId', workflowController.getJobStatus);

/**
 * Retry failed job
 * POST /api/workflow/jobs/:jobId/retry
 */
router.post('/jobs/:jobId/retry', workflowController.retryJob);

// ============================================
// NOTIFICATIONS ROUTES
// ============================================

/**
 * Get user notifications
 * GET /api/workflow/notifications
 */
router.get('/notifications', workflowController.getUserNotifications);

/**
 * Mark notification as read
 * PATCH /api/workflow/notifications/:id/read
 */
router.patch(
  '/notifications/:id/read',
  workflowController.markNotificationRead
);

/**
 * Mark all notifications as read
 * POST /api/workflow/notifications/mark-all-read
 */
router.post(
  '/notifications/mark-all-read',
  workflowController.markAllNotificationsRead
);

/**
 * Delete notification
 * DELETE /api/workflow/notifications/:id
 */
router.delete('/notifications/:id', workflowController.deleteNotification);

export default router;
