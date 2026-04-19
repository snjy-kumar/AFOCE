// ============================================================
// POST /api/auth/signout — Server-side sign out
// Clears the Supabase session and redirects to /login.
// ============================================================

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Only call signOut if there is an active session — avoids a
  // redundant network round-trip for already-logged-out visitors.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await supabase.auth.signOut();
  }

  // Bust any cached server-component output that depended on auth state.
  revalidatePath("/", "layout");

  return NextResponse.redirect(new URL("/login", req.url), { status: 302 });
}
