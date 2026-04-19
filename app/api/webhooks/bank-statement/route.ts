// ============================================================
// Bank Statement Webhook - Receive bank transactions
// ============================================================

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { findMatchCandidates } from "@/lib/utils/workflow";
import { applySecurityHeaders } from "@/lib/utils/security";

// Bank statement line format
interface BankStatementLine {
  date: string;
  description: string;
  amount: number;
  reference?: string;
}

interface WebhookBody {
  orgId?: string;
  source?: string;
  lines?: BankStatementLine[];
}

export async function POST(request: Request) {
  const apiKey = request.headers.get("x-api-key");

  if (process.env.WEBHOOK_API_KEY && apiKey !== process.env.WEBHOOK_API_KEY) {
    return NextResponse.json(
      { error: { message: "Invalid API key" } },
      { status: 401 },
    );
  }

  try {
    const supabase = createAdminClient();
    const body = (await request.json()) as WebhookBody;
    const { orgId, lines, source } = body;

    if (!orgId || !lines || !Array.isArray(lines)) {
      return NextResponse.json(
        { error: { message: "orgId and lines array required" } },
        { status: 400 },
      );
    }

    const { data: invoices, error: invoicesError } = await supabase
      .from("invoices")
      .select("id, amount, ad_date, status")
      .eq("org_id", orgId)
      .in("status", ["pending", "overdue"]);

    if (invoicesError) {
      return NextResponse.json(
        { error: { message: invoicesError.message } },
        { status: 500 },
      );
    }

    const { data: expenses, error: expensesError } = await supabase
      .from("expenses")
      .select("id, amount, ad_date, status")
      .eq("org_id", orgId)
      .in("status", ["approved", "pending_approval"]);

    if (expensesError) {
      return NextResponse.json(
        { error: { message: expensesError.message } },
        { status: 500 },
      );
    }

    const processedLines: Array<Record<string, unknown>> = [];

    for (const line of lines) {
      const candidates = findMatchCandidates(
        {
          amount: line.amount,
          date: line.date,
          description: line.description,
        },
        invoices || [],
        expenses || [],
      );

      let state: "matched" | "needs_review" | "unmatched" = "unmatched";
      let matchedInvoiceId: string | null = null;
      let matchedExpenseId: string | null = null;
      let confidence: number | null = null;

      if (candidates.length > 0 && candidates[0].confidence >= 90) {
        state = "matched";
        confidence = candidates[0].confidence;

        if (candidates[0].type === "invoice") {
          matchedInvoiceId = candidates[0].id;
        } else {
          matchedExpenseId = candidates[0].id;
        }
      } else if (candidates.length > 0) {
        state = "needs_review";
        confidence = candidates[0].confidence;
      }

      const insertPayload = {
        org_id: orgId,
        date: line.date,
        description: line.description,
        amount: line.amount,
        matched_invoice_id: matchedInvoiceId,
        matched_expense_id: matchedExpenseId,
        confidence,
        state,
        source: source || null,
      };

      const { data: bankLine, error } = await supabase
        .from("bank_lines")
        .insert(insertPayload)
        .select()
        .single();

      if (!error && bankLine) {
        processedLines.push({
          ...bankLine,
          match_candidates: candidates.slice(0, 3),
        });
      }
    }

    return applySecurityHeaders(
      NextResponse.json({
        data: {
          processed: processedLines.length,
          matched: processedLines.filter((line) => line.state === "matched")
            .length,
          needs_review: processedLines.filter(
            (line) => line.state === "needs_review",
          ).length,
          unmatched: processedLines.filter((line) => line.state === "unmatched")
            .length,
          lines: processedLines,
        },
        error: null,
      }),
    );
  } catch (error) {
    console.error("Webhook error:", error);

    return NextResponse.json(
      { error: { message: "Failed to process bank statement" } },
      { status: 500 },
    );
  }
}

// Get webhook documentation
export async function GET() {
  return NextResponse.json({
    description: "Bank Statement Webhook",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": "Your API key (if configured)",
    },
    body: {
      orgId: "Organization UUID",
      source: "Bank name or identifier",
      lines: [
        {
          date: "YYYY-MM-DD",
          description: "Transaction description",
          amount: 1000.0,
          reference: "Optional reference number",
        },
      ],
    },
    response: {
      processed: "Number of lines processed",
      matched: "Auto-matched transactions",
      needs_review: "Transactions needing manual review",
      unmatched: "Unmatched transactions",
    },
  });
}
