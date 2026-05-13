import type {
  AutonomousPolicy,
  FinanceEventType,
  PolicyCondition,
  PolicyEvaluation,
  PolicyValue,
} from "@/lib/afoce/types";

type FactValue = string | number | boolean | null | undefined;

export function evaluatePolicies(
  policies: AutonomousPolicy[],
  eventType: FinanceEventType,
  facts: Record<string, FactValue>
): PolicyEvaluation[] {
  return policies
    .filter((policy) => policy.status === "active" && policy.trigger_type === eventType)
    .sort((a, b) => b.priority - a.priority)
    .map((policy) => evaluatePolicy(policy, facts));
}

export function evaluatePolicy(
  policy: AutonomousPolicy,
  facts: Record<string, FactValue>
): PolicyEvaluation {
  const reasons: string[] = [];
  const matched = policy.conditions.every((condition) => {
    const factValue = facts[condition.fact];
    const result = evaluateCondition(condition, factValue);
    reasons.push(
      `${condition.fact} ${condition.operator} ${formatPolicyValue(condition.value)} => ${result ? "match" : "no match"}`
    );
    return result;
  });

  return { policy, matched, reasons };
}

export function evaluateCondition(condition: PolicyCondition, factValue: FactValue): boolean {
  switch (condition.operator) {
    case "exists":
      return factValue !== null && factValue !== undefined && factValue !== "";
    case "missing":
      return factValue === null || factValue === undefined || factValue === "";
    case "eq":
      return factValue === condition.value;
    case "neq":
      return factValue !== condition.value;
    case "gt":
      return compareNumber(factValue, condition.value, (left, right) => left > right);
    case "gte":
      return compareNumber(factValue, condition.value, (left, right) => left >= right);
    case "lt":
      return compareNumber(factValue, condition.value, (left, right) => left < right);
    case "lte":
      return compareNumber(factValue, condition.value, (left, right) => left <= right);
    case "in":
      return isInPolicyValue(factValue, condition.value);
    case "not_in":
      return !isInPolicyValue(factValue, condition.value);
    default:
      return false;
  }
}

function compareNumber(
  factValue: FactValue,
  policyValue: PolicyValue | undefined,
  compare: (left: number, right: number) => boolean
): boolean {
  if (typeof factValue !== "number" || typeof policyValue !== "number") return false;
  return compare(factValue, policyValue);
}

function isInPolicyValue(factValue: FactValue, policyValue: PolicyValue | undefined): boolean {
  if (!Array.isArray(policyValue)) return false;
  return policyValue.some((entry) => entry === factValue);
}

function formatPolicyValue(value: PolicyValue | undefined): string {
  if (value === undefined) return "undefined";
  return Array.isArray(value) ? `[${value.join(", ")}]` : String(value);
}
