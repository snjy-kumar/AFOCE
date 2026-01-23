/**
 * AFOCE Workflow State Machine Engine
 * 
 * Enterprise-grade state machine with:
 * - Strict transition validation
 * - Role-based permission checking
 * - Optimistic locking for concurrency
 * - Automatic side effect execution
 * - Comprehensive audit logging
 */

import type { InvoiceStatus, ExpenseStatus, RoleType, EntityType } from '@prisma/client';
import type {
  StateTransition,
  TransitionContext,
  TransitionResult,
  TransitionCondition,
  SideEffect,

} from '../../types/workflow.types.js';
import prisma from '../../lib/prisma.js';

// ============================================
// STATE TRANSITION REGISTRY
// ============================================

/**
 * Invoice state machine configuration
 * Defines all valid state transitions with conditions and side effects
 */
const INVOICE_TRANSITIONS: StateTransition<InvoiceStatus>[] = [
  // From DRAFT
  {
    from: 'DRAFT',
    to: 'PENDING_APPROVAL',
    requiredPermissions: ['invoices.create'],
    conditions: [
      {
        type: 'FIELD_VALUE',
        field: 'requiresApproval',
        operator: 'eq',
        value: true,
        errorMessage: 'Invoice does not require approval',
      },
    ],
    sideEffects: [
      { type: 'NOTIFICATION', config: { notifyApprover: true }, async: true },
      { type: 'AUDIT_LOG', config: { action: 'SUBMIT_FOR_APPROVAL' }, async: false },
    ],
  },
  {
    from: 'DRAFT',
    to: 'SENT',
    requiredPermissions: ['invoices.send'],
    conditions: [
      {
        type: 'CUSTOM_LOGIC',
        customValidator: async (ctx) => {
          const invoice = ctx.entity as any;
          return !invoice.requiresApproval || invoice.approvedBy !== null;
        },
        errorMessage: 'Invoice requires approval before sending',
      },
    ],
    sideEffects: [
      { type: 'NOTIFICATION', config: { notifyCustomer: true }, async: true },
      { type: 'AUDIT_LOG', config: { action: 'SEND' }, async: false },
    ],
  },
  {
    from: 'DRAFT',
    to: 'CANCELLED',
    requiredPermissions: ['invoices.delete'],
    sideEffects: [
      { type: 'AUDIT_LOG', config: { action: 'CANCEL' }, async: false },
    ],
  },

  // From PENDING_APPROVAL
  {
    from: 'PENDING_APPROVAL',
    to: 'APPROVED',
    requiredRole: ['OWNER', 'MANAGER'],
    requiredPermissions: ['invoices.approve'],
    sideEffects: [
      { type: 'NOTIFICATION', config: { notifyCreator: true, type: 'APPROVED' }, async: true },
      { type: 'AUDIT_LOG', config: { action: 'APPROVE' }, async: false },
    ],
  },
  {
    from: 'PENDING_APPROVAL',
    to: 'REJECTED',
    requiredRole: ['OWNER', 'MANAGER'],
    requiredPermissions: ['invoices.reject'],
    conditions: [
      {
        type: 'FIELD_VALUE',
        field: 'rejectionReason',
        operator: 'is_not_null',
        value: null,
        errorMessage: 'Rejection reason is required',
      },
    ],
    sideEffects: [
      { type: 'NOTIFICATION', config: { notifyCreator: true, type: 'REJECTED' }, async: true },
      { type: 'AUDIT_LOG', config: { action: 'REJECT' }, async: false },
    ],
  },
  {
    from: 'PENDING_APPROVAL',
    to: 'CANCELLED',
    requiredPermissions: ['invoices.delete'],
    sideEffects: [
      { type: 'AUDIT_LOG', config: { action: 'CANCEL' }, async: false },
    ],
  },

  // From APPROVED
  {
    from: 'APPROVED',
    to: 'SENT',
    requiredPermissions: ['invoices.send'],
    sideEffects: [
      { type: 'NOTIFICATION', config: { notifyCustomer: true }, async: true },
      { type: 'AUDIT_LOG', config: { action: 'SEND' }, async: false },
    ],
  },
  {
    from: 'APPROVED',
    to: 'CANCELLED',
    requiredPermissions: ['invoices.delete'],
    sideEffects: [
      { type: 'AUDIT_LOG', config: { action: 'CANCEL' }, async: false },
    ],
  },

  // From SENT
  {
    from: 'SENT',
    to: 'PARTIALLY_PAID',
    requiredPermissions: ['invoices.update'],
    conditions: [
      {
        type: 'CUSTOM_LOGIC',
        customValidator: async (ctx) => {
          const invoice = ctx.entity as any;
          return invoice.paidAmount > 0 && invoice.paidAmount < invoice.total;
        },
        errorMessage: 'Invalid partial payment amount',
      },
    ],
    sideEffects: [
      { type: 'NOTIFICATION', config: { notifyOwner: true, type: 'PAYMENT_RECEIVED' }, async: true },
      { type: 'AUDIT_LOG', config: { action: 'PAY' }, async: false },
    ],
  },
  {
    from: 'SENT',
    to: 'PAID',
    requiredPermissions: ['invoices.update'],
    conditions: [
      {
        type: 'CUSTOM_LOGIC',
        customValidator: async (ctx) => {
          const invoice = ctx.entity as any;
          return invoice.paidAmount >= invoice.total;
        },
        errorMessage: 'Paid amount must equal or exceed total',
      },
    ],
    sideEffects: [
      { type: 'NOTIFICATION', config: { notifyOwner: true, type: 'PAYMENT_RECEIVED' }, async: true },
      { type: 'AUDIT_LOG', config: { action: 'PAY' }, async: false },
    ],
  },
  {
    from: 'SENT',
    to: 'OVERDUE',
    requiredPermissions: ['invoices.read'], // Automated transition
    sideEffects: [
      { type: 'NOTIFICATION', config: { notifyCustomer: true, type: 'OVERDUE' }, async: true },
      { type: 'AUDIT_LOG', config: { action: 'UPDATE' }, async: false },
    ],
  },
  {
    from: 'SENT',
    to: 'CANCELLED',
    requiredPermissions: ['invoices.delete'],
    sideEffects: [
      { type: 'AUDIT_LOG', config: { action: 'CANCEL' }, async: false },
    ],
  },

  // From PARTIALLY_PAID
  {
    from: 'PARTIALLY_PAID',
    to: 'PAID',
    requiredPermissions: ['invoices.update'],
    conditions: [
      {
        type: 'CUSTOM_LOGIC',
        customValidator: async (ctx) => {
          const invoice = ctx.entity as any;
          return invoice.paidAmount >= invoice.total;
        },
        errorMessage: 'Paid amount must equal or exceed total',
      },
    ],
    sideEffects: [
      { type: 'NOTIFICATION', config: { notifyOwner: true, type: 'PAYMENT_RECEIVED' }, async: true },
      { type: 'AUDIT_LOG', config: { action: 'PAY' }, async: false },
    ],
  },
  {
    from: 'PARTIALLY_PAID',
    to: 'OVERDUE',
    requiredPermissions: ['invoices.read'],
    sideEffects: [
      { type: 'NOTIFICATION', config: { notifyCustomer: true, type: 'OVERDUE' }, async: true },
      { type: 'AUDIT_LOG', config: { action: 'UPDATE' }, async: false },
    ],
  },

  // From OVERDUE
  {
    from: 'OVERDUE',
    to: 'PAID',
    requiredPermissions: ['invoices.update'],
    conditions: [
      {
        type: 'CUSTOM_LOGIC',
        customValidator: async (ctx) => {
          const invoice = ctx.entity as any;
          return invoice.paidAmount >= invoice.total;
        },
        errorMessage: 'Paid amount must equal or exceed total',
      },
    ],
    sideEffects: [
      { type: 'NOTIFICATION', config: { notifyOwner: true, type: 'PAYMENT_RECEIVED' }, async: true },
      { type: 'AUDIT_LOG', config: { action: 'PAY' }, async: false },
    ],
  },
  {
    from: 'OVERDUE',
    to: 'COLLECTION',
    requiredRole: ['OWNER', 'MANAGER'],
    requiredPermissions: ['invoices.update'],
    sideEffects: [
      { type: 'NOTIFICATION', config: { notifyCollections: true }, async: true },
      { type: 'AUDIT_LOG', config: { action: 'UPDATE' }, async: false },
    ],
  },
  {
    from: 'OVERDUE',
    to: 'PARTIALLY_PAID',
    requiredPermissions: ['invoices.update'],
    conditions: [
      {
        type: 'CUSTOM_LOGIC',
        customValidator: async (ctx) => {
          const invoice = ctx.entity as any;
          return invoice.paidAmount > 0 && invoice.paidAmount < invoice.total;
        },
        errorMessage: 'Invalid partial payment amount',
      },
    ],
    sideEffects: [
      { type: 'NOTIFICATION', config: { notifyOwner: true, type: 'PAYMENT_RECEIVED' }, async: true },
      { type: 'AUDIT_LOG', config: { action: 'PAY' }, async: false },
    ],
  },

  // From COLLECTION
  {
    from: 'COLLECTION',
    to: 'PAID',
    requiredPermissions: ['invoices.update'],
    conditions: [
      {
        type: 'CUSTOM_LOGIC',
        customValidator: async (ctx) => {
          const invoice = ctx.entity as any;
          return invoice.paidAmount >= invoice.total;
        },
        errorMessage: 'Paid amount must equal or exceed total',
      },
    ],
    sideEffects: [
      { type: 'NOTIFICATION', config: { notifyOwner: true, type: 'PAYMENT_RECEIVED' }, async: true },
      { type: 'AUDIT_LOG', config: { action: 'PAY' }, async: false },
    ],
  },
  {
    from: 'COLLECTION',
    to: 'WRITTEN_OFF',
    requiredRole: ['OWNER'],
    requiredPermissions: ['invoices.update'],
    sideEffects: [
      { type: 'NOTIFICATION', config: { notifyFinance: true }, async: true },
      { type: 'AUDIT_LOG', config: { action: 'UPDATE' }, async: false },
    ],
  },

  // From REJECTED (can restart workflow)
  {
    from: 'REJECTED',
    to: 'DRAFT',
    requiredPermissions: ['invoices.create'],
    sideEffects: [
      { type: 'AUDIT_LOG', config: { action: 'UPDATE' }, async: false },
    ],
  },
];

