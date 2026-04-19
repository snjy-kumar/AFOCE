// ============================================================
// Clients API with Full Features
// ============================================================

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { ClientRecord, PaginatedResponse } from "@/lib/types";
import { auditLog } from "@/lib/utils/audit";
import { createClientSchema, updateClientSchema } from "@/lib/utils/validation";

const DEMO_ORG = "demo-org";

// GET /api/clients - List clients with filtering
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "20");
  const type = searchParams.get("type");
  const search = searchParams.get("search");
  const sortBy = searchParams.get("sortBy") || "created_at";
  const sortOrder = searchParams.get("sortOrder") || "desc";

  const cookieStore = await cookies();
  const demoCookie = cookieStore.get("demo_user");

  if (demoCookie) {
    const mockClients: ClientRecord[] = [
      { id: "CL-0001", org_id: DEMO_ORG, name: "Sharma & Associates", pan: "123456789", email: "sharma@example.com", phone: "+977-1-1234567", type: "client", address: "Kathmandu, Nepal", notes: "Key account", created_by: "demo", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), total_invoices: 2, total_amount: 80000 },
      { id: "CL-0002", org_id: DEMO_ORG, name: "Nepal Trading Co.", pan: "987654321", email: "info@nepaltrading.com", phone: "+977-1-9876543", type: "client", address: "Lalitpur, Nepal", notes: null, created_by: "demo", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), total_invoices: 1, total_amount: 75000 },
      { id: "CL-0003", org_id: DEMO_ORG, name: "Kathmandu Suppliers", pan: "456789123", email: null, phone: null, type: "vendor", address: null, notes: null, created_by: "demo", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    ];

    let filtered = mockClients;
    if (type) filtered = filtered.filter(c => c.type === type);
    if (search) filtered = filtered.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.pan.includes(search) ||
      (c.email?.toLowerCase().includes(search.toLowerCase()) ?? false)
    );

    const response: PaginatedResponse<ClientRecord> = {
      data: filtered,
      pagination: { page, pageSize, total: filtered.length },
    };

    return NextResponse.json({ data: response, error: null });
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ data: null, error: { message: "Unauthorized" } }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("org_id").eq("id", user.id).single();
  if (!profile?.org_id) return NextResponse.json({ data: null, error: { message: "No workspace found" } }, { status: 403 });

  let query = supabase
    .from("clients")
    .select("*, total_invoices:invoices(count), total_amount:invoices(amount.sum)", { count: "exact" })
    .eq("org_id", profile.org_id);

  if (type) query = query.eq("type", type);
  if (search) {
    query = query.or(`name.ilike.%${search}%,pan.ilike.%${search}%,email.ilike.%${search}%`);
  }

  query = query.order(sortBy, { ascending: sortOrder === "asc" });
  query = query.range((page - 1) * pageSize, page * pageSize - 1);

const { data, error, count } = await query;

  if (error) return NextResponse.json({ data: null, error: { message: error.message } }, { status: 500 });

  const rawData = data || [];
  const clientData: ClientRecord[] = [];

  for (const item of rawData) {
    const itemUnknown = item as unknown as Record<string, unknown>;
    if (itemUnknown.error) continue;
    clientData.push({
      id: itemUnknown.id as string,
      org_id: itemUnknown.org_id as string,
      name: itemUnknown.name as string,
      pan: itemUnknown.pan as string,
      email: itemUnknown.email as string | null,
      phone: itemUnknown.phone as string | null,
      type: itemUnknown.type as "client" | "vendor",
      address: itemUnknown.address as string | null,
      notes: itemUnknown.notes as string | null,
      created_by: itemUnknown.created_by as string,
      created_at: itemUnknown.created_at as string,
      updated_at: itemUnknown.updated_at as string,
    });
  }

  const response: PaginatedResponse<ClientRecord> = {
    data: clientData,
    pagination: { page, pageSize, total: count || 0 },
  };

  return NextResponse.json({ data: response, error: null });
}

// POST /api/clients - Create new client
export async function POST(request: Request) {
  const cookieStore = await cookies();
  const demoCookie = cookieStore.get("demo_user");

  const body = await request.json();

  // Validate request
  const validation = createClientSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { data: null, error: { message: "Validation failed", errors: validation.error.issues } },
      { status: 400 }
    );
  }

  const { name, pan, email, phone, type = "client", address, notes } = validation.data;

  if (demoCookie) {
    const mock: ClientRecord = {
      id: `CL-${Date.now()}`,
      org_id: DEMO_ORG,
      name,
      pan,
      email: email || null,
      phone: phone || null,
      type,
      address: address || null,
      notes: notes || null,
      created_by: "demo",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return NextResponse.json({ data: mock, error: null }, { status: 201 });
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ data: null, error: { message: "Unauthorized" } }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("org_id").eq("id", user.id).single();
  if (!profile?.org_id) return NextResponse.json({ data: null, error: { message: "No workspace found" } }, { status: 403 });

  // Check for duplicate PAN
  const { data: existing } = await supabase
    .from("clients")
    .select("id")
    .eq("org_id", profile.org_id)
    .eq("pan", pan)
    .single();

  if (existing) {
    return NextResponse.json(
      { data: null, error: { message: "Client with this PAN already exists" } },
      { status: 409 }
    );
  }

  const { data, error } = await supabase
    .from("clients")
    .insert({
      org_id: profile.org_id,
      name,
      pan,
      email: email || null,
      phone: phone || null,
      type,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ data: null, error: { message: error.message } }, { status: 500 });

  // Audit log
  await auditLog({
    supabase,
    actorId: user.id,
    orgId: profile.org_id,
    action: "create",
    entityType: "clients",
    entityId: data.id,
    detail: { name, pan, type },
  });

  return NextResponse.json({ data, error: null }, { status: 201 });
}
