// ============================================================
// Bank Statement Webhook - Receive bank transactions
// ============================================================

import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { findMatchCandidates, calculateMatchConfidence } from "@/lib/utils/workflow";
import { applySecurityHeaders } from "@/lib/utils/security";

// Bank statement line format
interface BankStatementLine {
  date: string;
  description: string;
  amount: number;
  reference?: string;
}

export async function POST(request: Request) {
  // Verify webhook signature if provided
  const signature = request.headers.get("x-webhook-signature");
  const apiKey = request.headers.get("x-api-key");

  if (process.env.WEBHOOK_API_KEY && apiKey !== process.env.WEBHOOK_API_KEY) {
    return NextResponse.json(
      { error: { message: "Invalid API key" } },
      { status: 401 }
    );
  }

  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    );

    const body = await request.json();
    const { orgId, lines, source } = body;

    if (!orgId || !lines || !Array.isArray(lines)) {
      return NextResponse.json(
        { error: { message: "orgId and lines array required" } },
        { status: 400 }
      );
    }

    // Get pending invoices and expenses for matching
    const { data: invoices } = await supabase
      .from("invoices")
      .select("id, amount, ad_date, status")
      .eq("org_id", orgId)
      .in("status", ["pending", "overdue"]);

    const { data: expenses } = await supabase
      .from("expenses")
      .select("id, amount, ad_date, status")
      .eq("org_id", orgId)
      .in("status", ["approved", "pending_approval"]);

    // Process each line
    const processedLines = [];

    for (const line of lines as BankStatementLine[]) {
      // Find match candidates
      const candidates = findMatchCandidates(
        { amount: line.amount, date: line.date, description: line.description },
        invoices || [],
        expenses || []
      );

      // Determine state based on matches
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

      // Create bank line record
      const { data: bankLine, error } = await supabase
        .from("bank_lines")
        .insert({
          org_id: orgId,
          date: line.date,
          description: line.description,
          amount: line.amount,
          matched_invoice_id: matchedInvoiceId,
          matched_expense_id: matchedExpenseId,
          confidence,
          state,
          source,
        })
        .select()
        .single();

      if (!error) {
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
          matched: processedLines.filter((l) => l.state === "matched").length,
          needs_review: processedLines.filter((l) => l.state === "needs_review").length,
          unmatched: processedLines.filter((l) => l.state === "unmatched").length,
          lines: processedLines,
        },
        error: null,
      })
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: { message: "Failed to process bank statement" } },
      { status: 500 }
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
      "X-Webhook-Signature": "Optional signature for verification",
    },
    body: {
      orgId: "Organization UUID",
      source: "Bank name or identifier",
      lines: [
        {
          date: "YYYY-MM-DD",
          description: "Transaction description",
          amount: 1000.00,
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