/**
 * Expense state machine configuration
 */
const EXPENSE_TRANSITIONS: StateTransition<ExpenseStatus>[] = [
  // From DRAFT
  {
    from: 'DRAFT',
    to: 'PENDING_APPROVAL',
    requiredPermissions: ['expenses.create'],
    conditions: [
      {
        type: 'FIELD_VALUE',
        field: 'requiresApproval',
        operator: 'eq',
        value: true,
        errorMessage: 'Expense does not require approval',
      },
    ],
    sideEffects: [
      { type: 'NOTIFICATION', config: { notifyApprover: true }, async: true },
      { type: 'AUDIT_LOG', config: { action: 'SUBMIT_FOR_APPROVAL' }, async: false },
    ],
  },
  {
    from: 'DRAFT',
    to: 'PAID',
    requiredPermissions: ['expenses.create'],
    conditions: [
      {
        type: 'CUSTOM_LOGIC',
        customValidator: async (ctx) => {
          const expense = ctx.entity as any;
          return !expense.requiresApproval;
        },
        errorMessage: 'Expense requires approval before marking as paid',
      },
    ],
    sideEffects: [
      { type: 'AUDIT_LOG', config: { action: 'CREATE' }, async: false },
    ],
  },
  {
    from: 'DRAFT',
    to: 'CANCELLED',
    requiredPermissions: ['expenses.delete'],
    sideEffects: [
      { type: 'AUDIT_LOG', config: { action: 'CANCEL' }, async: false },
    ],
  },

  // From PENDING_APPROVAL
  {
    from: 'PENDING_APPROVAL',
    to: 'APPROVED',
    requiredRole: ['OWNER', 'MANAGER'],
    requiredPermissions: ['expenses.approve'],
    sideEffects: [
      { type: 'NOTIFICATION', config: { notifyCreator: true, type: 'APPROVED' }, async: true },
      { type: 'AUDIT_LOG', config: { action: 'APPROVE' }, async: false },
    ],
  },
  {
    from: 'PENDING_APPROVAL',
    to: 'REJECTED',
    requiredRole: ['OWNER', 'MANAGER'],
    requiredPermissions: ['expenses.reject'],
    conditions: [
      {
        type: 'FIELD_VALUE',
        field: 'rejectionReason',
        operator: 'is_not_null',
        value: null,
        errorMessage: 'Rejection reason is required',
      },
    ],
    sideEffects: [
      { type: 'NOTIFICATION', config: { notifyCreator: true, type: 'REJECTED' }, async: true },
      { type: 'AUDIT_LOG', config: { action: 'REJECT' }, async: false },
    ],
  },
  {
    from: 'PENDING_APPROVAL',
    to: 'CANCELLED',
    requiredPermissions: ['expenses.delete'],
    sideEffects: [
      { type: 'AUDIT_LOG', config: { action: 'CANCEL' }, async: false },
    ],
  },

  // From APPROVED
  {
    from: 'APPROVED',
    to: 'PAID',
    requiredPermissions: ['expenses.update'],
    sideEffects: [
      { type: 'NOTIFICATION', config: { notifyCreator: true }, async: true },
      { type: 'AUDIT_LOG', config: { action: 'PAY' }, async: false },
    ],
  },
  {
    from: 'APPROVED',
    to: 'CANCELLED',
    requiredPermissions: ['expenses.delete'],
    sideEffects: [
      { type: 'AUDIT_LOG', config: { action: 'CANCEL' }, async: false },
    ],
  },

  // From REJECTED (can restart)
  {
    from: 'REJECTED',
    to: 'DRAFT',
    requiredPermissions: ['expenses.create'],
    sideEffects: [
      { type: 'AUDIT_LOG', config: { action: 'UPDATE' }, async: false },
    ],
  },
];

