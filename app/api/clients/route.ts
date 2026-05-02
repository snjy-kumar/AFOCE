// ============================================================
// Clients API with Full Features
// ============================================================

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { ClientRecord, PaginatedResponse } from "@/lib/types";
import {
  errorResponse,
  validationErrorResponse,
  logError,
} from "@/lib/utils/error-handler";
import { auditLog } from "@/lib/utils/audit";
import {
  createClientSchema,
  paginationSchema,
  searchQuerySchema,
} from "@/lib/utils/validation";

const DEMO_ORG = "demo-org";

/**
 * GET /api/clients - List clients with filtering and pagination
 *
 * @query page - Page number (default: 1)
 * @query pageSize - Items per page (default: 20, max: 100)
 * @query type - Filter by type: "client" or "vendor"
 * @query search - Search by name, PAN, or email
 * @query sortBy - Field to sort by (default: "created_at")
 * @query sortOrder - "asc" or "desc" (default: "desc")
 *
 * @returns Paginated list of clients
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Validate pagination
    const paginationResult = paginationSchema.safeParse({
      page: searchParams.get("page"),
      pageSize: searchParams.get("pageSize"),
    });
    if (!paginationResult.success) {
      return validationErrorResponse(paginationResult.error);
    }

    const { page, pageSize } = paginationResult.data;
    const type = searchParams.get("type");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "created_at";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const cookieStore = await cookies();
    const demoCookie = cookieStore.get("demo_user");

    // Demo mode
    if (demoCookie) {
      const mockClients: ClientRecord[] = [
        {
          id: "CL-0001",
          org_id: DEMO_ORG,
          name: "Sharma & Associates",
          pan: "123456789",
          email: "sharma@example.com",
          phone: "+977-1-1234567",
          type: "client",
          address: "Kathmandu, Nepal",
          notes: "Key account",
          created_by: "demo",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          total_invoices: 2,
          total_amount: 80000,
        },
        {
          id: "CL-0002",
          org_id: DEMO_ORG,
          name: "Nepal Trading Co.",
          pan: "987654321",
          email: "info@nepaltrading.com",
          phone: "+977-1-9876543",
          type: "client",
          address: "Lalitpur, Nepal",
          notes: null,
          created_by: "demo",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          total_invoices: 1,
          total_amount: 75000,
        },
        {
          id: "CL-0003",
          org_id: DEMO_ORG,
          name: "Kathmandu Suppliers",
          pan: "456789123",
          email: null,
          phone: null,
          type: "vendor",
          address: null,
          notes: null,
          created_by: "demo",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      let filtered = mockClients;
      if (type) filtered = filtered.filter((c) => c.type === type);
      if (search) {
        filtered = filtered.filter(
          (c) =>
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.pan.includes(search) ||
            (c.email?.toLowerCase().includes(search.toLowerCase()) ?? false)
        );
      }

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
    if (!user) return errorResponse(401, "Unauthorized");

    const { data: profile } = await supabase
      .from("profiles")
      .select("org_id")
      .eq("id", user.id)
      .single();
    if (!profile?.org_id) return errorResponse(403, "No workspace found");

    let query = supabase
      .from("clients")
      .select(
        "*, total_invoices:invoices(count), total_amount:invoices(amount.sum)",
        { count: "exact" }
      )
      .eq("org_id", profile.org_id);

    if (type) query = query.eq("type", type);
    if (search) {
      query = query.or(
        `name.ilike.%${search}%,pan.ilike.%${search}%,email.ilike.%${search}%`
      );
    }

    query = query.order(sortBy, { ascending: sortOrder === "asc" });
    query = query.range((page - 1) * pageSize, page * pageSize - 1);

    const { data, error, count } = await query;

    if (error) {
      logError(error, {
        method: "GET",
        path: "/api/clients",
        userId: user.id,
        orgId: profile.org_id,
      });
      return errorResponse(500, "Failed to fetch clients");
    }

    const rawData = data || [];
    const clientData: ClientRecord[] = rawData
      .filter((item) => !(item as unknown as Record<string, unknown>).error)
      .map((item) => {
        const r = item as unknown as Record<string, unknown>;
        const invArr = r.total_invoices as Array<{ count?: number }> | null;
        const amtArr = r.total_amount as Array<{ sum?: number }> | null;
        return {
          id: r.id as string,
          org_id: r.org_id as string,
          name: r.name as string,
          pan: r.pan as string,
          email: r.email as string | null,
          phone: r.phone as string | null,
          type: r.type as "client" | "vendor",
          address: r.address as string | null,
          notes: r.notes as string | null,
          created_by: r.created_by as string,
          created_at: r.created_at as string,
          updated_at: r.updated_at as string,
          total_invoices: invArr?.[0]?.count ?? 0,
          total_amount: amtArr?.[0]?.sum ?? 0,
        };
      });

    const response: PaginatedResponse<ClientRecord> = {
      data: clientData,
      pagination: { page, pageSize, total: count || 0 },
    };

    return NextResponse.json({ data: response, error: null });
  } catch (error) {
    logError(error, { method: "GET", path: "/api/clients" });
    return errorResponse(500, "Internal server error");
  }
}

/**
 * POST /api/clients - Create new client
 *
 * @body {CreateClientInput} Client details
 * @returns {ClientRecord} Created client
 */
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const demoCookie = cookieStore.get("demo_user");

    const body = await request.json();

    // Validate request
    const validation = createClientSchema.safeParse(body);
    if (!validation.success) {
      return validationErrorResponse(validation.error);
    }

    const { name, pan, email, phone, type = "client", address, notes } =
      validation.data;

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
    if (!user) return errorResponse(401, "Unauthorized");

    const { data: profile } = await supabase
      .from("profiles")
      .select("org_id")
      .eq("id", user.id)
      .single();
    if (!profile?.org_id) return errorResponse(403, "No workspace found");

    // Check for duplicate PAN
    const { data: existing } = await supabase
      .from("clients")
      .select("id")
      .eq("org_id", profile.org_id)
      .eq("pan", pan)
      .single();

    if (existing) {
      return errorResponse(409, "Client with this PAN already exists");
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
        address: address || null,
        notes: notes || null,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      logError(error, {
        method: "POST",
        path: "/api/clients",
        userId: user.id,
        orgId: profile.org_id,
      });
      return errorResponse(500, "Failed to create client");
    }

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
  } catch (error) {
    logError(error, { method: "POST", path: "/api/clients" });
    return errorResponse(500, "Internal server error");
  }
}
