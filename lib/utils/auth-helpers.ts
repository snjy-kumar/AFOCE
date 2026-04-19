import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function getUserOrDemo(
  cookieStore: Awaited<ReturnType<typeof cookies>>,
  demoUserEmail = "demo@afoce.com"
): Promise<{ id: string | null; email: string | null; isDemo: boolean }> {
  const demoCookie = cookieStore.get("demo_user");

  if (demoCookie) {
    return { id: "demo-user-id", email: demoUserEmail, isDemo: true };
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { id: user?.id ?? null, email: user?.email ?? null, isDemo: false };
}
