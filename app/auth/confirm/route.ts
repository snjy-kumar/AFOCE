// ============================================================
// /auth/confirm — Post-email-verification redirect handler
//
// HOW IT WORKS:
// Supabase's edge function at /auth/v1/verify processes the email link,
// validates the token, sets a session cookie, THEN redirects here.
// By the time the user lands on this route, Supabase has already:
//   1. Validated the token_hash
//   2. Set a session cookie in the browser
//   3. Created/confirmed the user record
//
// Our job is simply to read the session and redirect to the final destination.
// We do NOT call verifyOtp — the token is already consumed by Supabase's edge function.
//
// URL params received from Supabase redirect:
//   - token_hash (already consumed, not used here)
//   - type (signup | recovery | invite)
//   - next (where to redirect after confirmation)
// ============================================================

import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createServerComponentClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/dashboard";

  const supabase = await createServerComponentClient();

  // Get the session that Supabase's edge function already set
  const { data: { user }, error: sessionError } = await supabase.auth.getUser();

  if (sessionError || !user) {
    // No valid session — redirect to login with error
    const errorUrl = request.nextUrl.clone();
    errorUrl.pathname = "/login";
    errorUrl.searchParams.set("error", "invalid_token");
    return NextResponse.redirect(errorUrl);
  }

  // Session is valid — redirect to the intended destination
  const redirectTo = request.nextUrl.clone();
  redirectTo.pathname = next;
  redirectTo.searchParams.delete("token_hash");
  redirectTo.searchParams.delete("type");
  redirectTo.searchParams.delete("next");
  return NextResponse.redirect(redirectTo);
}