// ============================================
// STATE MACHINE SERVICE
// ============================================

export class WorkflowStateMachineService {
  /**
   * Get valid transitions for current state
   */
  private getValidTransitions<TStatus>(
    entityType: EntityType,
    currentState: TStatus
  ): StateTransition<TStatus>[] {
    const registry = entityType === 'INVOICE' 
      ? INVOICE_TRANSITIONS 
      : EXPENSE_TRANSITIONS;
    
    return registry.filter(t => t.from === currentState) as StateTransition<TStatus>[];
  }

  /**
   * Check if transition is valid
   */
  async canTransition<TEntity = any>(
    context: TransitionContext<TEntity>
  ): Promise<{ allowed: boolean; reason?: string }> {
    const transitions = this.getValidTransitions(
      context.metadata?.entityType as EntityType,
      context.fromState
    );

    const transition = transitions.find(t => t.to === context.toState);
    
    if (!transition) {
      return {
        allowed: false,
        reason: `Invalid transition from ${context.fromState} to ${context.toState}`,
      };
    }

    // Check role requirements
    if (transition.requiredRole) {
      const hasRole = context.userRoles.some(role => 
        transition.requiredRole?.includes(role)
      );
      if (!hasRole) {
        return {
          allowed: false,
          reason: `Requires one of roles: ${transition.requiredRole.join(', ')}`,
        };
      }
    }

    // Check conditions
    if (transition.conditions) {
      for (const condition of transition.conditions) {
        const result = await this.evaluateCondition(condition, context);
        if (!result) {
          return {
            allowed: false,
            reason: condition.errorMessage,
          };
        }
      }
    }

    return { allowed: true };
  }

