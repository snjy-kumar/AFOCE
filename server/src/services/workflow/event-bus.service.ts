/**
 * AFOCE Event Bus - Event-Driven Architecture Backbone
 * 
 * Implements Publisher-Subscriber pattern for loose coupling between:
 * - State Machine → Notifications
 * - Rule Engine → Audit Logger  
 * - Workflow Actions → Background Jobs
 * 
 * Design Principles:
 * - Async event processing (non-blocking)
 * - Multiple subscribers per event
 * - Error isolation (one handler failure doesn't affect others)
 * - Event replay capability for debugging
 * - Type-safe event payloads
 */

import type { DomainEvent, EventHandler, EventType } from '../../types/workflow.types.js';
import type { EntityType } from '@prisma/client';
import { nanoid } from 'nanoid';

// ============================================
// EVENT BUS IMPLEMENTATION
// ============================================

export class EventBus {
  private handlers: Map<string, Set<EventHandler>> = new Map();
  private eventHistory: DomainEvent[] = [];
  private readonly MAX_HISTORY = 1000;
  private readonly ENABLE_HISTORY = process.env.NODE_ENV === 'development';

  /**
   * Subscribe to an event type
   */
  subscribe<TPayload = unknown>(
    eventType: EventType,
    handler: EventHandler<TPayload>
  ): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }

    this.handlers.get(eventType)!.add(handler as EventHandler);

    // Return unsubscribe function
    return () => {
      this.handlers.get(eventType)?.delete(handler as EventHandler);
    };
  }

  /**
   * Publish an event to all subscribers
   */
  async publish<TPayload = unknown>(
    eventType: EventType,
    aggregateId: string,
    aggregateType: EntityType,
    payload: TPayload,
    metadata: {
      userId: string;
      timestamp?: Date;
      correlationId?: string;
      causationId?: string;
    }
  ): Promise<void> {
    const event: DomainEvent<TPayload> = {
      id: nanoid(),
      type: eventType,
      aggregateId,
      aggregateType,
      payload,
      metadata: {
        userId: metadata.userId,
        timestamp: metadata.timestamp || new Date(),
        correlationId: metadata.correlationId || nanoid(),
        causationId: metadata.causationId,
      },
    };

    // Store in history (for debugging)
    if (this.ENABLE_HISTORY) {
      this.eventHistory.push(event);
      if (this.eventHistory.length > this.MAX_HISTORY) {
        this.eventHistory.shift(); // Remove oldest
      }
    }

    // Get handlers for this event type
    const handlers = this.handlers.get(eventType);
    if (!handlers || handlers.size === 0) {
      console.warn(`[EventBus] No handlers for event: ${eventType}`);
      return;
    }

    // Execute all handlers in parallel (non-blocking)
    const promises = Array.from(handlers).map(handler =>
      this.executeHandler(handler, event)
    );

    // Wait for all handlers (but don't throw on individual failures)
    await Promise.allSettled(promises);
  }

  /**
   * Execute a single handler with error isolation
   */
  private async executeHandler<TPayload>(
    handler: EventHandler<TPayload>,
    event: DomainEvent<TPayload>
  ): Promise<void> {
    try {
      await handler(event);
    } catch (error: any) {
      console.error(
        `[EventBus] Handler failed for event ${event.type}:`,
        error.message
      );
      // TODO: Send to error tracking service (Sentry, DataDog)
      // Don't throw - error isolation principle
    }
  }

  /**
   * Get event history (for debugging)
   */
  getHistory(filter?: {
    eventType?: EventType;
    aggregateId?: string;
    userId?: string;
    limit?: number;
  }): DomainEvent[] {
    let events = [...this.eventHistory];

    if (filter?.eventType) {
      events = events.filter(e => e.type === filter.eventType);
    }

    if (filter?.aggregateId) {
      events = events.filter(e => e.aggregateId === filter.aggregateId);
    }

    if (filter?.userId) {
      events = events.filter(e => e.metadata.userId === filter.userId);
    }

    if (filter?.limit) {
      events = events.slice(-filter.limit);
    }

    return events.reverse(); // Most recent first
  }

  /**
   * Clear event history
   */
  clearHistory(): void {
    this.eventHistory = [];
  }

  /**
   * Get subscriber count for event type
   */
  getSubscriberCount(eventType: EventType): number {
    return this.handlers.get(eventType)?.size || 0;
  }

  /**
   * List all subscribed event types
   */
  getSubscribedEvents(): EventType[] {
    return Array.from(this.handlers.keys()) as EventType[];
  }
}

