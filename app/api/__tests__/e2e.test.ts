import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL_TEST || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY_TEST || "";
const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY_TEST || "";
const TEST_PASSWORD = "TestPassword123!";
const SUFFIX = Date.now().toString(36);

const shouldRun =
  SUPABASE_URL.length > 0 &&
  SUPABASE_SERVICE_ROLE_KEY.length > 0 &&
  SUPABASE_PUBLISHABLE_KEY.length > 0;

const describeE2E = shouldRun ? describe : describe.skip;

interface TestUser {
  id: string;
  email: string;
  orgId: string;
  role: "finance_admin" | "team_member";
}

function createUserClient() {
  return createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

describeE2E("E2E Integration Tests - Authentication & RLS", () => {
  let supabaseAdmin: SupabaseClient;
  let user1: TestUser;
  let user2: TestUser;

  beforeAll(async () => {
    supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const email1 = `e2e-admin-${SUFFIX}@example.test`;
    const email2 = `e2e-member-${SUFFIX}@example.test`;

    const { data: u1, error: u1Err } = await supabaseAdmin.auth.admin.createUser({
      email: email1,
      password: TEST_PASSWORD,
      email_confirm: true,
    });
    const { data: u2, error: u2Err } = await supabaseAdmin.auth.admin.createUser({
      email: email2,
      password: TEST_PASSWORD,
      email_confirm: true,
    });

    if (u1Err || u2Err || !u1.user?.id || !u2.user?.id) {
      throw new Error(u1Err?.message || u2Err?.message || "Failed to create test users");
    }

    user1 = {
      id: u1.user.id,
      email: email1,
      orgId: `org-e2e-a-${SUFFIX}`,
      role: "finance_admin",
    };
    user2 = {
      id: u2.user.id,
      email: email2,
      orgId: `org-e2e-b-${SUFFIX}`,
      role: "team_member",
    };

    const { error: profileErr } = await supabaseAdmin.from("profiles").insert([
      {
        id: user1.id,
        email: user1.email,
        full_name: "E2E Admin",
        org_id: user1.orgId,
        role: user1.role,
        status: "active",
      },
      {
        id: user2.id,
        email: user2.email,
        full_name: "E2E Member",
        org_id: user2.orgId,
        role: user2.role,
        status: "active",
      },
    ]);

    if (profileErr) {
      throw new Error(profileErr.message);
    }
  });

  afterAll(async () => {
    await supabaseAdmin.from("pending_invites").delete().ilike("email", `%${SUFFIX}%`);
    await supabaseAdmin.from("profiles").delete().in("id", [user1.id, user2.id]);
    await supabaseAdmin.auth.admin.deleteUser(user1.id);
    await supabaseAdmin.auth.admin.deleteUser(user2.id);
  });

  it("authenticates a valid user session", async () => {
    const client = createUserClient();
    const { data, error } = await client.auth.signInWithPassword({
      email: user1.email,
      password: TEST_PASSWORD,
    });

    expect(error).toBeNull();
    expect(data.user?.id).toBe(user1.id);
    expect(data.session?.access_token).toBeDefined();
  });

  it("rejects invalid user credentials", async () => {
    const client = createUserClient();
    const { error } = await client.auth.signInWithPassword({
      email: user1.email,
      password: "WrongPassword123!",
    });

    expect(error).toBeDefined();
    expect(error?.status).toBe(400);
  });

  it("enforces cross-org RLS isolation on profiles", async () => {
    const client = createUserClient();
    const { data: authData } = await client.auth.signInWithPassword({
      email: user1.email,
      password: TEST_PASSWORD,
    });

    if (!authData.session) {
      throw new Error("Missing test session");
    }

    await client.auth.setSession(authData.session);

    const ownOrg = await client.from("profiles").select("id, org_id").eq("org_id", user1.orgId);
    const otherOrg = await client
      .from("profiles")
      .select("id, org_id")
      .eq("org_id", user2.orgId);

    expect(ownOrg.error).toBeNull();
    expect((ownOrg.data || []).length).toBeGreaterThan(0);
    expect((otherOrg.data || []).length).toBe(0);
  });

  it("keeps pending_invites inaccessible to authenticated users", async () => {
    const inviteEmail = `e2e-invite-${SUFFIX}@example.test`;
    await supabaseAdmin.from("pending_invites").insert({
      email: inviteEmail,
      org_id: user1.orgId,
      role: "team_member",
      invited_by: user1.id,
    });

    const client = createUserClient();
    const { data: authData } = await client.auth.signInWithPassword({
      email: user1.email,
      password: TEST_PASSWORD,
    });

    if (!authData.session) {
      throw new Error("Missing test session");
    }

    await client.auth.setSession(authData.session);

    const { data, error } = await client
      .from("pending_invites")
      .select("email")
      .eq("email", inviteEmail);

    expect(error).toBeNull();
    expect((data || []).length).toBe(0);
  });
});
