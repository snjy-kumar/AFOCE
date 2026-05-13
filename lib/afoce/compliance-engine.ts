import type { AutonomousDecision, ExpenseDecisionInput } from "@/lib/afoce/types";

export interface ComplianceFinding {
  code: string;
  severity: "info" | "warning" | "blocker";
  message: string;
}

export function evaluateExpenseCompliance(input: ExpenseDecisionInput): ComplianceFinding[] {
  const findings: ComplianceFinding[] = [];

  if (input.amount >= 5000 && !input.receipt_url) {
    findings.push({
      code: "EXPENSE_RECEIPT_REQUIRED",
      severity: "blocker",
      message: "Receipt is required for expenses at or above NPR 5,000.",
    });
  }

  if (!input.description?.trim() && input.amount >= 50000) {
    findings.push({
      code: "HIGH_VALUE_DESCRIPTION_REQUIRED",
      severity: "warning",
      message: "High-value expenses should include a business reason.",
    });
  }

  return findings;
}

export function attachComplianceFindings(
  decision: AutonomousDecision,
  findings: ComplianceFinding[]
): AutonomousDecision {
  if (findings.length === 0) return decision;

  return {
    ...decision,
    rationale: [
      ...decision.rationale,
      ...findings.map((finding) => `${finding.code}: ${finding.message}`),
    ],
    facts: {
      ...decision.facts,
      complianceFindings: findings,
    },
  };
}