  /**
   * Execute state transition with full validation and side effects
   */
  async executeTransition<TEntity = any>(
    entityType: EntityType,
    entityId: string,
    toState: string,
    context: TransitionContext<TEntity>
  ): Promise<TransitionResult> {
    
    const warnings: string[] = [];
    const executedSideEffects: string[] = [];

    try {
      // 1. Validate transition
      const validation = await this.canTransition(context);
      if (!validation.allowed) {
        return {
          success: false,
          errors: [validation.reason || 'Transition not allowed'],
        };
      }

      // 2. Get transition configuration
      const transitions = this.getValidTransitions(entityType, context.fromState);
      const transition = transitions.find(t => t.to === toState);
      
      if (!transition) {
        return {
          success: false,
          errors: ['Transition configuration not found'],
        };
      }

      // 3. Update entity state with optimistic locking
      const updated = await this.updateEntityState(
        entityType,
        entityId,
        toState,
        context
      );

      if (!updated) {
        return {
          success: false,
          errors: ['Failed to update entity state (concurrent modification?)'],
        };
      }

      // 4. Record workflow history
      await this.recordWorkflowHistory(entityType, entityId, context);

      // 5. Execute side effects
      if (transition.sideEffects) {
        for (const sideEffect of transition.sideEffects) {
          try {
            await this.executeSideEffect(sideEffect, entityType, entityId, context);
            executedSideEffects.push(sideEffect.type);
          } catch (error: any) {
            warnings.push(`Side effect ${sideEffect.type} failed: ${error.message}`);
          }
        }
      }

      return {
        success: true,
        newState: toState,
        executedSideEffects,
        warnings: warnings.length > 0 ? warnings : undefined,
      };

    } catch (error: any) {
      return {
        success: false,
        errors: [error.message || 'Unknown error during transition'],
      };
    }
  }

