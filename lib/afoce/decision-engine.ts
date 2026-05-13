import type {
  AutonomousDecision,
  AutonomousPolicy,
  ExpenseDecisionFacts,
  ExpenseDecisionInput,
  FinanceEventType,
  PolicyAction,
  PolicyCondition,
} from "@/lib/afoce/types";
import { evaluatePolicies } from "@/lib/afoce/policy-engine";

interface LegacyPolicyRule {
  field: string;
  operator: PolicyCondition["operator"];
  value: PolicyCondition["value"];
  action: PolicyAction["type"];
}

export const defaultExpensePolicies: AutonomousPolicy[] = [
  {
    id: "DEFAULT-EXPENSE-RECEIPT-BLOCK",
    name: "Block receiptless material expenses",
    category: "expenses",
    status: "active",
    trigger_type: "expense.created",
    priority: 100,
    version: 1,
    conditions: [
      { fact: "amount", operator: "gte", value: 5000 },
      { fact: "receiptAttached", operator: "eq", value: false },
    ],
    actions: [
      {
        type: "block",
        reason: "Expense is above NPR 5,000 and has no receipt.",
        confidence: 95,
      },
    ],
  },
  {
    id: "DEFAULT-EXPENSE-HIGH-VALUE-REVIEW",
    name: "Review high-value expenses",
    category: "expenses",
    status: "active",
    trigger_type: "expense.created",
    priority: 80,
    version: 1,
    conditions: [{ fact: "amount", operator: "gte", value: 50000 }],
    actions: [
      {
        type: "require_review",
        reason: "Expense amount crosses the high-value review threshold.",
        confidence: 90,
      },
    ],
  },
  {
    id: "DEFAULT-EXPENSE-LOW-RISK-AUTO-APPROVE",
    name: "Auto-approve low-risk expenses",
    category: "expenses",
    status: "active",
    trigger_type: "expense.created",
    priority: 10,
    version: 1,
    conditions: [{ fact: "amount", operator: "lte", value: 1000 }],
    actions: [
      {
        type: "approve",
        reason: "Expense is below the low-risk auto-approval threshold.",
        confidence: 85,
      },
    ],
  },
];

export function decideExpense(
  input: ExpenseDecisionInput,
  policyRecords: unknown[] = []
): AutonomousDecision {
  const facts = buildExpenseFacts(input);
  const policies = normalizePolicies(policyRecords, "expense.created");
  const activePolicies = policies.length > 0 ? policies : defaultExpensePolicies;
  const evaluations = evaluatePolicies(activePolicies, "expense.created", facts);
  const matchedEvaluations = evaluations.filter((evaluation) => evaluation.matched);
  const matchedActions = matchedEvaluations.flatMap((evaluation) => evaluation.policy.actions);
  const primaryAction = pickPrimaryAction(matchedActions);

  if (!primaryAction) {
    return {
      eventType: "expense.created",
      entityType: "expense",
      outcome: "require_review",
      confidence: 55,
      matchedPolicyIds: [],
      rationale: ["No active policy produced a safe autonomous action."],
      facts,
      actions: [
        {
          type: "require_review",
          reason: "Fallback review because no policy matched.",
          confidence: 55,
        },
      ],
      requiresHuman: true,
    };
  }

  return {
    eventType: "expense.created",
    entityType: "expense",
    outcome: primaryAction.type,
    confidence: primaryAction.confidence ?? defaultConfidence(primaryAction.type),
    matchedPolicyIds: matchedEvaluations.map((evaluation) => evaluation.policy.id),
    rationale: matchedEvaluations.flatMap((evaluation) => [
      `Matched policy: ${evaluation.policy.name}`,
      ...evaluation.reasons,
    ]),
    facts,
    actions: matchedActions,
    requiresHuman: primaryAction.type !== "approve",
  };
}

export function buildExpenseFacts(input: ExpenseDecisionInput): ExpenseDecisionFacts {
  return {
    employee: input.employee,
    category: input.category,
    amount: input.amount,
    bs_date: input.bs_date,
    ad_date: input.ad_date,
    receiptAttached: Boolean(input.receipt_url),
    hasDescription: Boolean(input.description?.trim()),
  };
}

export function normalizePolicies(
  records: unknown[],
  triggerType: FinanceEventType
): AutonomousPolicy[] {
  return records
    .map((record) => normalizePolicy(record, triggerType))
    .filter((policy): policy is AutonomousPolicy => policy !== null);
}

