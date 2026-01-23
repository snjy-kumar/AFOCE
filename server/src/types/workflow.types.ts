/**
 * AFOCE Workflow Engine - Type Definitions
 * 
 * Enterprise-grade type system for workflow state machine,
 * business rules engine, and event-driven architecture.
 */

import type { 
  EntityType, 
  RuleAction, 
  RuleSeverity,
  AuditAction,
  NotificationType,
  NotificationChannel,
  RoleType
} from '@prisma/client';

// ============================================
// STATE MACHINE TYPES
// ============================================

/**
 * State transition definition with validation rules
 */
export interface StateTransition<TStatus = string> {
  from: TStatus;
  to: TStatus;
  requiredPermissions?: string[];
  requiredRole?: RoleType[];
  conditions?: TransitionCondition[];
  sideEffects?: SideEffect[];
}

/**
 * Condition that must be met for a state transition
 */
export interface TransitionCondition {
  type: 'FIELD_VALUE' | 'USER_ROLE' | 'CUSTOM_LOGIC';
  field?: string;
  operator?: ComparisonOperator;
  value?: unknown;
  customValidator?: (context: TransitionContext) => Promise<boolean>;
  errorMessage: string;
}

/**
 * Context passed to transition validators and side effects
 */
export interface TransitionContext<TEntity = unknown> {
  entity: TEntity;
  userId: string;
  userRoles: RoleType[];
  fromState: string;
  toState: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Side effect to execute after successful transition
 */
export interface SideEffect {
  type: 'NOTIFICATION' | 'AUDIT_LOG' | 'WEBHOOK' | 'CUSTOM';
  config: Record<string, unknown>;
  async: boolean; // Execute asynchronously in background job
}

/**
 * Result of state transition attempt
 */
export interface TransitionResult {
  success: boolean;
  newState?: string;
  errors?: string[];
  warnings?: string[];
  executedSideEffects?: string[];
}

// ============================================
// BUSINESS RULE ENGINE TYPES
// ============================================

/**
 * Abstract Syntax Tree for rule conditions
 * Supports complex nested logic: (A AND B) OR (C AND NOT D)
 */
export type RuleConditionAST =
  | RuleConditionLeaf
  | RuleConditionComposite;

/**
 * Leaf node - single condition
 */
export interface RuleConditionLeaf {
  type: 'LEAF';
  field: string; // e.g., "invoice.total", "expense.amount", "customer.type"
  operator: ComparisonOperator;
  value: unknown;
}

/**
 * Composite node - logical operators
 */
export interface RuleConditionComposite {
  type: 'COMPOSITE';
  operator: LogicalOperator;
  children: RuleConditionAST[];
}

/**
 * Comparison operators for rule conditions
 */
export type ComparisonOperator =
  | 'eq'          // Equal
  | 'ne'          // Not equal
  | 'gt'          // Greater than
  | 'gte'         // Greater than or equal
  | 'lt'          // Less than
  | 'lte'         // Less than or equal
  | 'in'          // Value in array
  | 'not_in'      // Value not in array
  | 'contains'    // String contains
  | 'starts_with' // String starts with
  | 'ends_with'   // String ends with
  | 'regex'       // Regex match
  | 'is_null'     // Is null/undefined
  | 'is_not_null' // Is not null/undefined
  | 'between';    // Between two values

/**
 * Logical operators for combining conditions
 */
export type LogicalOperator = 'AND' | 'OR' | 'NOT';

/**
 * Rule evaluation context
 */
export interface RuleEvaluationContext {
  entity: unknown; // Invoice, Expense, etc.
  entityType: EntityType;
  userId: string;
  userRoles: RoleType[];
  timestamp: Date;
  additionalData?: Record<string, unknown>; // Customer data, vendor data, etc.
}

/**
 * Result of rule evaluation
 */
export interface RuleEvaluationResult {
  ruleId: string;
  ruleName: string;
  triggered: boolean;
  action: RuleAction;
  actionParams?: Record<string, unknown>;
  severity: RuleSeverity;
  message?: string;
  timestamp: Date;
}

/**
 * Action parameters for different rule actions
 */
// Rule action parameters
export interface RuleActionParams extends Record<string, unknown> {
  // REQUIRE_APPROVAL
  approverRole?: RoleType;
  approverId?: string;
  approvalDeadline?: Date;
  escalationChain?: string[]; // User IDs for multi-level approval
  