  /**
   * Evaluate transition condition
   */
  private async evaluateCondition<TEntity>(
    condition: TransitionCondition,
    context: TransitionContext<TEntity>
  ): Promise<boolean> {
    if (condition.type === 'CUSTOM_LOGIC' && condition.customValidator) {
      return await condition.customValidator(context);
    }

    if (condition.type === 'FIELD_VALUE' && condition.field) {
      const value = this.getNestedValue(context.entity, condition.field);
      return this.compareValues(value, condition.operator!, condition.value);
    }

    if (condition.type === 'USER_ROLE') {
      return context.userRoles.some(role => 
        condition.value === role
      );
    }

    return false;
  }

  /**
   * Get nested object value by path (e.g., "customer.type")
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Compare values based on operator
   */
  private compareValues(actual: any, operator: string, expected: any): boolean {
    switch (operator) {
      case 'eq': return actual === expected;
      case 'ne': return actual !== expected;
      case 'gt': return actual > expected;
      case 'gte': return actual >= expected;
      case 'lt': return actual < expected;
      case 'lte': return actual <= expected;
      case 'in': return Array.isArray(expected) && expected.includes(actual);
      case 'not_in': return Array.isArray(expected) && !expected.includes(actual);
      case 'contains': return typeof actual === 'string' && actual.includes(expected);
      case 'is_null': return actual === null || actual === undefined;
      case 'is_not_null': return actual !== null && actual !== undefined;
      default: return false;
    }
  }

  /**
   * Update entity state with optimistic locking
   */
  private async updateEntityState(
    entityType: EntityType,
    entityId: string,
    newState: string,
    context: TransitionContext
  ): Promise<boolean> {
    const table = entityType === 'INVOICE' ? prisma.invoice : prisma.expense;
    const currentVersion = (context.entity as any).version || 0;

    try {
      const result = await (table as any).updateMany({
        where: {
          id: entityId,
          version: currentVersion, // Optimistic locking
        },
        data: {
          status: newState as any,
          version: currentVersion + 1,
          updatedAt: new Date(),
          // Update approval fields if applicable
          ...(newState === 'APPROVED' && {
            approvedBy: context.userId,
            approvedAt: new Date(),
          }),
          ...(newState === 'REJECTED' && {
            rejectedBy: context.userId,
            rejectedAt: new Date(),
            rejectionReason: context.metadata?.rejectionReason as string,
          }),
        },
      });

      return result.count > 0;
    } catch (error) {
      console.error('Failed to update entity state:', error);
      return false;
    }
  }

  /**
   * Record workflow history entry
   */
  private async recordWorkflowHistory(
    entityType: EntityType,
    entityId: string,
    context: TransitionContext
  ): Promise<void> {
    await prisma.workflowHistory.create({
      data: {
        entityType,
        entityId,
        fromState: context.fromState,
        toState: context.toState,
        actorId: context.userId,
        actorRole: context.userRoles[0], // Primary role
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        reason: context.metadata?.reason as string,
        metadata: context.metadata as any,
      },
    });
  }

  /**
   * Execute side effect (notification, audit log, etc.)
   */
  private async executeSideEffect(
    sideEffect: SideEffect,
    entityType: EntityType,
    entityId: string,
    _context: TransitionContext
  ): Promise<void> {
    // Implementation will be in respective services
    // For now, just log
    console.log(`[SIDE EFFECT] ${sideEffect.type} for ${entityType}:${entityId}`);
    
    // TODO: Queue async side effects in BullMQ
    // TODO: Execute sync side effects immediately
  }

  /**
   * Get next possible actions for current state
   */
  getNextActions(
    entityType: EntityType,
    currentState: string,
    userRoles: RoleType[]
  ): string[] {
    const transitions = this.getValidTransitions(entityType, currentState);
    
    return transitions
      .filter(t => {
        if (!t.requiredRole) return true;
        return userRoles.some(role => t.requiredRole?.includes(role));
      })
      .map(t => t.to);
  }
}

export const workflowStateMachine = new WorkflowStateMachineService();
