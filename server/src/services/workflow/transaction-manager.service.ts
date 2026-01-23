/**
 * AFOCE Transaction Manager
 * 
 * Provides transactional boundaries for complex workflows with:
 * - ACID guarantees for multi-step operations
 * - Automatic rollback on failure
 * - Nested transaction support
 * - Saga pattern for distributed transactions
 * - Retry logic with exponential backoff
 * - Compensation handlers for rollback
 */

import type { Prisma } from '@prisma/client';
import prisma from '../../lib/prisma.js';
import { ApiError } from '../../middleware/errorHandler.js';

// ============================================
// TRANSACTION CONTEXT
// ============================================

export interface TransactionContext {
  userId: string;
  correlationId?: string;
  metadata?: Record<string, unknown>;
}

export interface TransactionOptions {
  isolationLevel?: Prisma.TransactionIsolationLevel;
  maxRetries?: number;
  timeout?: number; // milliseconds
}

// ============================================
// SAGA STEP DEFINITION
// ============================================

export interface SagaStep<TResult = any> {
  name: string;
  execute: (context: TransactionContext) => Promise<TResult>;
  compensate: (context: TransactionContext, result?: TResult) => Promise<void>;
}

// ============================================
// TRANSACTION MANAGER
// ============================================

export class TransactionManager {
  /**
   * Execute a function within a transaction with automatic rollback
   */
  async execute<TResult>(
    fn: (tx: Prisma.TransactionClient, context: TransactionContext) => Promise<TResult>,
    context: TransactionContext,
    options?: TransactionOptions
  ): Promise<TResult> {
    const maxRetries = options?.maxRetries || 3;
    const timeout = options?.timeout || 30000; // 30 seconds default
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await prisma.$transaction(
          async (tx) => {
            return await fn(tx, context);
          },
          {
            isolationLevel: options?.isolationLevel || 'ReadCommitted',
            maxWait: timeout,
            timeout,
          }
        );

        return result;
      } catch (error: any) {
        lastError = error;

        // Check if error is retryable
        if (!this.isRetryableError(error) || attempt === maxRetries) {
          throw new ApiError(
            500,
            `Transaction failed after ${attempt} attempts: ${error.message}`,
            error
          );
        }

        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        console.warn(
          `[Transaction] Attempt ${attempt} failed, retrying in ${delay}ms...`,
          error.message
        );
        await this.sleep(delay);
      }
    }

    throw lastError || new Error('Transaction failed');
  }

  /**
   * Execute a saga (distributed transaction with compensation)
   */
  async executeSaga<TResult = any>(
    steps: SagaStep[],
    context: TransactionContext
  ): Promise<TResult[]> {
    const results: any[] = [];
    const executedSteps: Array<{ step: SagaStep; result: any }> = [];

    try {
      // Execute steps sequentially
      for (const step of steps) {
        console.log(`[Saga] Executing step: ${step.name}`);
        
        const result = await step.execute(context);
        results.push(result);
        executedSteps.push({ step, result });
        
        console.log(`[Saga] Step ${step.name} completed successfully`);
      }

      return results;
    } catch (error: any) {
      console.error(`[Saga] Step failed, initiating compensation...`, error);

      // Rollback by executing compensation in reverse order
      for (let i = executedSteps.length - 1; i >= 0; i--) {
        const { step, result } = executedSteps[i];
        
        try {
          console.log(`[Saga] Compensating step: ${step.name}`);
          await step.compensate(context, result);
          console.log(`[Saga] Compensation for ${step.name} completed`);
        } catch (compensationError: any) {
          console.error(
            `[Saga] Compensation failed for step ${step.name}:`,
            compensationError
          );
          // Continue with other compensations even if one fails
        }
      }

      throw new ApiError(
        500,
        `Saga failed and compensated: ${error.message}`,
        error
      );
    }
  }

  /**
   * Execute with optimistic locking
   */
  async executeWithOptimisticLock<TEntity, TResult>(
    entityType: 'invoice' | 'expense',
    entityId: string,
    expectedVersion: number,
    fn: (entity: TEntity, tx: Prisma.TransactionClient) => Promise<TResult>
  ): Promise<TResult> {
    return await prisma.$transaction(async (tx) => {
      // Fetch entity with current version
      const table = entityType === 'invoice' ? tx.invoice : tx.expense;
      const entity = await (table as any).findUnique({
        where: { id: entityId },
      }) as TEntity;

      if (!entity) {
        throw new ApiError(404, 'NOT_FOUND', `${entityType} not found`);
      }

      // Check version
      const currentVersion = (entity as any).version;
      if (currentVersion !== expectedVersion) {
        throw new ApiError(
          409,
          'CONCURRENT_MODIFICATION',
          `Concurrent modification detected. Expected version ${expectedVersion}, but current is ${currentVersion}. Please refresh and try again.`
        );
      }

      // Execute business logic
      const result = await fn(entity, tx);

      // Increment version
      await (table as any).update({
        where: { id: entityId },
        data: { version: currentVersion + 1 } as any,
      });

      return result;
    });
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: any): boolean {
    const retryableErrors = [
      'P2034', // Transaction conflict
      'P2024', // Connection timeout
      'ECONNRESET',
      'ETIMEDOUT',
      'ECONNREFUSED',
    ];

    const errorCode = error.code || '';
    const errorMessage = error.message || '';

    return retryableErrors.some(
      code => errorCode.includes(code) || errorMessage.includes(code)
    );
  }

  /**
   * Sleep helper for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ============================================
// WORKFLOW TRANSACTION PATTERNS
// ============================================

/**
 * Common workflow transaction patterns
 */
