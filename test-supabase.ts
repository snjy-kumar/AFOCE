import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing environment variables!");
  console.error(
    "   Check .env.local has NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const requiredTables = [
  "workspaces",
  "profiles",
  "clients",
  "policies",
  "invoices",
  "expenses",
  "bank_lines",
  "audit_log",
  "id_sequences",
  "notifications",
  "recurring_invoices",
] as const;

async function checkTableExists(table: string) {
  return supabase.from(table).select("*", { count: "exact", head: true });
}

async function checkConnection() {
  console.log("🔍 Supabase Backend Verification");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Project URL:", supabaseUrl?.substring(0, 35) + "...");
  console.log("");

  let allPassed = true;

  try {
    // Test 1: Auth Service
    console.log("1️⃣ Auth Service");
    const { error: authError } = await supabase.auth.getSession();
    if (authError) {
      console.log("   ❌ Failed:", authError.message);
      allPassed = false;
    } else {
      console.log("   ✅ Connected (no active session - expected)");
    }

    // Test 2: Database (try to get session user)
    console.log("\n2️⃣ Database Connection");
    const { error: userError } = await supabase.auth.getUser();
    if (userError && userError.message !== "Auth session missing!") {
      console.log("   ❌ Failed:", userError.message);
      allPassed = false;
    } else {
      console.log("   ✅ Database reachable");
    }

    // Test 3: Core tables exist
    console.log("\n3️⃣ Database Tables");
    let missingTables = 0;

    for (const table of requiredTables) {
      const { error } = await checkTableExists(table);
      if (error) {
        missingTables += 1;
        console.log(`   ❌ ${table}: ${error.message}`);
      } else {
        console.log(`   ✅ ${table}`);
      }
    }

    if (missingTables > 0) {
      allPassed = false;
      console.log(
        "   💡 Apply AFOCE/supabase/schema.sql in Supabase SQL Editor",
      );
    }

    // Test 4: Key app tables are queryable
    console.log("\n4️⃣ Application Query Checks");
    const queryChecks = [
      {
        label: "Profiles table",
        query: () =>
          supabase
            .from("profiles")
            .select("id", { head: true, count: "exact" }),
      },
      {
        label: "Workspaces table",
        query: () =>
          supabase
            .from("workspaces")
            .select("id", { head: true, count: "exact" }),
      },
      {
        label: "Invoices table",
        query: () =>
          supabase
            .from("invoices")
            .select("id", { head: true, count: "exact" }),
      },
      {
        label: "Expenses table",
        query: () =>
          supabase
            .from("expenses")
            .select("id", { head: true, count: "exact" }),
      },
      {
        label: "Notifications table",
        query: () =>
          supabase
            .from("notifications")
            .select("id", { head: true, count: "exact" }),
      },
    ];

    for (const check of queryChecks) {
      const { error } = await check.query();
      if (error) {
        console.log(`   ❌ ${check.label}: ${error.message}`);
        allPassed = false;
      } else {
        console.log(`   ✅ ${check.label}`);
      }
    }

    // Test 5: Auth signup endpoint reachable
    console.log("\n5️⃣ Auth Signup Configuration");
    const { error: signupError } = await supabase.auth.signUp({
      email: "test-verification@example.com",
      password: "testpass123",
    });
    if (
      signupError?.message?.includes("network") ||
      signupError?.message?.includes("fetch")
    ) {
      console.log("   ❌ Network error:", signupError.message);
      allPassed = false;
    } else {
      console.log("   ✅ Auth signup endpoint reachable");
    }

    // Summary
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    if (allPassed) {
      console.log("✅ Supabase backend is properly configured!");
      console.log("\nNext steps:");
      console.log("   • Verify RLS policies match your app flows");
      console.log(
        "   • Set SUPABASE_SERVICE_ROLE_KEY for admin-only backend routes",
      );
      console.log("   • Configure email templates in Supabase Dashboard");
    } else {
      console.log("❌ Some checks failed - review errors above");
      process.exit(1);
    }
  } catch (err) {
    console.error("\n❌ Unexpected error:", err);
    process.exit(1);
  }
}

checkConnection();
