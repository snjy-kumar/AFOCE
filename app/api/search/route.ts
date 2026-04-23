import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface SearchResult {
  id: string;
  type: "invoice" | "expense" | "client" | "policy";
  label: string;
  sublabel: string;
  path: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("search") || "";

  if (!query.trim() || query.trim().length < 2) {
    return NextResponse.json({ data: { results: [] }, error: null });
  }

  const cookieStore = await cookies();
  const demoCookie = cookieStore.get("demo_user");
  const results: SearchResult[] = [];
  const q = query.toLowerCase();

  if (demoCookie) {
    const allInvoices: SearchResult[] = [
      { id: "INV-0001", type: "invoice", label: "INV-0001", sublabel: "Sharma & Associates — ₹50,000", path: "/dashboard/invoices" },
      { id: "INV-0002", type: "invoice", label: "INV-0002", sublabel: "Nepal Trading Co. — ₹75,000", path: "/dashboard/invoices" },
      { id: "INV-0003", type: "invoice", label: "INV-0003", sublabel: "Sharma & Associates — ₹30,000", path: "/dashboard/invoices" },
    ];
    const allExpenses: SearchResult[] = [
      { id: "EXP-001", type: "expense", label: "Office Supplies", sublabel: "NPR 15,000 — Approved", path: "/dashboard/expenses" },
      { id: "EXP-002", type: "expense", label: "Travel - Client Visit", sublabel: "NPR 25,000 — Pending", path: "/dashboard/expenses" },
    ];
    const allClients: SearchResult[] = [
      { id: "CL-0001", type: "client", label: "Sharma & Associates", sublabel: "PAN: 123456789", path: "/dashboard/clients" },
      { id: "CL-0002", type: "client", label: "Nepal Trading Co.", sublabel: "PAN: 987654321", path: "/dashboard/clients" },
    ];
    const allPolicies: SearchResult[] = [
      { id: "POL-001", type: "policy", label: "Travel Policy FY81", sublabel: "Active", path: "/dashboard/policies" },
      { id: "POL-002", type: "policy", label: "Expense Approval Limit", sublabel: "NPR 50,000", path: "/dashboard/policies" },
    ];

    const matched = [...allInvoices, ...allExpenses, ...allClients, ...allPolicies].filter(
      (item) => item.label.toLowerCase().includes(q) || item.sublabel.toLowerCase().includes(q)
    );

    results.push(...matched);
    return NextResponse.json({ data: { results }, error: null });
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ data: { results: [] }, error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("org_id")
    .eq("id", user.id)
    .single();

  const orgId = profile?.org_id;
  if (!orgId) {
    return NextResponse.json({ data: { results: [] }, error: null });
  }

  const searchTerm = `%${query.trim()}%`;

  const { data: invoices } = await supabase
    .from("invoices")
    .select("id, client_id, amount")
    .eq("org_id", orgId)
    .or(`id.ilike.${searchTerm},client_id.ilike.${searchTerm}`)
    .limit(3);

  if (invoices) {
    const clientIds = invoices.map((i) => i.client_id).filter(Boolean);
    const { data: clients } = await supabase
      .from("clients")
      .select("id, name")
      .in("id", clientIds.length > 0 ? clientIds : [""])
      .limit(3);

    for (const invoice of invoices) {
      const client = clients?.find((c) => c.id === invoice.client_id);
      results.push({
        id: invoice.id,
        type: "invoice",
        label: invoice.id,
        sublabel: client
          ? `${client.name} — NPR ${invoice.amount.toLocaleString()}`
          : `NPR ${invoice.amount.toLocaleString()}`,
        path: "/dashboard/invoices",
      });
    }
  }

  const { data: expenses } = await supabase
    .from("expenses")
    .select("id, description, amount, status")
    .eq("org_id", orgId)
    .or(`id.ilike.${searchTerm},description.ilike.${searchTerm}`)
    .limit(3);

  if (expenses) {
    for (const expense of expenses) {
      results.push({
        id: expense.id,
        type: "expense",
        label: expense.description,
        sublabel: `NPR ${expense.amount.toLocaleString()} — ${expense.status}`,
        path: "/dashboard/expenses",
      });
    }
  }

  const { data: clients } = await supabase
    .from("clients")
    .select("id, name, pan")
    .eq("org_id", orgId)
    .or(`name.ilike.${searchTerm},pan.ilike.${searchTerm}`)
    .limit(3);

  if (clients) {
    for (const client of clients) {
      results.push({
        id: client.id,
        type: "client",
        label: client.name,
        sublabel: client.pan ? `PAN: ${client.pan}` : "No PAN",
        path: "/dashboard/clients",
      });
    }
  }

  const { data: policies } = await supabase
    .from("policies")
    .select("id, name, status")
    .eq("org_id", orgId)
    .or(`name.ilike.${searchTerm}`)
    .limit(3);

  if (policies) {
    for (const policy of policies) {
      results.push({
        id: policy.id,
        type: "policy",
        label: policy.name,
        sublabel: policy.status || "Active",
        path: "/dashboard/policies",
      });
    }
  }

  return NextResponse.json({ data: { results }, error: null });
}