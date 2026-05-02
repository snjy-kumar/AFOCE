import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { Metric, MonthlyData } from "@/lib/types";
import {
  errorResponse,
  logError,
} from "@/lib/utils/error-handler";

/**
 * GET /api/analytics - Get dashboard metrics and monthly data
 *
 * @query period - Time period filter (optional)
 * @returns {Object} Analytics data including metrics and monthly breakdown
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "this_month";

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return errorResponse(401, "Unauthorized");
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("org_id")
      .eq("id", user.id)
      .single();

    if (!profile?.org_id) {
      return errorResponse(403, "No workspace found");
    }

    // Fetch all data in parallel for efficiency
    const [
      { data: invoices, error: invoicesError },
      { data: expenses, error: expensesError },
      { count: overdueCount, error: overdueError },
      { count: pendingApprovalsCount, error: pendingError },
      { count: blockedCount, error: blockedError },
      { count: unmatchedCount, error: unmatchedError },
    ] = await Promise.all([
      supabase
        .from("invoices")
        .select("amount, vat, ad_date")
        .eq("org_id", profile.org_id)
        .in("status", ["paid", "pending", "overdue"]),
      supabase
        .from("expenses")
        .select("amount, ad_date")
        .eq("org_id", profile.org_id)
        .in("status", ["approved", "pending_approval", "manager_review"]),
      supabase
        .from("invoices")
        .select("id", { count: "exact", head: true })
        .eq("org_id", profile.org_id)
        .eq("status", "overdue"),
      supabase
        .from("expenses")
        .select("id", { count: "exact", head: true })
        .eq("org_id", profile.org_id)
        .in("status", ["pending_approval", "manager_review"]),
      supabase
        .from("expenses")
        .select("id", { count: "exact", head: true })
        .eq("org_id", profile.org_id)
        .eq("status", "blocked"),
      supabase
        .from("bank_lines")
        .select("id", { count: "exact", head: true })
        .eq("org_id", profile.org_id)
        .in("state", ["needs_review", "unmatched"]),
    ]);

    // Check for errors
    const anyError = invoicesError || expensesError || overdueError || pendingError || blockedError || unmatchedError;
    if (anyError) {
      logError(anyError, {
        method: "GET",
        path: "/api/analytics",
        userId: user.id,
        orgId: profile.org_id,
      });
      return errorResponse(500, "Failed to fetch analytics data");
    }

    // Aggregate by Nepali month
    const monthlyMap: Record<string, { revenue: number; expenses: number }> = {};
    for (const inv of invoices || []) {
      const bsDate = adToBsMonth(inv.ad_date);
      if (!monthlyMap[bsDate]) monthlyMap[bsDate] = { revenue: 0, expenses: 0 };
      monthlyMap[bsDate].revenue +=
        parseFloat(String(inv.amount)) + parseFloat(String(inv.vat));
    }
    for (const exp of expenses || []) {
      const bsDate = adToBsMonth(exp.ad_date);
      if (!monthlyMap[bsDate]) monthlyMap[bsDate] = { revenue: 0, expenses: 0 };
      monthlyMap[bsDate].expenses += parseFloat(String(exp.amount));
    }

    const monthlyData: MonthlyData[] = Object.entries(monthlyMap).map(
      ([month, data]) => ({
        month,
        revenue: data.revenue,
        expenses: data.expenses,
        profit: data.revenue - data.expenses,
      })
    );

    // Compute summary metrics
    const totalRevenue = monthlyData.reduce((s, m) => s + m.revenue, 0);
    const totalExpenses = monthlyData.reduce((s, m) => s + m.expenses, 0);
    const totalProfit = totalRevenue - totalExpenses;
    const lastMonth = monthlyData[monthlyData.length - 1];

    const metrics: Metric[] = [
      {
        label: "Total Revenue",
        value: `NPR ${totalRevenue.toLocaleString()}`,
        change: lastMonth
          ? `${((lastMonth.revenue / totalRevenue) * 100).toFixed(1)}%`
          : "0%",
        trend: "up",
        icon: "TrendingUp",
        color: "text-green-600",
        bg: "bg-green-50",
      },
      {
        label: "Total Expenses",
        value: `NPR ${totalExpenses.toLocaleString()}`,
        change: lastMonth
          ? `${((lastMonth.expenses / totalExpenses) * 100).toFixed(1)}%`
          : "0%",
        trend: "down",
        icon: "TrendingDown",
        color: "text-red-600",
        bg: "bg-red-50",
      },
      {
        label: "Net Profit",
        value: `NPR ${totalProfit.toLocaleString()}`,
        change: totalProfit >= 0 ? "Positive" : "Negative",
        trend: totalProfit >= 0 ? "up" : "down",
        icon: "DollarSign",
        color: totalProfit >= 0 ? "text-green-600" : "text-red-600",
        bg: totalProfit >= 0 ? "bg-green-50" : "bg-red-50",
      },
      {
        label: "Collection Rate",
        value: invoices?.length
          ? `${(((invoices || []).filter((i) => i).length) / Math.max(invoices?.length, 1) * 100).toFixed(1)}%`
          : "0%",
        change: "On track",
        trend: "up",
        icon: "Percent",
        color: "text-blue-600",
        bg: "bg-blue-50",
      },
    ];

    return NextResponse.json({
      data: {
        metrics,
        monthlyData,
        overdue: overdueCount ?? 0,
        pendingApprovals: pendingApprovalsCount ?? 0,
        blocked: blockedCount ?? 0,
        unmatched: unmatchedCount ?? 0,
      },
      error: null,
    });
  } catch (error) {
    logError(error, { method: "GET", path: "/api/analytics" });
    return errorResponse(500, "Internal server error");
  }
}

function adToBsMonth(adDateStr: string): string {
  const date = new Date(adDateStr);
  const adYear = date.getFullYear();
  const adMonth = date.getMonth();
  let bsYear = adYear - 2024 + 2081;
  let bsMonth = adMonth - 3;
  if (bsMonth < 0) {
    bsMonth += 12;
    bsYear -= 1;
  }
  const BS_MONTHS = [
    "Baisakh",
    "Jestha",
    "Ashadh",
    "Shrawan",
    "Bhadra",
    "Ashwin",
    "Kartik",
    "Mangsir",
    "Poush",
    "Magh",
    "Falgun",
    "Chaitra",
  ];
  return `${BS_MONTHS[bsMonth]} ${bsYear}`;
}
