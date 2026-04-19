// ============================================================
// Expenses API with Full Features
// ============================================================

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { ExpenseRecord, PaginatedResponse, ExpenseStatus } from "@/lib/types";
import { auditLog } from "@/lib/utils/audit";
import { sendNotification } from "@/lib/utils/notifications";
import { determineApprovalStep, shouldAutoApprove } from "@/lib/utils/workflow";
import { createExpenseSchema, updateExpenseSchema } from "@/lib/utils/validation";

const DEMO_ORG = "demo-org";

// GET /api/expenses - List expenses with filtering
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "20");
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
      { id: "EXP-0001", org_id: DEMO_ORG, employee: "John Doe", category: "Travel", amount: 5000, bs_date: "Baisakh 2081", ad_date: "2024-04-14", status: "approved", policy_id: null, receipt_url: null, created_by: "demo", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: "EXP-0002", org_id: DEMO_ORG, employee: "Jane Smith", category: "Office Supplies", amount: 2500, bs_date: "Jestha 2081", ad_date: "2024-05-15", status: "pending_approval", policy_id: null, receipt_url: null, created_by: "demo", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: "EXP-0003", org_id: DEMO_ORG, employee: "Bob Wilson", category: "Meals", amount: 3500, bs_date: "Ashadh 2081", ad_date: "2024-06-16", status: "manager_review", policy_id: null, receipt_url: null, created_by: "demo", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    ];

    let filtered = mockExpenses;
    if (status) filtered = filtered.filter(e => e.status === status);
    if (category) filtered = filtered.filter(e => e.category === category);
    if (employee) filtered = filtered.filter(e => e.employee.toLowerCase().includes(employee.toLowerCase()));
    if (minAmount) filtered = filtered.filter(e => e.amount >= Number(minAmount));
    if (maxAmount) filtered = filtered.filter(e => e.amount <= Number(maxAmount));

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
  if (!user) return NextResponse.json({ data: null, error: { message: "Unauthorized" } }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("org_id").eq("id", user.id).single();
  if (!profile?.org_id) return NextResponse.json({ data: null, error: { message: "No workspace found" } }, { status: 403 });

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

  if (error) return NextResponse.json({ data: null, error: { message: error.message } }, { status: 500 });

  const response: PaginatedResponse<ExpenseRecord> = {
    data: data || [],
    pagination: { page, pageSize, total: count || 0 },
  };

  return NextResponse.json({ data: response, error: null });
}

// POST /api/expenses - Create new expense
export async function POST(request: Request) {
  const cookieStore = await cookies();
  const demoCookie = cookieStore.get("demo_user");

  const body = await request.json();

  // Validate request
  const validation = createExpenseSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { data: null, error: { message: "Validation failed", errors: validation.error.issues } },
      { status: 400 }
    );
  }

  const { employee, category, amount, bs_date, ad_date, receipt_url, description } = validation.data;

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
  if (!user) return NextResponse.json({ data: null, error: { message: "Unauthorized" } }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("org_id").eq("id", user.id).single();
  if (!profile?.org_id) return NextResponse.json({ data: null, error: { message: "No workspace found" } }, { status: 403 });

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

  if (error) return NextResponse.json({ data: null, error: { message: error.message } }, { status: 500 });

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
    // Notify managers
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
}
