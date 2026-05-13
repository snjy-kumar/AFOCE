import type { ActionExecutionPlan, AutonomousDecision } from "@/lib/afoce/types";

export function planExpenseExecution(decision: AutonomousDecision): ActionExecutionPlan {
  switch (decision.outcome) {
    case "approve":
      return {
        status: "approved",
        shouldNotifyHumans: false,
        notificationReason: "Expense approved automatically by policy.",
      };
    case "block":
      return {
        status: "blocked",
        shouldNotifyHumans: true,
        notificationReason: "Expense blocked by policy and requires exception review.",
      };
    case "require_review":
      return {
        status: "manager_review",
        shouldNotifyHumans: true,
        notificationReason: "Expense requires human review due to policy outcome.",
      };
    case "record_only":
      return {
        status: "pending_approval",
        shouldNotifyHumans: true,
        notificationReason: "Decision was recorded without an autonomous action.",
      };
  }
}
