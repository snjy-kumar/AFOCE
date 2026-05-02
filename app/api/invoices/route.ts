// ============================================================
// Invoices API with Full Features
// ============================================================

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { InvoiceRecord, PaginatedResponse } from "@/lib/types";
import {
  errorResponse,
  validationErrorResponse,
  logError,
} from "@/lib/utils/error-handler";
import { calculateVAT } from "@/lib/utils/vat";
import { auditLog } from "@/lib/utils/audit";
import { sendNotification } from "@/lib/utils/notifications";
import {
  createInvoiceSchema,
  paginationSchema,
} from "@/lib/utils/validation";

const DEMO_ORG = "demo-org";

/**
 * GET /api/invoices - List invoices with filtering and pagination
 *
 * @query page - Page number (default: 1)
 * @query pageSize - Items per page (default: 20, max: 100)
 * @query status - Filter by status
 * @query clientId - Filter by client ID
 * @query from - Start date (YYYY-MM-DD)
 * @query to - End date (YYYY-MM-DD)
 * @query minAmount - Minimum amount
 * @query maxAmount - Maximum amount
 * @query search - Search by invoice ID or client name
 * @query sortBy - Field to sort by (default: "created_at")
 * @query sortOrder - "asc" or "desc" (default: "desc")
 *
 * @returns Paginated list of invoices
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
    const status = searchParams.get("status");
    const clientId = searchParams.get("clientId");
    const fromDate = searchParams.get("from");
    const toDate = searchParams.get("to");
    const minAmount = searchParams.get("minAmount");
    const maxAmount = searchParams.get("maxAmount");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "created_at";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const cookieStore = await cookies();
    const demoCookie = cookieStore.get("demo_user");

    // Demo mode
    if (demoCookie) {
      const mockInvoices: (InvoiceRecord & {
        client_name?: string;
        client_pan?: string;
      })[] = [
        {
          id: "INV-0001",
          org_id: DEMO_ORG,
          client_id: "CL-0001",
          bs_date: "Baisakh 2081",
          ad_date: "2024-04-14",
          due_days: 30,
          amount: 50000,
          vat: 6500,
          status: "paid",
          created_by: "demo",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          client_name: "Sharma & Associates",
          client_pan: "123456789",
        },
        {
          id: "INV-0002",
          org_id: DEMO_ORG,
          client_id: "CL-0002",
          bs_date: "Jestha 2081",
          ad_date: "2024-05-15",
          due_days: 30,
          amount: 75000,
          vat: 9750,
          status: "pending",
          created_by: "demo",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          client_name: "Nepal Trading Co.",
          client_pan: "987654321",
        },
        {
          id: "INV-0003",
          org_id: DEMO_ORG,
          client_id: "CL-0001",
          bs_date: "Ashadh 2081",
          ad_date: "2024-06-16",
          due_days: 30,
          amount: 30000,
          vat: 3900,
          status: "overdue",
          created_by: "demo",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          client_name: "Sharma & Associates",
          client_pan: "123456789",
        },
      ];

      let filtered = mockInvoices;
      if (status) filtered = filtered.filter((i) => i.status === status);
      if (clientId) filtered = filtered.filter((i) => i.client_id === clientId);
      if (minAmount)
        filtered = filtered.filter((i) => i.amount >= Number(minAmount));
      if (maxAmount)
        filtered = filtered.filter((i) => i.amount <= Number(maxAmount));
      if (search)
        filtered = filtered.filter(
          (i) =>
            i.client_name?.toLowerCase().includes(search.toLowerCase()) ||
            i.id.toLowerCase().includes(search.toLowerCase())
        );

      const response: PaginatedResponse<
        InvoiceRecord & { client_name?: string; client_pan?: string }
      > = {
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

    // Build query with all filters
    let query = supabase
      .from("invoices")
      .select("*, client:clients!client_id(name, pan)", { count: "exact" })
      .eq("org_id", profile.org_id);

    if (status) query = query.eq("status", status);
    if (clientId) query = query.eq("client_id", clientId);
    if (fromDate) query = query.gte("ad_date", fromDate);
    if (toDate) query = query.lte("ad_date", toDate);
    if (minAmount) query = query.gte("amount", minAmount);
    if (maxAmount) query = query.lte("amount", maxAmount);
    if (search) {
      query = query.or(
        `id.ilike.%${search}%,client:clients!client_id(name.ilike.%${search}%)`
      );
    }

    // Sorting
    query = query.order(sortBy, { ascending: sortOrder === "asc" });

    // Pagination
    query = query.range((page - 1) * pageSize, page * pageSize - 1);

    const { data, error, count } = await query;

    if (error) {
      logError(error, {
        method: "GET",
        path: "/api/invoices",
        userId: user.id,
        orgId: profile.org_id,
      });
      return errorResponse(500, "Failed to fetch invoices");
    }

    const response: PaginatedResponse<
      InvoiceRecord & { client?: { name?: string; pan?: string } }
    > = {
      data: data || [],
      pagination: { page, pageSize, total: count || 0 },
    };

    return NextResponse.json({ data: response, error: null });
  } catch (error) {
    logError(error, { method: "GET", path: "/api/invoices" });
    return errorResponse(500, "Internal server error");
  }
}

/**
 * POST /api/invoices - Create new invoice
 *
 * @body {CreateInvoiceInput} Invoice details
 * @returns {InvoiceRecord} Created invoice
 */
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const demoCookie = cookieStore.get("demo_user");

    const body = await request.json();

    // Validate request
    const validation = createInvoiceSchema.safeParse(body);
    if (!validation.success) {
      return validationErrorResponse(validation.error);
    }

    const {
      client_id,
      bs_date,
      ad_date,
      due_days = 30,
      amount,
      status = "draft",
      items,
      notes,
    } = validation.data;

    const vat = calculateVAT(amount);

    if (demoCookie) {
      const mock: InvoiceRecord & {
        client_name?: string;
        client_pan?: string;
      } = {
        id: `INV-${Date.now()}`,
        org_id: DEMO_ORG,
        client_id,
        bs_date,
        ad_date,
        due_days,
        amount,
        vat,
        status,
        created_by: "demo",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        client_name: "Demo Client",
        client_pan: "000000000",
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

    // Get client details for notification
    const { data: client } = await supabase
      .from("clients")
      .select("name, email")
      .eq("id", client_id)
      .single();

    const { data, error } = await supabase
      .from("invoices")
      .insert({
        org_id: profile.org_id,
        client_id,
        bs_date,
        ad_date,
        due_days,
        amount,
        vat,
        status,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      logError(error, {
        method: "POST",
        path: "/api/invoices",
        userId: user.id,
        orgId: profile.org_id,
      });
      return errorResponse(500, "Failed to create invoice");
    }

    // Audit log
    await auditLog({
      supabase,
      actorId: user.id,
      orgId: profile.org_id,
      action: "create",
      entityType: "invoices",
      entityId: data.id,
      detail: { client_id, amount, status, items, notes },
    });

    // Send notification if status is pending
    if (status === "pending") {
      await sendNotification({
        supabase,
        payload: {
          type: "invoice_created",
          email: client?.email,
          orgId: profile.org_id,
          data: {
            invoiceNumber: data.id,
            amount: amount + vat,
            clientName: client?.name,
            viewUrl: `${process.env.NEXT_PUBLIC_APP_URL}/invoices/${data.id}`,
          },
        },
      });
    }

    return NextResponse.json({ data, error: null }, { status: 201 });
  } catch (error) {
    logError(error, { method: "POST", path: "/api/invoices" });
    return errorResponse(500, "Internal server error");
  }
}