function normalizePolicy(record: unknown, fallbackTriggerType: FinanceEventType): AutonomousPolicy | null {
  if (!isRecord(record)) return null;
  const id = readString(record.id);
  const name = readString(record.name);
  const category = readString(record.category);
  const status = readString(record.status);

  if (!id || !name || !isPolicyCategory(category) || !isPolicyStatus(status)) return null;

  return {
    id,
    org_id: readString(record.org_id) || undefined,
    name,
    description: readString(record.description),
    category,
    status,
    trigger_type: readFinanceEventType(record.trigger_type) || fallbackTriggerType,
    conditions: readConditions(record.conditions, record.rules),
    actions: readActions(record.actions, record.rules),
    priority: readNumber(record.priority) ?? 0,
    version: readNumber(record.version) ?? 1,
  };
}

function pickPrimaryAction(actions: PolicyAction[]): PolicyAction | null {
  const severity: Record<PolicyAction["type"], number> = {
    block: 4,
    require_review: 3,
    approve: 2,
    record_only: 1,
  };

  return (
    [...actions].sort(
      (left, right) =>
        severity[right.type] - severity[left.type] ||
        (right.confidence ?? defaultConfidence(right.type)) -
          (left.confidence ?? defaultConfidence(left.type))
    )[0] || null
  );
}

function defaultConfidence(outcome: PolicyAction["type"]): number {
  if (outcome === "block") return 95;
  if (outcome === "approve") return 80;
  if (outcome === "record_only") return 70;
  return 65;
}

function readConditions(primary: unknown, legacyRules: unknown): PolicyCondition[] {
  const fromConditions = readConditionArray(primary);
  if (fromConditions.length > 0) return fromConditions;
  return readLegacyRules(legacyRules).map(({ field, operator, value }) => ({
    fact: field,
    operator,
    value,
  }));
}

function readActions(primary: unknown, legacyRules: unknown): PolicyAction[] {
  const fromActions = readActionArray(primary);
  if (fromActions.length > 0) return fromActions;

  return readLegacyRules(legacyRules).map(({ action }) => ({
    type: action,
    reason: `Legacy rule requested ${action}.`,
    confidence: defaultConfidence(action),
  }));
}

function readConditionArray(value: unknown): PolicyCondition[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isPolicyCondition);
}

function readActionArray(value: unknown): PolicyAction[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isPolicyAction);
}

function readLegacyRules(value: unknown): LegacyPolicyRule[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((entry) => {
    if (!isRecord(entry)) return [];
    const field = readString(entry.field);
    const operator = readString(entry.operator);
    const action = normalizeAction(readString(entry.action));

    if (!field || !isPolicyOperator(operator) || !action) return [];
    return [{ field, operator, value: readPolicyValue(entry.value), action }];
  });
}

function isPolicyCondition(value: unknown): value is PolicyCondition {
  if (!isRecord(value)) return false;
  return Boolean(readString(value.fact) && isPolicyOperator(readString(value.operator)));
}

function isPolicyAction(value: unknown): value is PolicyAction {
  if (!isRecord(value)) return false;
  return Boolean(normalizeAction(readString(value.type)) && readString(value.reason));
}

function isPolicyOperator(value: string | null): value is PolicyCondition["operator"] {
  return (
    value === "eq" ||
    value === "neq" ||
    value === "gt" ||
    value === "gte" ||
    value === "lt" ||
    value === "lte" ||
    value === "in" ||
    value === "not_in" ||
    value === "exists" ||
    value === "missing"
  );
}

function normalizeAction(value: string | null): PolicyAction["type"] | null {
  if (value === "auto_approve" || value === "approve") return "approve";
  if (value === "require_review") return "require_review";
  if (value === "block") return "block";
  if (value === "record_only") return "record_only";
  return null;
}

function isPolicyCategory(value: string | null): value is AutonomousPolicy["category"] {
  return value === "expenses" || value === "approvals" || value === "invoicing";
}

function isPolicyStatus(value: string | null): value is AutonomousPolicy["status"] {
  return value === "active" || value === "inactive";
}

function readFinanceEventType(value: unknown): FinanceEventType | null {
  return value === "expense.created" ||
    value === "invoice.created" ||
    value === "bank_line.imported" ||
    value === "vat.period_due"
    ? value
    : null;
}

function readPolicyValue(value: unknown): PolicyCondition["value"] {
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    value === undefined
  ) {
    return value;
  }
  if (Array.isArray(value) && value.every((entry) => typeof entry === "string")) return value;
  if (Array.isArray(value) && value.every((entry) => typeof entry === "number")) return value;
  return undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function readNumber(value: unknown): number | null {
  return typeof value === "number" ? value : null;
}
