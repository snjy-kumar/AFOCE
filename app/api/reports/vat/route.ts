import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { VATSummary } from "@/lib/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") || "this_month";

  const cookieStore = await cookies();
  const demoCookie = cookieStore.get("demo_user");

  if (!demoCookie) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ data: null, error: { message: "Unauthorized" } }, { status: 401 });
    const { data: profile } = await supabase.from("profiles").select("org_id").eq("id", user.id).single();
    if (!profile?.org_id) return NextResponse.json({ data: null, error: { message: "No workspace found" } }, { status: 403 });

    const { data: invoices } = await supabase.from("invoices").select("vat").eq("org_id", profile.org_id).in("status", ["paid", "pending"]);
    const { data: expenses } = await supabase.from("expenses").select("vat").eq("org_id", profile.org_id).in("status", ["approved"]);
    const outputTax = invoices?.reduce((sum, inv) => sum + (parseFloat(String(inv.vat)) || 0), 0) || 0;
    const inputTax = expenses?.reduce((sum, exp) => sum + (parseFloat(String(exp.vat)) || 0), 0) || 0;
    const summary: VATSummary = { month: period, output_tax: outputTax, input_tax: inputTax, net_payable: outputTax - inputTax };
    return NextResponse.json({ data: summary, error: null });
  }

  const summary: VATSummary = {
    month: period,
    output_tax: 143650,
    input_tax: 41650,
    net_payable: 102000,
  };
  return NextResponse.json({ data: summary, error: null });
}
