import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { BankLineRecord, PaginatedResponse } from "@/lib/types";
import {
  errorResponse,
  validationErrorResponse,
  logError,
} from "@/lib/utils/error-handler";
import { paginationSchema } from "@/lib/utils/validation";

const DEMO_ORG = "demo-org";

/**
 * GET /api/bank-lines - List bank lines with filtering and pagination
 *
 * @query page - Page number (default: 1)
 * @query pageSize - Items per page (default: 20, max: 100)
 * @query state - Filter by state: "matched", "needs_review", or "unmatched"
 *
 * @returns Paginated list of bank lines
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
    const state = searchParams.get("state");

    const cookieStore = await cookies();
    const demoCookie = cookieStore.get("demo_user");

    if (!demoCookie) {
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
        .from("bank_lines")
        .select("*", { count: "exact" })
        .eq("org_id", profile.org_id)
        .order("date", { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);

      if (state) query = query.eq("state", state);

      const { data, error, count } = await query;
      if (error) {
        logError(error, {
          method: "GET",
          path: "/api/bank-lines",
          userId: user.id,
          orgId: profile.org_id,
        });
        return errorResponse(500, "Failed to fetch bank lines");
      }

      const response: PaginatedResponse<BankLineRecord> = {
        data: data || [],
        pagination: { page, pageSize, total: count || 0 },
      };
      return NextResponse.json({ data: response, error: null });
    }

    // In demo mode, return mock reconciliation data
    const mockLines: BankLineRecord[] = [
      {
        id: "BL-001",
        org_id: DEMO_ORG,
        date: "2024-04-14",
        description: "NMB Bank Transfer - Client Payment",
        amount: 50000,
        state: "needs_review",
        confidence: 85,
        match: "INV-0001",
        created_by: "demo",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        matched_invoice_id: null,
        matched_expense_id: null,
      },
      {
        id: "BL-002",
        org_id: DEMO_ORG,
        date: "2024-04-15",
        description: "Office Rent Deposit",
        amount: 120000,
        state: "matched",
        confidence: 95,
        match: "EXP-0003",
        created_by: "demo",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        matched_invoice_id: null,
        matched_expense_id: null,
      },
      {
        id: "BL-003",
        org_id: DEMO_ORG,
        date: "2024-04-16",
        description: "Utility Payment",
        amount: 8500,
        state: "needs_review",
        confidence: 60,
        match: null,
        created_by: "demo",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        matched_invoice_id: null,
        matched_expense_id: null,
      },
      {
        id: "BL-004",
        org_id: DEMO_ORG,
        date: "2024-04-17",
        description: "Supplier Payment - Nepal Trading",
        amount: 35000,
        state: "unmatched",
        confidence: 0,
        match: null,
        created_by: "demo",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        matched_invoice_id: null,
        matched_expense_id: null,
      },
    ];

    let filtered = mockLines;
    if (state) filtered = filtered.filter((l: BankLineRecord) => l.state === state);

    const response: PaginatedResponse<BankLineRecord> = {
      data: filtered,
      pagination: { page, pageSize, total: filtered.length },
    };
    return NextResponse.json({ data: response, error: null });
  } catch (error) {
    logError(error, { method: "GET", path: "/api/bank-lines" });
    return errorResponse(500, "Internal server error");
  }
}

/**
 * POST /api/bank-lines - Create new bank lines from statement import
 *
 * @body lines - Array of bank line records
 * @returns {BankLineRecord[]} Created bank lines
 */
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const demoCookie = cookieStore.get("demo_user");

    const body = await request.json();
    const { lines } = body;

    if (!lines || !Array.isArray(lines)) {
      return errorResponse(400, "lines array is required");
    }

    if (demoCookie) {
      const mockLines = lines.map(
        (
          line: { date: string; description?: string; amount: number },
          i: number
        ) => ({
          id: `BL-DEMO-${Date.now()}-${i}`,
          org_id: DEMO_ORG,
          date: line.date,
          description: line.description || null,
          amount: line.amount,
          state: "needs_review" as const,
          confidence: null,
          match: null,
          created_by: "demo",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          matched_invoice_id: null,
          matched_expense_id: null,
        })
      );
      return NextResponse.json({ data: mockLines, error: null }, { status: 201 });
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

    const records = lines.map(
      (line: { date: string; description?: string; amount: number }) => ({
        org_id: profile.org_id,
        id: `BL-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        date: line.date,
        description: line.description || null,
        amount: line.amount,
        state: "needs_review" as const,
        created_by: user.id,
      })
    );

    const { data, error } = await supabase
      .from("bank_lines")
      .insert(records)
      .select();
    if (error) {
      logError(error, {
        method: "POST",
        path: "/api/bank-lines",
        userId: user.id,
        orgId: profile.org_id,
      });
      return errorResponse(500, "Failed to create bank lines");
    }

    return NextResponse.json({ data, error: null }, { status: 201 });
  } catch (error) {
    logError(error, { method: "POST", path: "/api/bank-lines" });
    return errorResponse(500, "Internal server error");
  }
}
