// ============================================================
// Expenses API with Full Features
// ============================================================

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { ExpenseRecord, PaginatedResponse, ExpenseStatus } from "@/lib/types";
import {
  errorResponse,
  validationErrorResponse,
  logError,
} from "@/lib/utils/error-handler";
import { auditLog } from "@/lib/utils/audit";
import { sendNotification } from "@/lib/utils/notifications";
import {
  determineApprovalStep,
  shouldAutoApprove,
} from "@/lib/utils/workflow";
import {
  createExpenseSchema,
  paginationSchema,
} from "@/lib/utils/validation";

const DEMO_ORG = "demo-org";

/**
 * GET /api/expenses - List expenses with filtering and pagination
 *
 * @query page - Page number (default: 1)
 * @query pageSize - Items per page (default: 20, max: 100)
 * @query status - Filter by status
 * @query category - Filter by category
 * @query employee - Filter by employee name
 * @query minAmount - Minimum amount
 * @query maxAmount - Maximum amount
 * @query from - Start date (YYYY-MM-DD)
 * @query to - End date (YYYY-MM-DD)
 * @query sortBy - Field to sort by (default: "created_at")
 * @query sortOrder - "asc" or "desc" (default: "desc")
 *
 * @returns Paginated list of expenses
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
    const category = searchParams.get("category");
    const employee = searchParams.get("employee");
    const minAmount = searchParams.get("minAmount");
    const maxAmount = searchParams.get("maxAmount");
    const fromDate = searchParams.get("from");
    const toDate = searchParams.get("to");
    const sortBy = searchParams.get("sortBy") || "created_at";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const cookieStore = await cookies();
    const demoCookie = cookieStore.get("demo_user");

    if (demoCookie) {
      const mockExpenses: ExpenseRecord[] = [
        {
          id: "EXP-0001",
          org_id: DEMO_ORG,
          employee: "John Doe",
          category: "Travel",
          amount: 5000,
          bs_date: "Baisakh 2081",
          ad_date: "2024-04-14",
          status: "approved",
          policy_id: null,
          receipt_url: null,
          created_by: "demo",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "EXP-0002",
          org_id: DEMO_ORG,
          employee: "Jane Smith",
          category: "Office Supplies",
          amount: 2500,
          bs_date: "Jestha 2081",
          ad_date: "2024-05-15",
          status: "pending_approval",
          policy_id: null,
          receipt_url: null,
          created_by: "demo",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "EXP-0003",
          org_id: DEMO_ORG,
          employee: "Bob Wilson",
          category: "Meals",
          amount: 3500,
          bs_date: "Ashadh 2081",
          ad_date: "2024-06-16",
          status: "manager_review",
          policy_id: null,
          receipt_url: null,
          created_by: "demo",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      let filtered = mockExpenses;
      if (status) filtered = filtered.filter((e) => e.status === status);
      if (category) filtered = filtered.filter((e) => e.category === category);
      if (employee)
        filtered = filtered.filter((e) =>
          e.employee.toLowerCase().includes(employee.toLowerCase())
        );
      if (minAmount)
        filtered = filtered.filter((e) => e.amount >= Number(minAmount));
      if (maxAmount)
        filtered = filtered.filter((e) => e.amount <= Number(maxAmount));

      const response: PaginatedResponse<ExpenseRecord> = {
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
      .from("expenses")
      .select("*, policy:policies!policy_id(name)", { count: "exact" })
      .eq("org_id", profile.org_id);

    if (status) query = query.eq("status", status);
    if (category) query = query.eq("category", category);
    if (employee) query = query.ilike("employee", `%${employee}%`);
    if (minAmount) query = query.gte("amount", minAmount);
    if (maxAmount) query = query.lte("amount", maxAmount);
    if (fromDate) query = query.gte("ad_date", fromDate);
    if (toDate) query = query.lte("ad_date", toDate);

    query = query.order(sortBy, { ascending: sortOrder === "asc" });
    query = query.range((page - 1) * pageSize, page * pageSize - 1);

    const { data, error, count } = await query;

    if (error) {
      logError(error, {
        method: "GET",
        path: "/api/expenses",
        userId: user.id,
        orgId: profile.org_id,
      });
      return errorResponse(500, "Failed to fetch expenses");
    }

    const response: PaginatedResponse<ExpenseRecord> = {
      data: data || [],
      pagination: { page, pageSize, total: count || 0 },
    };

    return NextResponse.json({ data: response, error: null });
  } catch (error) {
    logError(error, { method: "GET", path: "/api/expenses" });
    return errorResponse(500, "Internal server error");
  }
}

/**
 * POST /api/expenses - Create new expense
 *
 * @body {CreateExpenseInput} Expense details
 * @returns {ExpenseRecord} Created expense
 */
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const demoCookie = cookieStore.get("demo_user");

    const body = await request.json();

    // Validate request
    const validation = createExpenseSchema.safeParse(body);
    if (!validation.success) {
      return validationErrorResponse(validation.error);
    }

    const {
      employee,
      category,
      amount,
      bs_date,
      ad_date,
      receipt_url,
      description,
    } = validation.data;

    // Determine initial status based on amount and policies
    let initialStatus: ExpenseStatus = "pending_approval";
    if (shouldAutoApprove(amount)) {
      initialStatus = "approved";
    }

    if (demoCookie) {
      const mock: ExpenseRecord = {
        id: `EXP-${Date.now()}`,
        org_id: DEMO_ORG,
        employee,
        category,
        amount,
        bs_date,
        ad_date,
        status: initialStatus,
        policy_id: null,
        receipt_url: receipt_url || null,
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

    // Find matching policy
    const { data: policies } = await supabase
      .from("policies")
      .select("id")
      .eq("org_id", profile.org_id)
      .eq("category", "expenses")
      .eq("status", "active")
      .limit(1);

    const { data, error } = await supabase
      .from("expenses")
      .insert({
        org_id: profile.org_id,
        employee,
        category,
        amount,
        bs_date,
        ad_date,
        status: initialStatus,
        policy_id: policies?.[0]?.id || null,
        receipt_url: receipt_url || null,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      logError(error, {
        method: "POST",
        path: "/api/expenses",
        userId: user.id,
        orgId: profile.org_id,
      });
      return errorResponse(500, "Failed to create expense");
    }

    // Audit log
    await auditLog({
      supabase,
      actorId: user.id,
      orgId: profile.org_id,
      action: "create",
      entityType: "expenses",
      entityId: data.id,
      detail: { employee, category, amount, status: initialStatus },
    });

    // Send notification if needs approval
    if (initialStatus === "pending_approval") {
      const { data: managers } = await supabase
        .from("profiles")
        .select("id")
        .eq("org_id", profile.org_id)
        .in("role", ["manager", "finance_admin"]);

      if (managers) {
        for (const manager of managers) {
          await sendNotification({
            supabase,
            payload: {
              type: "expense_submitted",
              userId: manager.id,
              orgId: profile.org_id,
              data: {
                expenseId: data.id,
                employee,
                amount,
                category,
              },
            },
          });
        }
      }
    }

    return NextResponse.json({ data, error: null }, { status: 201 });
  } catch (error) {
    logError(error, { method: "POST", path: "/api/expenses" });
    return errorResponse(500, "Internal server error");
  }
}
