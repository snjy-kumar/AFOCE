import { NextResponse } from "next/server";
import {
  createAuthClient,
  forbiddenResponse,
  getCurrentUser,
  getUserProfile,
  unauthorizedResponse,
} from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createAuthClient();

  const { user, error: userError } = await getCurrentUser(supabase);
  if (!user) {
    return unauthorizedResponse(userError || "Unauthorized");
  }

  const { profile, error: profileError } = await getUserProfile(
    supabase,
    user.id,
  );
  if (!profile) {
    return forbiddenResponse(profileError || "Profile not found");
  }

  return NextResponse.json({
    data: {
      user: { id: user.id, email: user.email ?? null },
      profile,
      workspace:
        typeof profile === "object" &&
        profile !== null &&
        "workspace" in profile
          ? ((profile as { workspace?: unknown }).workspace ?? null)
          : null,
    },
    error: null,
  });
}