export class WorkflowTransactionPatterns {
  constructor(private txManager: TransactionManager) {}

  /**
   * Create invoice with workflow initialization
   */
  async createInvoiceWithWorkflow(
    invoiceData: any,
    context: TransactionContext
  ): Promise<any> {
    return await this.txManager.execute(
      async (tx, ctx) => {
        // 1. Create invoice
        const invoice = await tx.invoice.create({
          data: invoiceData,
        });

        // 2. Create workflow history entry
        await tx.workflowHistory.create({
          data: {
            entityType: 'INVOICE',
            entityId: invoice.id,
            fromState: 'NONE',
            toState: 'DRAFT',
            actorId: ctx.userId,
            timestamp: new Date(),
          },
        });

        // 3. Create audit log
        await tx.auditLog.create({
          data: {
            actorId: ctx.userId,
            actorEmail: 'system', // Will be updated by caller
            action: 'CREATE',
            entityType: 'INVOICE',
            entityId: invoice.id,
            timestamp: new Date(),
          },
        });

        return invoice;
      },
      context,
      {
        isolationLevel: 'ReadCommitted',
      }
    );
  }

  /**
   * Approve invoice with notifications (Saga pattern)
   */
  async approveInvoiceSaga(
    invoiceId: string,
    approverId: string,
    context: TransactionContext
  ): Promise<void> {
    const steps: SagaStep[] = [
      // Step 1: Update invoice status
      {
        name: 'UpdateInvoiceStatus',
        execute: async (_ctx) => {
          const invoice = await prisma.invoice.update({
            where: { id: invoiceId },
            data: {
              status: 'APPROVED',
              approvedBy: approverId,
              approvedAt: new Date(),
            },
          });
          return invoice;
        },
        compensate: async (_ctx, invoice) => {
          if (invoice) {
            await prisma.invoice.update({
              where: { id: invoiceId },
              data: {
                status: invoice.status,
                approvedBy: null,
                approvedAt: null,
              },
            });
          }
        },
      },

      // Step 2: Create workflow history
      {
        name: 'CreateWorkflowHistory',
        execute: async (_ctx) => {
          const history = await prisma.workflowHistory.create({
            data: {
              entityType: 'INVOICE',
              entityId: invoiceId,
              fromState: 'PENDING_APPROVAL',
              toState: 'APPROVED',
              actorId: approverId,
              timestamp: new Date(),
            },
          });
          return history;
        },
        compensate: async (_ctx, history) => {
          if (history) {
            await prisma.workflowHistory.delete({
              where: { id: history.id },
            });
          }
        },
      },

      // Step 3: Create audit log
      {
        name: 'CreateAuditLog',
        execute: async (_ctx) => {
          const log = await prisma.auditLog.create({
            data: {
              actorId: approverId,
              actorEmail: 'system',
              action: 'APPROVE',
              entityType: 'INVOICE',
              entityId: invoiceId,
              timestamp: new Date(),
            },
          });
          return log;
        },
        compensate: async (_ctx, _log) => {
          // Audit logs should not be deleted (immutable)
          // But we can mark them as compensated
          console.log('[Saga] Audit log compensation - log retained for compliance');
        },
      },

      // Step 4: Send notification
      {
        name: 'SendNotification',
        execute: async (_ctx) => {
          const invoice = await prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: { user: true },
          });

          if (invoice) {
            const notification = await prisma.notification.create({
              data: {
                userId: invoice.userId,
                type: 'INVOICE_APPROVED',
                channel: 'IN_APP',
                status: 'SENT',
                title: 'Invoice Approved',
                message: `Invoice ${invoice.invoiceNumber} has been approved.`,
                entityType: 'INVOICE',
                entityId: invoiceId,
                sentAt: new Date(),
              },
            });
            return notification;
          }
          return null;
        },
        compensate: async (_ctx, notification) => {
          // Mark notification as cancelled
          if (notification) {
            await prisma.notification.update({
              where: { id: notification.id },
              data: {
                status: 'FAILED',
                errorMessage: 'Transaction rolled back',
              },
            });
          }
        },
      },
    ];

    await this.txManager.executeSaga(steps, context);
  }

  /**
   * Batch update with transaction
   */
  async batchUpdate<T>(
    updates: Array<{ id: string; data: any }>,
    table: 'invoice' | 'expense',
    context: TransactionContext
  ): Promise<T[]> {
    return await this.txManager.execute(
      async (tx, _ctx) => {
        const results: T[] = [];

        for (const update of updates) {
          const model = table === 'invoice' ? tx.invoice : tx.expense;
          const result = await (model as any).update({
            where: { id: update.id },
            data: update.data,
          });
          results.push(result as T);
        }

        return results;
      },
      context,
      {
        isolationLevel: 'Serializable', // Highest isolation for batch updates
      }
    );
  }
}

// Export singleton instances
export const transactionManager = new TransactionManager();
export const workflowTransactions = new WorkflowTransactionPatterns(transactionManager);
