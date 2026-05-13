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
  attachComplianceFindings,
  createDecisionLogInsert,
  decideExpense,
  evaluateExpenseCompliance,
  planExpenseExecution,
  summarizeDecision,
} from "@/lib/afoce";
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

    let decision = decideExpense({
      employee,
      category,
      amount,
      bs_date,
      ad_date,
      receipt_url,
      description,
    });
    decision = attachComplianceFindings(
      decision,
      evaluateExpenseCompliance({
        employee,
        category,
        amount,
        bs_date,
        ad_date,
        receipt_url,
        description,
      })
    );
    const executionPlan = planExpenseExecution(decision);
    const initialStatus = (executionPlan.status || "pending_approval") as ExpenseStatus;

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
        policy_id: firstPersistedPolicyId(decision.matchedPolicyIds),
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

    // Evaluate executable policies before creating the source record.
    const { data: policies } = await supabase
      .from("policies")
      .select("*")
      .eq("org_id", profile.org_id)
      .eq("category", "expenses")
      .eq("status", "active")
      .order("priority", { ascending: false });

    decision = decideExpense(
      {
        employee,
        category,
        amount,
        bs_date,
        ad_date,
        receipt_url,
        description,
      },
      policies || []
    );
    decision = attachComplianceFindings(
      decision,
      evaluateExpenseCompliance({
        employee,
        category,
        amount,
        bs_date,
        ad_date,
        receipt_url,
        description,
      })
    );
    const persistedExecutionPlan = planExpenseExecution(decision);
    const persistedStatus = (persistedExecutionPlan.status || "pending_approval") as ExpenseStatus;

    const { data, error } = await supabase
      .from("expenses")
      .insert({
        org_id: profile.org_id,
        employee,
        category,
        amount,
        bs_date,
        ad_date,
        status: persistedStatus,
        policy_id: firstPersistedPolicyId(decision.matchedPolicyIds),
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
      detail: {
        employee,
        category,
        amount,
        status: persistedStatus,
        decision: summarizeDecision(decision),
      },
    });

    await recordAutonomousTrace({
      supabase,
      orgId: profile.org_id,
      actorId: user.id,
      expenseId: data.id,
      decision,
    });

    // Send notification only for exceptions that need human attention.
    if (persistedExecutionPlan.shouldNotifyHumans) {
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
                reason: persistedExecutionPlan.notificationReason,
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

async function recordAutonomousTrace({
  supabase,
  orgId,
  actorId,
  expenseId,
  decision,
}: {
  supabase: Awaited<ReturnType<typeof createServerClient>>;
  orgId: string;
  actorId: string;
  expenseId: string;
  decision: ReturnType<typeof decideExpense>;
}) {
  const financeEventInsert = {
    org_id: orgId,
    event_type: decision.eventType,
    entity_type: decision.entityType,
    entity_id: expenseId,
    payload: decision.facts,
    source: "api",
    created_by: actorId,
  };

  const decisionLogInsert = createDecisionLogInsert({
    decision,
    orgId,
    actorId,
    entityId: expenseId,
  });

  const [{ error: eventError }, { data: decisionLog, error: decisionError }] = await Promise.all([
    supabase.from("finance_events").insert(financeEventInsert),
    supabase.from("decision_logs").insert(decisionLogInsert).select("id").single(),
  ]);

  if (eventError) {
    logError(eventError, {
      method: "POST",
      path: "/api/expenses finance_events",
      userId: actorId,
      orgId,
    });
  }

  if (decisionError) {
    logError(decisionError, {
      method: "POST",
      path: "/api/expenses decision_logs",
      userId: actorId,
      orgId,
    });
    return;
  }

  await supabase.from("automation_actions").insert({
    org_id: orgId,
    decision_log_id: decisionLog?.id || null,
    entity_type: decision.entityType,
    entity_id: expenseId,
    action_type: decision.outcome,
    status: "executed",
    detail: {
      confidence: decision.confidence,
      matched_policy_ids: decision.matchedPolicyIds,
    },
    created_by: actorId,
    executed_at: new Date().toISOString(),
  });
}

function firstPersistedPolicyId(policyIds: string[]): string | null {
  return policyIds.find((id) => !id.startsWith("DEFAULT-")) || null;
}