// ============================================
// EVENT EMITTER HELPERS
// ============================================

/**
 * Helper functions for emitting domain events
 */
export class DomainEventEmitter {
  constructor(private eventBus: EventBus) {}

  // Invoice Events
  async invoiceCreated(params: {
    invoiceId: string;
    invoice: any;
    userId: string;
    correlationId?: string;
  }): Promise<void> {
    await this.eventBus.publish(
      'invoice.created',
      params.invoiceId,
      'INVOICE',
      params.invoice,
      {
        userId: params.userId,
        correlationId: params.correlationId,
      }
    );
  }

  async invoiceUpdated(params: {
    invoiceId: string;
    oldInvoice: any;
    newInvoice: any;
    userId: string;
    correlationId?: string;
  }): Promise<void> {
    await this.eventBus.publish(
      'invoice.updated',
      params.invoiceId,
      'INVOICE',
      {
        old: params.oldInvoice,
        new: params.newInvoice,
      },
      {
        userId: params.userId,
        correlationId: params.correlationId,
      }
    );
  }

  async invoiceSubmittedForApproval(params: {
    invoiceId: string;
    invoice: any;
    approver: string;
    userId: string;
    correlationId?: string;
  }): Promise<void> {
    await this.eventBus.publish(
      'invoice.submitted_for_approval',
      params.invoiceId,
      'INVOICE',
      {
        invoice: params.invoice,
        approver: params.approver,
      },
      {
        userId: params.userId,
        correlationId: params.correlationId,
      }
    );
  }

  async invoiceApproved(params: {
    invoiceId: string;
    invoice: any;
    approver: string;
    userId: string;
    correlationId?: string;
  }): Promise<void> {
    await this.eventBus.publish(
      'invoice.approved',
      params.invoiceId,
      'INVOICE',
      {
        invoice: params.invoice,
        approver: params.approver,
      },
      {
        userId: params.userId,
        correlationId: params.correlationId,
      }
    );
  }

  async invoiceRejected(params: {
    invoiceId: string;
    invoice: any;
    rejector: string;
    reason: string;
    userId: string;
    correlationId?: string;
  }): Promise<void> {
    await this.eventBus.publish(
      'invoice.rejected',
      params.invoiceId,
      'INVOICE',
      {
        invoice: params.invoice,
        rejector: params.rejector,
        reason: params.reason,
      },
      {
        userId: params.userId,
        correlationId: params.correlationId,
      }
    );
  }

  async invoiceSent(params: {
    invoiceId: string;
    invoice: any;
    customer: any;
    userId: string;
    correlationId?: string;
  }): Promise<void> {
    await this.eventBus.publish(
      'invoice.sent',
      params.invoiceId,
      'INVOICE',
      {
        invoice: params.invoice,
        customer: params.customer,
      },
      {
        userId: params.userId,
        correlationId: params.correlationId,
      }
    );
  }

  async invoicePaid(params: {
    invoiceId: string;
    invoice: any;
    paymentAmount: number;
    userId: string;
    correlationId?: string;
  }): Promise<void> {
    await this.eventBus.publish(
      'invoice.paid',
      params.invoiceId,
      'INVOICE',
      {
        invoice: params.invoice,
        paymentAmount: params.paymentAmount,
      },
      {
        userId: params.userId,
        correlationId: params.correlationId,
      }
    );
  }

