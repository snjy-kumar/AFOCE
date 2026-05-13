import type { BankLineState } from "@/lib/types";

export interface ReconciliationDecision {
  state: BankLineState;
  confidence: number;
  rationale: string[];
}

export function decideReconciliationState(confidence: number): ReconciliationDecision {
  if (confidence >= 95) {
    return {
      state: "matched",
      confidence,
      rationale: ["High-confidence bank match can be reconciled automatically."],
    };
  }

  if (confidence >= 60) {
    return {
      state: "needs_review",
      confidence,
      rationale: ["Medium-confidence bank match requires exception review."],
    };
  }

  return {
    state: "unmatched",
    confidence,
    rationale: ["No reliable bank match was found."],
  };
}
