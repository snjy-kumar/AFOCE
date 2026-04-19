import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { AuditEntry } from "@/lib/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "50");
  const entityType = searchParams.get("entityType");

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

    let query = supabase.from("audit_log").select("*, actor_email:profiles!actor_id(email)").eq("org_id", profile.org_id).order("created_at", { ascending: false }).range((page - 1) * pageSize, page * pageSize - 1);
    if (entityType) query = query.eq("entity_type", entityType);
    const { data, error } = await query;
    if (error) return NextResponse.json({ data: null, error: { message: error.message } }, { status: 500 });
    return NextResponse.json({ data: data || [], error: null });
  }

  const mockAudit: AuditEntry[] = [
    { id: 1, org_id: "demo-org", actor_id: "demo-1", action: "create", entity_type: "invoices", entity_id: "INV-0001", detail: { amount: 50000 }, created_at: new Date().toISOString() },
    { id: 2, org_id: "demo-org", actor_id: "demo-1", action: "create", entity_type: "expenses", entity_id: "EXP-0001", detail: { amount: 12500 }, created_at: new Date(Date.now() - 86400000).toISOString() },
    { id: 3, org_id: "demo-org", actor_id: "demo-2", action: "update", entity_type: "invoices", entity_id: "INV-0002", detail: { status: "paid" }, created_at: new Date(Date.now() - 172800000).toISOString() },
    { id: 4, org_id: "demo-org", actor_id: "demo-1", action: "create", entity_type: "clients", entity_id: "CL-0003", detail: { name: "New Client" }, created_at: new Date(Date.now() - 259200000).toISOString() },
  ];
  let filtered = mockAudit;
  if (entityType) filtered = filtered.filter(e => e.entity_type === entityType);
  return NextResponse.json({ data: filtered, error: null });
}