  async invoiceOverdue(params: {
    invoiceId: string;
    invoice: any;
    daysOverdue: number;
    userId: string;
    correlationId?: string;
  }): Promise<void> {
    await this.eventBus.publish(
      'invoice.overdue',
      params.invoiceId,
      'INVOICE',
      {
        invoice: params.invoice,
        daysOverdue: params.daysOverdue,
      },
      {
        userId: params.userId,
        correlationId: params.correlationId,
      }
    );
  }

  // Expense Events
  async expenseCreated(params: {
    expenseId: string;
    expense: any;
    userId: string;
    correlationId?: string;
  }): Promise<void> {
    await this.eventBus.publish(
      'expense.created',
      params.expenseId,
      'EXPENSE',
      params.expense,
      {
        userId: params.userId,
        correlationId: params.correlationId,
      }
    );
  }

  async expenseSubmittedForApproval(params: {
    expenseId: string;
    expense: any;
    approver: string;
    userId: string;
    correlationId?: string;
  }): Promise<void> {
    await this.eventBus.publish(
      'expense.submitted_for_approval',
      params.expenseId,
      'EXPENSE',
      {
        expense: params.expense,
        approver: params.approver,
      },
      {
        userId: params.userId,
        correlationId: params.correlationId,
      }
    );
  }

  async expenseApproved(params: {
    expenseId: string;
    expense: any;
    approver: string;
    userId: string;
    correlationId?: string;
  }): Promise<void> {
    await this.eventBus.publish(
      'expense.approved',
      params.expenseId,
      'EXPENSE',
      {
        expense: params.expense,
        approver: params.approver,
      },
      {
        userId: params.userId,
        correlationId: params.correlationId,
      }
    );
  }

  async expenseRejected(params: {
    expenseId: string;
    expense: any;
    rejector: string;
    reason: string;
    userId: string;
    correlationId?: string;
  }): Promise<void> {
    await this.eventBus.publish(
      'expense.rejected',
      params.expenseId,
      'EXPENSE',
      {
        expense: params.expense,
        rejector: params.rejector,
        reason: params.reason,
      },
      {
        userId: params.userId,
        correlationId: params.correlationId,
      }
    );
  }

  // Rule Events
  async ruleTriggered(params: {
    ruleId: string;
    ruleName: string;
    entityType: EntityType;
    entityId: string;
    action: string;
    userId: string;
    correlationId?: string;
  }): Promise<void> {
    await this.eventBus.publish(
      'rule.triggered',
      params.ruleId,
      params.entityType,
      {
        ruleName: params.ruleName,
        entityId: params.entityId,
        action: params.action,
      },
      {
        userId: params.userId,
        correlationId: params.correlationId,
      }
    );
  }

  // Audit Events
  async auditLogged(params: {
    logId: string;
    action: string;
    entityType: EntityType;
    entityId: string;
    userId: string;
    correlationId?: string;
  }): Promise<void> {
    await this.eventBus.publish(
      'audit.logged',
      params.logId,
      params.entityType,
      {
        action: params.action,
        entityId: params.entityId,
      },
      {
        userId: params.userId,
        correlationId: params.correlationId,
      }
    );
  }

  // Notification Events
  async notificationSent(params: {
    notificationId: string;
    recipientId: string;
    type: string;
    channel: string;
    userId: string;
    correlationId?: string;
  }): Promise<void> {
    await this.eventBus.publish(
      'notification.sent',
      params.notificationId,
      'INVOICE', // Using INVOICE as placeholder
      {
        recipientId: params.recipientId,
        type: params.type,
        channel: params.channel,
      },
      {
        userId: params.userId,
        correlationId: params.correlationId,
      }
    );
  }
}

// Export singleton instances
export const eventBus = new EventBus();
export const domainEvents = new DomainEventEmitter(eventBus);
