import { NextResponse } from "next/server";
import type { VATSummary } from "@/lib/types";
import {
  createAuthClient,
  getCurrentOrgId,
  getCurrentUser,
  isDemoMode,
  forbiddenResponse,
  unauthorizedResponse,
} from "@/lib/supabase/server";
import {
  generateVATReport,
  calculateFilingDue,
  getMonthlyVATData,
} from "@/lib/utils/vat";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (await isDemoMode()) {
    const summary: VATSummary = {
      month: new Date().toISOString().split("T")[0],
      output_tax: 143650,
      input_tax: 41650,
      net_payable: 102000,
    };

    return NextResponse.json({ data: summary, error: null });
  }

  const supabase = await createAuthClient();
  const { user, error: userError } = await getCurrentUser(supabase);

  if (!user) {
    return unauthorizedResponse(userError || "Unauthorized");
  }

  const { orgId, error: orgError } = await getCurrentOrgId(supabase, user.id);

  if (!orgId) {
    return forbiddenResponse(orgError || "No workspace found");
  }

  // Determine period
  const now = new Date();
  const periodFrom = from || new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const periodTo = to || new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

  // Fetch invoices
  const { data: invoices, error: invoicesError } = await supabase
    .from("invoices")
    .select("id, amount, ad_date")
    .eq("org_id", orgId)
    .in("status", ["paid", "pending"])
    .gte("ad_date", periodFrom)
    .lte("ad_date", periodTo);

  if (invoicesError) {
    return NextResponse.json(
      { data: null, error: { message: invoicesError.message } },
      { status: 500 }
    );
  }

  // Fetch expenses
  const { data: expenses, error: expensesError } = await supabase
    .from("expenses")
    .select("id, amount, ad_date")
    .eq("org_id", orgId)
    .in("status", ["approved"])
    .gte("ad_date", periodFrom)
    .lte("ad_date", periodTo);

  if (expensesError) {
    return NextResponse.json(
      { data: null, error: { message: expensesError.message } },
      { status: 500 }
    );
  }

  // Generate VAT report
  const report = generateVATReport(
    invoices || [],
    expenses || [],
    { from: periodFrom, to: periodTo }
  );

  const summary: VATSummary = {
    month: new Date(periodFrom).toISOString().split("T")[0],
    output_tax: report.outputVAT,
    input_tax: report.inputVAT,
    net_payable: report.netVAT,
  };

  return NextResponse.json({ data: summary, error: null });
}
