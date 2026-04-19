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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") || "this_month";

  if (await isDemoMode()) {
    const summary: VATSummary = {
      month: period,
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

  const { data: invoices, error: invoicesError } = await supabase
    .from("invoices")
    .select("vat")
    .eq("org_id", orgId)
    .in("status", ["paid", "pending"]);

  if (invoicesError) {
    return NextResponse.json(
      { data: null, error: { message: invoicesError.message } },
      { status: 500 },
    );
  }

  const { data: expenses, error: expensesError } = await supabase
    .from("expenses")
    .select("vat")
    .eq("org_id", orgId)
    .in("status", ["approved"]);

  if (expensesError) {
    return NextResponse.json(
      { data: null, error: { message: expensesError.message } },
      { status: 500 },
    );
  }

  const outputTax =
    invoices?.reduce(
      (sum, invoice) => sum + (parseFloat(String(invoice.vat)) || 0),
      0,
    ) || 0;

  const inputTax =
    expenses?.reduce(
      (sum, expense) => sum + (parseFloat(String(expense.vat)) || 0),
      0,
    ) || 0;

  const summary: VATSummary = {
    month: period,
    output_tax: outputTax,
    input_tax: inputTax,
    net_payable: outputTax - inputTax,
  };

  return NextResponse.json({ data: summary, error: null });
}
