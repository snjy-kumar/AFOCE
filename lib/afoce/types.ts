import type { BankLineState, ExpenseStatus, PolicyCategory } from "@/lib/types";

export type FinanceEventType =
  | "expense.created"
  | "invoice.created"
  | "bank_line.imported"
  | "vat.period_due";

export type DecisionOutcome = "approve" | "require_review" | "block" | "record_only";

export type PolicyOperator =
  | "eq"
  | "neq"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "in"
  | "not_in"
  | "exists"
  | "missing";

export type PolicyValue = string | number | boolean | string[] | number[];

export interface PolicyCondition {
  fact: string;
  operator: PolicyOperator;
  value?: PolicyValue;
}

export interface PolicyAction {
  type: DecisionOutcome;
  reason: string;
  confidence?: number;
  metadata?: Record<string, unknown>;
}

export interface AutonomousPolicy {
  id: string;
  org_id?: string;
  name: string;
  description?: string | null;
  category: PolicyCategory;
  status: "active" | "inactive";
  trigger_type: FinanceEventType;
  conditions: PolicyCondition[];
  actions: PolicyAction[];
  priority: number;
  version: number;
}

export interface PolicyEvaluation {
  policy: AutonomousPolicy;
  matched: boolean;
  reasons: string[];
}

export interface ExpenseDecisionInput {
  employee: string;
  category: string;
  amount: number;
  bs_date: string;
  ad_date: string;
  receipt_url?: string | null;
  description?: string;
}

export interface ExpenseDecisionFacts extends Record<string, string | number | boolean | null> {
  employee: string;
  category: string;
  amount: number;
  bs_date: string;
  ad_date: string;
  receiptAttached: boolean;
  hasDescription: boolean;
}

export interface AutonomousDecision {
  eventType: FinanceEventType;
  entityType: "expense" | "invoice" | "bank_line" | "vat_period";
  outcome: DecisionOutcome;
  confidence: number;
  matchedPolicyIds: string[];
  rationale: string[];
  facts: Record<string, unknown>;
  actions: PolicyAction[];
  requiresHuman: boolean;
}

export interface DecisionLogInsert {
  org_id: string;
  actor_id: string | null;
  event_type: FinanceEventType;
  entity_type: AutonomousDecision["entityType"];
  entity_id: string;
  outcome: DecisionOutcome;
  confidence: number;
  matched_policy_ids: string[];
  rationale: string[];
  facts: Record<string, unknown>;
  actions: PolicyAction[];
}

export interface ActionExecutionPlan {
  status?: ExpenseStatus | BankLineState;
  shouldNotifyHumans: boolean;
  notificationReason: string;
}
