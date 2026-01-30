/**
 * AFOCE Workflow Orchestrator
 * 
 * High-level coordinator that orchestrates all workflow components:
 * - State Machine → Rule Engine → RBAC → Audit → Events → Notifications
 * 
 * This is the main API that controllers will use.
 * Provides simplified interface for complex workflow operations.
 */

import type { InvoiceStatus, ExpenseStatus, RoleType, EntityType } from '../../generated/prisma/client.js';
import { workflowStateMachine } from './state-machine.service.js';
import { ruleEngine } from './rule-engine.service.js';
import { rbacService } from './rbac.service.js';
import { auditLogger } from './audit-logger.service.js';
import { domainEvents } from './event-bus.service.js';
import { workflowTransactions } from './transaction-manager.service.js';
import prisma from '../../lib/prisma.js';
import { ApiError } from '../../middleware/errorHandler.js';
import type { TransitionContext, RuleEvaluationContext } from '../../types/workflow.types.js';

// ============================================
// WORKFLOW ORCHESTRATOR
// ============================================

export class WorkflowOrchestrator {
  /**
   * Create invoice with rule evaluation and workflow initialization
   */
  async createInvoice(params: {
    userId: string;
    userEmail: string;
    userRoles: RoleType[];
    invoiceData: any;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<any> {
    // 1. Check permissions
    await rbacService.requirePermission({
      userId: params.userId,
      userRoles: params.userRoles,
      resource: 'invoices',
      action: 'create',
    });

    // 2. Evaluate business rules
    const ruleContext: RuleEvaluationContext = {
      entity: params.invoiceData,
      entityType: 'INVOICE',
      userId: params.userId,
      userRoles: params.userRoles,
      timestamp: new Date(),
    };

    const ruleResults = await ruleEngine.evaluateRules(ruleContext);

    // Check for CRITICAL violations
    const criticalViolations = ruleResults.filter(r => 
      r.triggered && r.severity === 'CRITICAL'
    );

    if (criticalViolations.length > 0) {
      throw new ApiError(
        400,
        'RULE_VIOLATION',
        `Rule violations: ${criticalViolations.map(v => v.message).join(', ')}`
      );
    }

    // Determine if approval required
    const approvalRequired = ruleResults.some(r => 
      r.triggered && r.action === 'REQUIRE_APPROVAL'
    );

    // 3. Create invoice with transaction
    const invoice = await workflowTransactions.createInvoiceWithWorkflow(
      {
        ...params.invoiceData,
        userId: params.userId,
        status: 'DRAFT',
        requiresApproval: approvalRequired,
        version: 0,
      },
      {
        userId: params.userId,
      }
    );

    // 4. Log audit
    await auditLogger.logInvoiceAction({
      actorId: params.userId,
      actorEmail: params.userEmail,
      action: 'CREATE',
      invoiceId: invoice.id,
      newData: invoice,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });

    // 5. Emit domain event
    await domainEvents.invoiceCreated({
      invoiceId: invoice.id,
      invoice,
      userId: params.userId,
    });

    return {
      invoice,
      ruleResults,
      warnings: ruleResults
        .filter(r => r.triggered && r.severity === 'WARNING')
        .map(r => r.message),
    };
  }

  /**
   * Transition invoice state with full workflow validation
   */
  async transitionInvoice(params: {
    userId: string;
    userEmail: string;
    userRoles: RoleType[];
    invoiceId: string;
    toState: InvoiceStatus;
    reason?: string;
    rejectionReason?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<any> {
    // 1. Fetch current invoice
    const invoice = await prisma.invoice.findUnique({
      where: { id: params.invoiceId },
      include: {
        customer: true,
        items: true,
      },
    });

    if (!invoice) {
      throw new ApiError(404, 'NOT_FOUND', 'Invoice not found');
    }

    // 2. Check permissions
    await rbacService.requirePermission({
      userId: params.userId,
      userRoles: params.userRoles,
      resource: 'invoices',
      action: this.getActionForTransition(params.toState),
      resourceOwnerId: invoice.userId,
    });

    // 3. Build transition context
    const context: TransitionContext = {
      entity: invoice,
      userId: params.userId,
      userRoles: params.userRoles,
      fromState: invoice.status,
      toState: params.toState,
      metadata: {
        entityType: 'INVOICE' as EntityType,
        reason: params.reason,
        rejectionReason: params.rejectionReason,
      },
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    };

    // 4. Execute state transition
    const result = await workflowStateMachine.executeTransition(
      'INVOICE',
      params.invoiceId,
      params.toState,
      context
    );

    if (!result.success) {
      throw new ApiError(400, 'TRANSITION_FAILED', result.errors?.join(', ') || 'Transition failed');
    }

    // 5. Get updated invoice
    const updatedInvoice = await prisma.invoice.findUnique({
      where: { id: params.invoiceId },
      include: {
        customer: true,
        approver: true,
      },
    });

    // 6. Log audit
    await auditLogger.logInvoiceAction({
      actorId: params.userId,
      actorEmail: params.userEmail,
      action: this.getAuditActionForTransition(params.toState),
      invoiceId: params.invoiceId,
      oldData: invoice,
      newData: updatedInvoice,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });

    // 7. Emit appropriate domain events
    await this.emitInvoiceEvent(params.toState, updatedInvoice!, params.userId);

    return {
      invoice: updatedInvoice,
      result,
    };
  }

  /**
   * Submit invoice for approval (high-level operation)
   */
  async submitInvoiceForApproval(params: {
    userId: string;
    userEmail: string;
    userRoles: RoleType[];
    invoiceId: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<any> {
    // Get invoice
    const invoice = await prisma.invoice.findUnique({
      where: { id: params.invoiceId },
      include: { customer: true },
    });

    if (!invoice) {
      throw new ApiError(404, 'NOT_FOUND', 'Invoice not found');
    }

    // Determine approver (from rules or default to MANAGER role users)
    const managers = await prisma.userRole.findMany({
      where: { roleType: 'MANAGER' },
      include: { user: true },
    });

    const approver = managers[0]?.user; // Simple: assign to first manager
    if (!approver) {
      throw new ApiError(400, 'NO_APPROVER', 'No approver available');
    }

    // Transition to PENDING_APPROVAL
    const result = await this.transitionInvoice({
      ...params,
      toState: 'PENDING_APPROVAL',
    });

    // Emit event for notification
    await domainEvents.invoiceSubmittedForApproval({
      invoiceId: params.invoiceId,
      invoice: result.invoice,
      approver: approver.id,
      userId: params.userId,
    });

    return result;
  }

  /**
   * Approve invoice
   */
  async approveInvoice(params: {
    userId: string;
    userEmail: string;
    userRoles: RoleType[];
    invoiceId: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<any> {
    // Check if user can approve
    await rbacService.requirePermission({
      userId: params.userId,
      userRoles: params.userRoles,
      resource: 'invoices',
      action: 'approve',
    });

    // Use Saga pattern for approval (with compensation if fails)
    await workflowTransactions.approveInvoiceSaga(
      params.invoiceId,
      params.userId,
      {
        userId: params.userId,
      }
    );

    // Get updated invoice
    const invoice = await prisma.invoice.findUnique({
      where: { id: params.invoiceId },
      include: { customer: true, approver: true },
    });

    // Emit event
    await domainEvents.invoiceApproved({
      invoiceId: params.invoiceId,
      invoice: invoice!,
      approver: params.userId,
      userId: params.userId,
    });

    return { invoice };
  }

  /**
   * Reject invoice
   */
  async rejectInvoice(params: {
    userId: string;
    userEmail: string;
    userRoles: RoleType[];
    invoiceId: string;
    reason: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<any> {
    if (!params.reason || params.reason.trim().length === 0) {
      throw new ApiError(400, 'INVALID_INPUT', 'Rejection reason is required');
    }

    const result = await this.transitionInvoice({
      ...params,
      toState: 'REJECTED',
      rejectionReason: params.reason,
    });

    // Emit event
    await domainEvents.invoiceRejected({
      invoiceId: params.invoiceId,
      invoice: result.invoice,
      rejector: params.userId,
      reason: params.reason,
      userId: params.userId,
    });

    return result;
  }

  /**
   * Transition expense state with full workflow validation
   */
  async transitionExpense(params: {
    userId: string;
    userEmail: string;
    userRoles: RoleType[];
    expenseId: string;
    toState: ExpenseStatus;
    reason?: string;
    rejectionReason?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<any> {
    const expense = await prisma.expense.findUnique({
      where: { id: params.expenseId },
      include: {
        vendor: true,
        account: true,
        approver: true,
        rejector: true,
      },
    });

    if (!expense) {
      throw new ApiError(404, 'NOT_FOUND', 'Expense not found');
    }

    await rbacService.requirePermission({
      userId: params.userId,
      userRoles: params.userRoles,
      resource: 'expenses',
      action: this.getActionForTransition(params.toState),
      resourceOwnerId: expense.userId,
    });

    const context: TransitionContext = {
      entity: expense,
      userId: params.userId,
      userRoles: params.userRoles,
      fromState: expense.status,
      toState: params.toState,
      metadata: {
        entityType: 'EXPENSE' as EntityType,
        reason: params.reason,
        rejectionReason: params.rejectionReason,
      },
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    };

    const result = await workflowStateMachine.executeTransition(
      'EXPENSE',
      params.expenseId,
      params.toState,
      context
    );

    if (!result.success) {
      throw new ApiError(400, 'TRANSITION_FAILED', result.errors?.join(', ') || 'Transition failed');
    }

    const updatedExpense = await prisma.expense.findUnique({
      where: { id: params.expenseId },
      include: {
        vendor: true,
        account: true,
        approver: true,
        rejector: true,
      },
    });

    await auditLogger.logExpenseAction({
      actorId: params.userId,
      actorEmail: params.userEmail,
      action: this.getAuditActionForTransition(params.toState),
      expenseId: params.expenseId,
      oldData: expense,
      newData: updatedExpense,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });

    return {
      expense: updatedExpense,
      result,
    };
  }

  /**
   * Submit expense for approval (high-level operation)
   */
  async submitExpenseForApproval(params: {
    userId: string;
    userEmail: string;
    userRoles: RoleType[];
    expenseId: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<any> {
    const expense = await prisma.expense.findUnique({
      where: { id: params.expenseId },
      include: { vendor: true },
    });

    if (!expense) {
      throw new ApiError(404, 'NOT_FOUND', 'Expense not found');
    }

    if (!expense.requiresApproval) {
      await prisma.expense.update({
        where: { id: params.expenseId },
        data: { requiresApproval: true },
      });
    }

    const managers = await prisma.userRole.findMany({
      where: { roleType: 'MANAGER' },
      include: { user: true },
    });

    const approver = managers[0]?.user;
    if (!approver) {
      throw new ApiError(400, 'NO_APPROVER', 'No approver available');
    }

    const result = await this.transitionExpense({
      ...params,
      toState: 'PENDING_APPROVAL',
    });

    await domainEvents.expenseSubmittedForApproval({
      expenseId: params.expenseId,
      expense: result.expense,
      approver: approver.id,
      userId: params.userId,
    });

    return result;
  }

  /**
   * Approve expense
   */
  async approveExpense(params: {
    userId: string;
    userEmail: string;
    userRoles: RoleType[];
    expenseId: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<any> {
    await rbacService.requirePermission({
      userId: params.userId,
      userRoles: params.userRoles,
      resource: 'expenses',
      action: 'approve',
    });

    const result = await this.transitionExpense({
      ...params,
      toState: 'APPROVED',
    });

    await domainEvents.expenseApproved({
      expenseId: params.expenseId,
      expense: result.expense,
      approver: params.userId,
      userId: params.userId,
    });

    return result;
  }

  /**
   * Reject expense
   */
  async rejectExpense(params: {
    userId: string;
    userEmail: string;
    userRoles: RoleType[];
    expenseId: string;
    reason: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<any> {
    if (!params.reason || params.reason.trim().length === 0) {
      throw new ApiError(400, 'INVALID_INPUT', 'Rejection reason is required');
    }

    const result = await this.transitionExpense({
      ...params,
      toState: 'REJECTED',
      rejectionReason: params.reason,
    });

    await domainEvents.expenseRejected({
      expenseId: params.expenseId,
      expense: result.expense,
      rejector: params.userId,
      reason: params.reason,
      userId: params.userId,
    });

    return result;
  }

  /**
   * Get next possible actions for expense
   */
  async getExpenseActions(params: {
    userId: string;
    userRoles: RoleType[];
    expenseId: string;
  }): Promise<{
    canEdit: boolean;
    canDelete: boolean;
    canApprove: boolean;
    canReject: boolean;
    canPay: boolean;
    canCancel: boolean;
    nextStates: ExpenseStatus[];
  }> {
    const expense = await prisma.expense.findUnique({
      where: { id: params.expenseId },
    });

    if (!expense) {
      throw new ApiError(404, 'NOT_FOUND', 'Expense not found');
    }

    const nextStates = workflowStateMachine.getNextActions(
      'EXPENSE',
      expense.status,
      params.userRoles
    ) as ExpenseStatus[];

    const [canEdit, canDelete, canApprove, canReject, canPay, canCancel] =
      await Promise.all([
        rbacService.hasPermission({
          userId: params.userId,
          userRoles: params.userRoles,
          resource: 'expenses',
          action: 'update',
        }),
        rbacService.hasPermission({
          userId: params.userId,
          userRoles: params.userRoles,
          resource: 'expenses',
          action: 'delete',
        }),
        rbacService.hasPermission({
          userId: params.userId,
          userRoles: params.userRoles,
          resource: 'expenses',
          action: 'approve',
        }),
        rbacService.hasPermission({
          userId: params.userId,
          userRoles: params.userRoles,
          resource: 'expenses',
          action: 'reject',
        }),
        rbacService.hasPermission({
          userId: params.userId,
          userRoles: params.userRoles,
          resource: 'expenses',
          action: 'update',
        }),
        rbacService.hasPermission({
          userId: params.userId,
          userRoles: params.userRoles,
          resource: 'expenses',
          action: 'delete',
        }),
      ]);

    return {
      canEdit,
      canDelete,
      canApprove: canApprove && nextStates.includes('APPROVED'),
      canReject: canReject && nextStates.includes('REJECTED'),
      canPay: canPay && nextStates.includes('PAID'),
      canCancel: canCancel && nextStates.includes('CANCELLED'),
      nextStates,
    };
  }

  /**
   * Get next possible actions for invoice
   */
  async getInvoiceActions(params: {
    userId: string;
    userRoles: RoleType[];
    invoiceId: string;
  }): Promise<{
    canEdit: boolean;
    canDelete: boolean;
    canApprove: boolean;
    canReject: boolean;
    canSend: boolean;
    canCancel: boolean;
    nextStates: InvoiceStatus[];
  }> {
    const invoice = await prisma.invoice.findUnique({
      where: { id: params.invoiceId },
    });

    if (!invoice) {
      throw new ApiError(404, 'NOT_FOUND', 'Invoice not found');
    }

    // Get next possible states from state machine
    const nextStates = workflowStateMachine.getNextActions(
      'INVOICE',
      invoice.status,
      params.userRoles
    ) as InvoiceStatus[];

    // Check individual permissions
    const [canEdit, canDelete, canApprove, canReject, canSend, canCancel] = 
      await Promise.all([
        rbacService.hasPermission({
          userId: params.userId,
          userRoles: params.userRoles,
          resource: 'invoices',
          action: 'update',
        }),
        rbacService.hasPermission({
          userId: params.userId,
          userRoles: params.userRoles,
          resource: 'invoices',
          action: 'delete',
        }),
        rbacService.hasPermission({
          userId: params.userId,
          userRoles: params.userRoles,
          resource: 'invoices',
          action: 'approve',
        }),
        rbacService.hasPermission({
          userId: params.userId,
          userRoles: params.userRoles,
          resource: 'invoices',
          action: 'reject',
        }),
        rbacService.hasPermission({
          userId: params.userId,
          userRoles: params.userRoles,
          resource: 'invoices',
          action: 'send',
        }),
        rbacService.hasPermission({
          userId: params.userId,
          userRoles: params.userRoles,
          resource: 'invoices',
          action: 'delete',
        }),
      ]);

    return {
      canEdit,
      canDelete,
      canApprove: canApprove && nextStates.includes('APPROVED'),
      canReject: canReject && nextStates.includes('REJECTED'),
      canSend: canSend && nextStates.includes('SENT'),
      canCancel: canCancel && nextStates.includes('CANCELLED'),
      nextStates,
    };
  }

  // ============================================
  // PRIVATE HELPERS
  // ============================================

  private getActionForTransition(toState: InvoiceStatus | ExpenseStatus): 'create' | 'read' | 'update' | 'delete' | 'approve' | 'reject' | 'send' {
    switch (toState) {
      case 'APPROVED': return 'approve';
      case 'REJECTED': return 'reject';
      case 'SENT': return 'send';
      case 'CANCELLED': return 'delete';
      default: return 'update';
    }
  }

  private getAuditActionForTransition(toState: InvoiceStatus | ExpenseStatus): any {
    switch (toState) {
      case 'APPROVED': return 'APPROVE';
      case 'REJECTED': return 'REJECT';
      case 'SENT': return 'SEND';
      case 'PAID': return 'PAY';
      case 'CANCELLED': return 'CANCEL';
      default: return 'UPDATE';
    }
  }

  private async emitInvoiceEvent(
    state: InvoiceStatus,
    invoice: any,
    userId: string
  ): Promise<void> {
    switch (state) {
      case 'SENT':
        await domainEvents.invoiceSent({
          invoiceId: invoice.id,
          invoice,
          customer: invoice.customer,
          userId,
        });
        break;
      
      case 'PAID':
        await domainEvents.invoicePaid({
          invoiceId: invoice.id,
          invoice,
          paymentAmount: invoice.paidAmount,
          userId,
        });
        break;
    }
  }
}

// Export singleton instance
export const workflowOrchestrator = new WorkflowOrchestrator();
