// ============================================================
// /auth/confirm — PKCE token_hash verification
// Handles email confirmation, password recovery, and invite links.
//
// Email template usage:
//   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/dashboard
//   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password
//   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite&next=/dashboard
// ============================================================

import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/dashboard";

  // Both params are required — if either is missing, redirect to error
  if (token_hash && type) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { error } = await supabase.auth.verifyOtp({ type, token_hash });

    if (!error) {
      // Build a clean redirect URL — strip the OTP params so they
      // don't linger in browser history or get accidentally re-used.
      const redirectTo = request.nextUrl.clone();
      redirectTo.pathname = next;
      redirectTo.searchParams.delete("token_hash");
      redirectTo.searchParams.delete("type");
      redirectTo.searchParams.delete("next");
      return NextResponse.redirect(redirectTo);
    }
  }

  // Something went wrong (missing params, expired token, already used, etc.)
  const errorUrl = request.nextUrl.clone();
  errorUrl.pathname = "/login";
  errorUrl.searchParams.set("error", "invalid_token");
  // Remove any OTP params that might have leaked through
  errorUrl.searchParams.delete("token_hash");
  errorUrl.searchParams.delete("type");
  errorUrl.searchParams.delete("next");
  return NextResponse.redirect(errorUrl);
}
