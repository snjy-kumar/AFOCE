import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createAdminClient: vi.fn(),
  applySecurityHeaders: vi.fn((response: Response) => response),
  findMatchCandidates: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createAdminClient: mocks.createAdminClient,
}));

vi.mock("@/lib/utils/security", () => ({
  applySecurityHeaders: mocks.applySecurityHeaders,
}));

vi.mock("@/lib/utils/workflow", () => ({
  findMatchCandidates: mocks.findMatchCandidates,
}));

import { GET, POST } from "@/app/api/webhooks/bank-statement/route";

interface QueryError {
  message: string;
}

interface QueryResult<T> {
  data: T;
  error: QueryError | null;
}

interface BankLineInsertPayload {
  org_id: string;
  date: string;
  description: string;
  amount: number;
  matched_invoice_id: string | null;
  matched_expense_id: string | null;
  confidence: number | null;
  state: "matched" | "needs_review" | "unmatched";
  source: string | null;
}

function buildListQuery<T>(result: QueryResult<T>) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    in: vi.fn().mockResolvedValue(result),
  };
}

function createSupabaseMock({
  invoicesResult,
  expensesResult,
}: {
  invoicesResult: QueryResult<Array<Record<string, unknown>>>;
  expensesResult: QueryResult<Array<Record<string, unknown>>>;
}) {
  let bankLineCounter = 0;

  return {
    from: vi.fn((table: string) => {
      if (table === "invoices") {
        return buildListQuery(invoicesResult);
      }

      if (table === "expenses") {
        return buildListQuery(expensesResult);
      }

      if (table === "bank_lines") {
        return {
          insert: vi.fn((payload: BankLineInsertPayload) => ({
            select: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: { id: `bank-line-${++bankLineCounter}`, ...payload },
                error: null,
              }),
            })),
          })),
        };
      }

      throw new Error(`Unexpected table: ${table}`);
    }),
  };
}

describe("Bank statement webhook route", () => {
  const originalWebhookKey = process.env.WEBHOOK_API_KEY;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (typeof originalWebhookKey === "string") {
      process.env.WEBHOOK_API_KEY = originalWebhookKey;
    } else {
      delete process.env.WEBHOOK_API_KEY;
    }
  });

  it("returns 503 when webhook API key is not configured", async () => {
    delete process.env.WEBHOOK_API_KEY;

    const request = new Request("http://localhost:3000/api/webhooks/bank-statement", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orgId: "org-1", lines: [] }),
    });

    const response = await POST(request);
    const body = (await response.json()) as { error: { message: string } };

    expect(response.status).toBe(503);
    expect(body.error.message).toBe("Webhook is not configured");
    expect(mocks.createAdminClient).not.toHaveBeenCalled();
    expect(mocks.applySecurityHeaders).toHaveBeenCalledTimes(1);
  });

  it("returns 401 when API key is missing or invalid", async () => {
    process.env.WEBHOOK_API_KEY = "expected-key";

    const request = new Request("http://localhost:3000/api/webhooks/bank-statement", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": "wrong-key" },
      body: JSON.stringify({ orgId: "org-1", lines: [] }),
    });

    const response = await POST(request);
    const body = (await response.json()) as { error: { message: string } };

    expect(response.status).toBe(401);
    expect(body.error.message).toBe("Invalid API key");
    expect(mocks.createAdminClient).not.toHaveBeenCalled();
  });

  it("returns 400 when orgId or lines is missing", async () => {
    process.env.WEBHOOK_API_KEY = "expected-key";
    mocks.createAdminClient.mockReturnValue(
      createSupabaseMock({
        invoicesResult: { data: [], error: null },
        expensesResult: { data: [], error: null },
      }),
    );

    const request = new Request("http://localhost:3000/api/webhooks/bank-statement", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": "expected-key" },
      body: JSON.stringify({ source: "bank" }),
    });

    const response = await POST(request);
    const body = (await response.json()) as { error: { message: string } };

    expect(response.status).toBe(400);
    expect(body.error.message).toBe("orgId and lines array required");
  });

  it("returns 500 when invoice query fails", async () => {
    process.env.WEBHOOK_API_KEY = "expected-key";
    mocks.createAdminClient.mockReturnValue(
      createSupabaseMock({
        invoicesResult: { data: [], error: { message: "invoice query failed" } },
        expensesResult: { data: [], error: null },
      }),
    );

    const request = new Request("http://localhost:3000/api/webhooks/bank-statement", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": "expected-key" },
      body: JSON.stringify({
        orgId: "org-1",
        source: "bank",
        lines: [{ date: "2024-01-01", description: "Payment", amount: 1500 }],
      }),
    });

    const response = await POST(request);
    const body = (await response.json()) as { error: { message: string } };

    expect(response.status).toBe(500);
    expect(body.error.message).toBe("invoice query failed");
  });

  it("processes webhook lines and returns match summary", async () => {
    process.env.WEBHOOK_API_KEY = "expected-key";
    mocks.createAdminClient.mockReturnValue(
      createSupabaseMock({
        invoicesResult: {
          data: [{ id: "inv-1", amount: 1500, ad_date: "2024-01-01", status: "pending" }],
          error: null,
        },
        expensesResult: { data: [], error: null },
      }),
    );

    mocks.findMatchCandidates.mockImplementation(
      (line: { amount: number; description: string }) => {
        if (line.amount === 1500 && line.description.includes("Invoice")) {
          return [{ id: "inv-1", type: "invoice", confidence: 95 }];
        }

        return [];
      },
    );

    const request = new Request("http://localhost:3000/api/webhooks/bank-statement", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": "expected-key" },
      body: JSON.stringify({
        orgId: "org-1",
        source: "bank",
        lines: [
          { date: "2024-01-01", description: "Invoice payment", amount: 1500 },
          { date: "2024-01-02", description: "Unknown transfer", amount: 200 },
        ],
      }),
    });

    const response = await POST(request);
    const body = (await response.json()) as {
      data: {
        processed: number;
        matched: number;
        needs_review: number;
        unmatched: number;
      };
      error: null;
    };

    expect(response.status).toBe(200);
    expect(body.error).toBeNull();
    expect(body.data.processed).toBe(2);
    expect(body.data.matched).toBe(1);
    expect(body.data.needs_review).toBe(0);
    expect(body.data.unmatched).toBe(1);
  });

  it("returns webhook documentation for GET", async () => {
    const response = await GET();
    const body = (await response.json()) as { method: string; headers: Record<string, string> };

    expect(response.status).toBe(200);
    expect(body.method).toBe("POST");
    expect(body.headers["X-API-Key"]).toContain("WEBHOOK_API_KEY");
  });
});
