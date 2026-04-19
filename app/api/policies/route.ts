import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { PaginatedResponse, PolicyRecord } from "@/lib/types";
import { auditLog } from "@/lib/utils/audit";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "20");
  const category = searchParams.get("category");
  const status = searchParams.get("status");

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ data: null, error: { message: "Unauthorized" } }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("org_id")
    .eq("id", user.id)
    .single();

  if (!profile?.org_id) {
    return NextResponse.json({ data: null, error: { message: "No workspace found" } }, { status: 403 });
  }

  let query = supabase
    .from("policies")
    .select("*")
    .eq("org_id", profile.org_id)
    .order("created_at", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (category) query = query.eq("category", category);
  if (status) query = query.eq("status", status);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ data: null, error: { message: error.message } }, { status: 500 });
  }

  return NextResponse.json({ data, error: null });
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ data: null, error: { message: "Unauthorized" } }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("org_id")
    .eq("id", user.id)
    .single();

  if (!profile?.org_id) {
    return NextResponse.json({ data: null, error: { message: "No workspace found" } }, { status: 403 });
  }

  const body = await request.json();
  const { name, description, category, status = "active" } = body;

  if (!name || !category) {
    return NextResponse.json({ data: null, error: { message: "Name and category are required" } }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("policies")
    .insert({
      org_id: profile.org_id,
      id: `POL-${Date.now()}`,
      name,
      description: description || null,
      category,
      status,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ data: null, error: { message: error.message } }, { status: 500 });
  }

  await auditLog({
    supabase,
    actorId: user.id,
    orgId: profile.org_id,
    action: "create",
    entityType: "policies",
    entityId: data.id,
    detail: { name, category },
  });

  return NextResponse.json({ data, error: null }, { status: 201 });
}
