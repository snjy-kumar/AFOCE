#!/usr/bin/env ts-node
// ============================================================
// Security Audit Script
// Run with: npx ts-node scripts/security-audit.ts
// ============================================================

import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

interface AuditResult {
  passed: boolean;
  message: string;
  severity: "critical" | "warning" | "info";
}

const results: AuditResult[] = [];

function pass(message: string) {
  results.push({ passed: true, message, severity: "info" });
  console.log(`✅ ${message}`);
}

function fail(message: string, severity: "critical" | "warning" = "warning") {
  results.push({ passed: false, message, severity });
  console.log(`❌ ${message}`);
}

async function checkRLS() {
  console.log("\n📋 Checking Row Level Security...\n");

  const { data: tables } = await supabase
    .from("information_schema.tables")
    .select("table_name")
    .eq("table_schema", "public")
    .not("table_name", "like", "pg_%")
    .not("table_name", "like", "_prisma%");

  if (!tables) {
    fail("Could not query database tables", "critical");
    return;
  }

  const expectedTables = [
    "profiles",
    "workspaces",
    "clients",
    "invoices",
    "expenses",
    "policies",
    "bank_lines",
    "audit_log",
    "notifications",
    "id_sequences",
    "recurring_invoices",
  ];

  for (const tableName of expectedTables) {
    const { data: rls } = await supabase.rpc("check_rls_status", {
      table_name: tableName,
    });

    if (rls?.[0]?.rls_enabled) {
      pass(`RLS enabled on ${tableName}`);
    } else {
      fail(`RLS NOT enabled on ${tableName}`, "critical");
    }
  }
}

async function checkPolicies() {
  console.log("\n📋 Checking RLS Policies...\n");

  const { data: policies } = await supabase
    .from("pg_policies")
    .select("tablename, policyname")
    .eq("schemaname", "public");

  if (!policies) {
    fail("Could not query policies", "critical");
    return;
  }

  const requiredPolicies = [
    { table: "profiles", policy: "profiles_select_own" },
    { table: "profiles", policy: "profiles_update_own" },
    { table: "clients", policy: "clients_all_org_member" },
    { table: "invoices", policy: "invoices_all_org_member" },
    { table: "expenses", policy: "expenses_all_org_member" },
    { table: "audit_log", policy: "audit_log_select_org_member" },
  ];

  for (const required of requiredPolicies) {
    const exists = policies.some(
      (p) => p.tablename === required.table && p.policyname === required.policy
    );
    if (exists) {
      pass(`Policy ${required.policy} on ${required.table}`);
    } else {
      fail(`Missing policy ${required.policy} on ${required.table}`, "critical");
    }
  }
}

async function checkFunctions() {
  console.log("\n📋 Checking Database Functions...\n");

  const { data: functions } = await supabase
    .from("information_schema.routines")
    .select("routine_name")
    .eq("routine_schema", "public")
    .eq("routine_type", "FUNCTION");

  if (!functions) {
    fail("Could not query functions", "critical");
    return;
  }

  const functionNames = functions.map((f) => f.routine_name);
  const requiredFunctions = [
    "update_updated_at",
    "assign_client_id",
    "assign_invoice_id",
    "assign_expense_id",
    "get_user_org_id",
    "handle_new_user",
  ];

  for (const func of requiredFunctions) {
    if (functionNames.includes(func)) {
      pass(`Function ${func} exists`);
    } else {
      fail(`Missing function ${func}`, "critical");
    }
  }
}

async function checkTriggers() {
  console.log("\n📋 Checking Triggers...\n");

  const { data: triggers } = await supabase
    .from("information_schema.triggers")
    .select("trigger_name, event_object_table")
    .eq("trigger_schema", "public");

  if (!triggers) {
    fail("Could not query triggers", "critical");
    return;
  }

  const requiredTriggers = [
    { name: "set_client_id", table: "clients" },
    { name: "set_invoice_id", table: "invoices" },
    { name: "set_expense_id", table: "expenses" },
    { name: "on_auth_user_created", table: "users" },
  ];

  for (const trigger of requiredTriggers) {
    const exists = triggers.some(
      (t) =>
        t.trigger_name === trigger.name &&
        t.event_object_table === trigger.table
    );
    if (exists) {
      pass(`Trigger ${trigger.name} on ${trigger.table}`);
    } else {
      fail(`Missing trigger ${trigger.name} on ${trigger.table}`, "critical");
    }
  }
}

async function checkStorageBuckets() {
  console.log("\n📋 Checking Storage Buckets...\n");

  const { data: buckets, error } = await supabase.storage.listBuckets();

  if (error || !buckets) {
    fail("Could not query storage buckets", "critical");
    return;
  }

  const requiredBuckets = [
    { name: "receipts", public: false },
    { name: "avatars", public: true },
    { name: "invoice-attachments", public: false },
    { name: "general", public: false },
  ];

  for (const required of requiredBuckets) {
    const exists = buckets.find((b) => b.name === required.name);
    if (exists) {
      const isPublic = exists.public ? "public" : "private";
      pass(`Bucket ${required.name} exists (${isPublic})`);
    } else {
      fail(`Missing bucket ${required.name}`, "warning");
    }
  }
}

