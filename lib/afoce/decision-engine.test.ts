import { describe, expect, it } from "vitest";

import { decideExpense } from "@/lib/afoce/decision-engine";

describe("AFOCE expense decision engine", () => {
  it("auto-approves low-risk expenses from default policies", () => {
    const decision = decideExpense({
      employee: "Sita Rai",
      category: "Office Supplies",
      amount: 800,
      bs_date: "Baisakh 2081",
      ad_date: "2024-04-14",
    });

    expect(decision.outcome).toBe("approve");
    expect(decision.requiresHuman).toBe(false);
    expect(decision.matchedPolicyIds).toContain("DEFAULT-EXPENSE-LOW-RISK-AUTO-APPROVE");
  });

  it("blocks material expenses without receipts", () => {
    const decision = decideExpense({
      employee: "Hari Thapa",
      category: "Travel",
      amount: 12000,
      bs_date: "Baisakh 2081",
      ad_date: "2024-04-14",
    });

    expect(decision.outcome).toBe("block");
    expect(decision.requiresHuman).toBe(true);
    expect(decision.matchedPolicyIds).toContain("DEFAULT-EXPENSE-RECEIPT-BLOCK");
  });

  it("uses executable policy records when provided", () => {
    const decision = decideExpense(
      {
        employee: "Nima Sherpa",
        category: "Training",
        amount: 3000,
        bs_date: "Baisakh 2081",
        ad_date: "2024-04-14",
      },
      [
        {
          id: "POL-TRAINING-REVIEW",
          name: "Training expenses need review",
          category: "expenses",
          status: "active",
          trigger_type: "expense.created",
          priority: 50,
          version: 1,
          conditions: [{ fact: "category", operator: "eq", value: "Training" }],
          actions: [
            {
              type: "require_review",
              reason: "Training budget needs finance review.",
              confidence: 88,
            },
          ],
        },
      ]
    );

    expect(decision.outcome).toBe("require_review");
    expect(decision.confidence).toBe(88);
    expect(decision.matchedPolicyIds).toEqual(["POL-TRAINING-REVIEW"]);
  });
});