  // REQUIRE_ATTACHMENT
  attachmentType?: string[];
  minAttachments?: number;
  
  // SEND_NOTIFICATION
  notificationType?: NotificationType;
  notificationChannels?: NotificationChannel[];
  recipients?: string[]; // User IDs or email addresses
  templateId?: string;
  
  // AUTO_ASSIGN
  assignToRole?: RoleType;
  assignToUserId?: string;
  assignmentLogic?: 'ROUND_ROBIN' | 'LEAST_LOADED' | 'CUSTOM';
  
  // BLOCK_CREATION / SHOW_WARNING
  message?: string;
  bypassable?: boolean; // Can user override with reason?
  
  // CALCULATE_FIELD
  targetField?: string;
  calculation?: string; // Expression: "amount * 1.13" for VAT
}

// ============================================
// PERMISSION & RBAC TYPES
// ============================================

/**
 * Permission definition
 */
export interface Permission {
  resource: string; // "invoices", "expenses", "customers", "settings"
  action: PermissionAction;
  conditions?: PermissionCondition[]; // Conditional permissions
}

/**
 * Permission actions
 */
export type PermissionAction =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'approve'
  | 'reject'
  | 'send'
  | 'export'
  | 'import'
  | 'configure';

/**
 * Conditional permission (e.g., "can edit own invoices only")
 */
export interface PermissionCondition {
  type: 'OWN_RESOURCE' | 'ROLE_HIERARCHY' | 'CUSTOM';
  validator?: (context: PermissionCheckContext) => Promise<boolean>;
}

/**
 * Context for permission checking
 */
export interface PermissionCheckContext {
  userId: string;
  userRoles: RoleType[];
  resource: string;
  action: PermissionAction;
  resourceOwnerId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Permission matrix - maps roles to permissions
 */
export type PermissionMatrix = Record<RoleType, Permission[]>;

// ============================================
// AUDIT LOG TYPES
// ============================================

/**
 * Audit log entry structure
 */
export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  actorId: string;
  actorEmail: string;
  actorRole?: string;
  ipAddress?: string;
  userAgent?: string;
  action: AuditAction;
  entityType?: EntityType;
  entityId?: string;
  changes?: ChangeSet;
  metadata?: Record<string, unknown>;
  checksum?: string; // SHA-256 for tamper detection
}

/**
 * Change set for UPDATE actions
 */
export interface ChangeSet {
  old: Record<string, unknown>;
  new: Record<string, unknown>;
}

/**
 * Audit query parameters
 */
export interface AuditQuery {
  actorId?: string;
  entityType?: EntityType;
  entityId?: string;
  action?: AuditAction;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

// ============================================
// NOTIFICATION TYPES
// ============================================

/**
 * Notification payload
 */
export interface NotificationPayload {
  userId: string;
  type: NotificationType;
  channels: NotificationChannel[];
  title: string;
  message: string;
  data?: Record<string, unknown>;
  entityType?: EntityType;
  entityId?: string;
  actionUrl?: string;
  actions?: NotificationAction[];
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  expiresAt?: Date;
}

/**
 * Action button in notification
 */
export interface NotificationAction {
  label: string;
  action: string; // "approve", "reject", "view"
  url: string;
  method?: 'GET' | 'POST' | 'PATCH';
  style?: 'primary' | 'secondary' | 'danger';
}

// ============================================
// BACKGROUND JOB TYPES
// ============================================

/**
 * Job payload for queue system
 */
export interface JobPayload {
  type: string;
  data: Record<string, unknown>;
  userId?: string;
  priority?: number;
  attempts?: number;
  backoff?: {
    type: 'exponential' | 'fixed';
    delay: number;
  };
}

/**
 * Job types
 */
export type JobType =
  | 'SEND_EMAIL'
  | 'SEND_SMS'
  | 'GENERATE_REPORT'
  | 'PROCESS_INVOICE'
  | 'AUTO_REMINDER'
  | 'DAILY_OVERDUE_CHECK'
  | 'MONTHLY_VAT_REPORT'
  | 'BACKUP_DATABASE'
  | 'CLEANUP_EXPIRED_NOTIFICATIONS';

// ============================================
// WORKFLOW STATE METADATA
// ============================================

/**
 * Workflow state stored in entity's workflowState JSON field
 */
export interface WorkflowStateMetadata {
  currentState: string;
  previousState?: string;
  nextPossibleActions: string[];
  assignedTo?: string[]; // User IDs who can take action
  assignedRole?: RoleType;
  deadline?: Date;
  escalationLevel?: number; // For multi-level approvals
  metadata?: Record<string, unknown>;
  history?: WorkflowStateSnapshot[];
}

/**
 * Snapshot of workflow state at a point in time
 */
export interface WorkflowStateSnapshot {
  state: string;
  timestamp: Date;
  actorId: string;
  duration?: number; // Milliseconds spent in this state
}

// ============================================
// EVENT SYSTEM TYPES
// ============================================

/**
 * Domain event for event-driven architecture
 */
export interface DomainEvent<TPayload = unknown> {
  id: string;
  type: string;
  aggregateId: string; // Entity ID
  aggregateType: EntityType;
  payload: TPayload;
  metadata: {
    userId: string;
    timestamp: Date;
    correlationId?: string;
    causationId?: string;
  };
}

/**
 * Event handler function
 */
export type EventHandler<TPayload = unknown> = (
  event: DomainEvent<TPayload>
) => Promise<void>;

/**
 * Event types
 */
export type EventType =
  | 'invoice.created'
  | 'invoice.updated'
  | 'invoice.submitted_for_approval'
  | 'invoice.approved'
  | 'invoice.rejected'
  | 'invoice.sent'
  | 'invoice.paid'
  | 'invoice.overdue'
  | 'expense.created'
  | 'expense.submitted_for_approval'
  | 'expense.approved'
  | 'expense.rejected'
  | 'rule.triggered'
  | 'notification.sent'
  | 'audit.logged';

// ============================================
// SERVICE RESPONSE TYPES
// ============================================

/**
 * Standard service response wrapper
 */
export interface ServiceResponse<TData = unknown> {
  success: boolean;
  data?: TData;
  error?: ServiceError;
  metadata?: {
    timestamp: Date;
    requestId?: string;
    warnings?: string[];
  };
}

/**
 * Service error details
 */
export interface ServiceError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  stack?: string;
}

// ============================================
// CONFIGURATION TYPES
// ============================================

/**
 * Workflow engine configuration
 */
export interface WorkflowEngineConfig {
  enableOptimisticLocking: boolean;
  maxRetries: number;
  retryBackoff: number; // milliseconds
  enableAuditLog: boolean;
  enableNotifications: boolean;
  strictTransitionValidation: boolean;
  allowManualStateOverride: boolean; // For admins only
}

/**
 * Rule engine configuration
 */
export interface RuleEngineConfig {
  maxRuleExecutionTime: number; // milliseconds
  enableRuleCaching: boolean;
  cacheTTL: number; // seconds
  maxConditionDepth: number; // Prevent infinite nesting
  enableRuleMetrics: boolean;
  defaultSeverity: RuleSeverity;
}

/**
 * Notification service configuration
 */
export interface NotificationServiceConfig {
  enableEmailNotifications: boolean;
  enableSMSNotifications: boolean;
  enableInAppNotifications: boolean;
  emailProvider: {
    type: 'SMTP' | 'SENDGRID' | 'SES';
    config: Record<string, unknown>;
  };
  smsProvider?: {
    type: 'TWILIO' | 'NEXMO';
    config: Record<string, unknown>;
  };
  retryPolicy: {
    maxAttempts: number;
    backoff: 'exponential' | 'fixed';
    initialDelay: number;
  };
}