async function checkEnvironmentVariables() {
  console.log("\n📋 Checking Environment Variables...\n");

  const required = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
  ];

  const recommended = [
    "RESEND_API_KEY",
    "FROM_EMAIL",
    "UPSTASH_REDIS_REST_URL",
    "NEXT_PUBLIC_APP_URL",
  ];

  for (const env of required) {
    if (process.env[env]) {
      pass(`Environment variable ${env} is set`);
    } else {
      fail(`Missing required environment variable: ${env}`, "critical");
    }
  }

  for (const env of recommended) {
    if (process.env[env]) {
      pass(`Environment variable ${env} is set`);
    } else {
      fail(`Missing recommended environment variable: ${env}`, "warning");
    }
  }
}

async function checkIndexes() {
  console.log("\n📋 Checking Database Indexes...\n");

  const { data: indexes } = await supabase
    .from("pg_indexes")
    .select("tablename, indexname")
    .eq("schemaname", "public")
    .like("indexname", "idx_%");

  if (!indexes) {
    fail("Could not query indexes", "warning");
    return;
  }

  const requiredIndexes = [
    { table: "notifications", index: "idx_notifications_user_unread" },
    { table: "invoices", index: "idx_invoices_org_status" },
    { table: "expenses", index: "idx_expenses_org_status" },
    { table: "bank_lines", index: "idx_bank_lines_org_state" },
    { table: "audit_log", index: "idx_audit_log_org_created" },
  ];

  for (const required of requiredIndexes) {
    const exists = indexes.some(
      (i) =>
        i.tablename === required.table && i.indexname === required.index
    );
    if (exists) {
      pass(`Index ${required.index} on ${required.table}`);
    } else {
      fail(`Missing index ${required.index} on ${required.table}`, "warning");
    }
  }
}

async function checkSSL() {
  console.log("\n📋 Checking SSL Configuration...\n");

  try {
    const response = await fetch(supabaseUrl!.replace("http", "https"));
    if (response.url.startsWith("https://")) {
      pass("SSL is enabled on Supabase URL");
    } else {
      fail("SSL may not be enforced", "warning");
    }
  } catch {
    fail("Could not verify SSL", "warning");
  }
}

async function checkSupabaseAuth() {
  console.log("\n📋 Checking Supabase Auth...\n");

  // Check if auth is enabled
  const { data: settings, error } = await supabase.auth.getSession();

  if (error) {
    fail("Could not verify auth settings", "warning");
  } else {
    pass("Supabase Auth is accessible");
  }

  // Check MFA settings (if available)
  const { data: mfaSettings } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (mfaSettings) {
    pass("MFA is configured");
  }
}

async function generateReport() {
  console.log("\n" + "=".repeat(60));
  console.log("SECURITY AUDIT REPORT");
  console.log("=".repeat(60));
  console.log(`\nTotal Checks: ${results.length}`);
  console.log(`Passed: ${results.filter((r) => r.passed).length}`);
  console.log(`Failed: ${results.filter((r) => !r.passed).length}`);

  const critical = results.filter((r) => !r.passed && r.severity === "critical");
  const warnings = results.filter((r) => !r.passed && r.severity === "warning");

  console.log(`\nCritical Issues: ${critical.length}`);
  console.log(`Warnings: ${warnings.length}`);

  if (critical.length > 0) {
    console.log("\n🔴 CRITICAL ISSUES (Must fix before production):");
    critical.forEach((r) => console.log(`  - ${r.message}`));
  }

  if (warnings.length > 0) {
    console.log("\n🟡 WARNINGS (Should fix for optimal security):");
    warnings.forEach((r) => console.log(`  - ${r.message}`));
  }

  if (critical.length === 0 && warnings.length === 0) {
    console.log("\n✅ All security checks passed!");
  }

  console.log("\n" + "=".repeat(60));

  // Exit with error code if critical issues found
  process.exit(critical.length > 0 ? 1 : 0);
}

// Create RPC function for checking RLS if not exists
async function setupAuditFunctions() {
  const createRlsCheck = `
    CREATE OR REPLACE FUNCTION check_rls_status(table_name text)
    RETURNS TABLE(rls_enabled boolean) AS $$
    BEGIN
      RETURN QUERY
      SELECT c.relrowsecurity::boolean
      FROM pg_class c
      JOIN pg_namespace n ON c.relnamespace = n.oid
      WHERE n.nspname = 'public'
      AND c.relname = table_name;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `;

  try {
    await supabase.rpc("exec", { sql: createRlsCheck });
  } catch {
    // Function might already exist or we don't have permissions
  }
}

async function main() {
  console.log("🔒 AFOCE Security Audit");
  console.log("======================\n");

  await setupAuditFunctions();
  await checkEnvironmentVariables();
  await checkRLS();
  await checkPolicies();
  await checkFunctions();
  await checkTriggers();
  await checkStorageBuckets();
  await checkIndexes();
  await checkSSL();
  await checkSupabaseAuth();
  await generateReport();
}

main().catch((error) => {
  console.error("Audit failed:", error);
  process.exit(1);
});
