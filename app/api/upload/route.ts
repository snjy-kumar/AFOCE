// ============================================================
// File Upload API
// ============================================================

import { NextResponse } from "next/server";
import { createAuthClient, unauthorizedResponse } from "@/lib/supabase/server";
import { checkRateLimit, rateLimitResponse } from "@/lib/utils/rate-limit";
import { validateFile, uploadFile, storageBuckets } from "@/lib/utils/file-upload";
import { applySecurityHeaders, applyCORS } from "@/lib/utils/security";

export async function POST(request: Request) {
  // Rate limiting
  const rateLimit = await checkRateLimit(request, "upload");
  if (!rateLimit.success) {
    return applyCORS(rateLimitResponse(rateLimit.remaining, rateLimit.reset), request);
  }

  // Authentication
  const supabase = await createAuthClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return applyCORS(unauthorizedResponse(), request);
  }

  // Get profile with org_id
  const { data: profile } = await supabase
    .from("profiles")
    .select("org_id")
    .eq("id", user.id)
    .single();

  if (!profile?.org_id) {
    return applyCORS(
      NextResponse.json({ error: { message: "No workspace found" } }, { status: 403 }),
      request
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as "receipt" | "avatar" | "invoice" | "general" | null;
    const folder = formData.get("folder") as string | null;

    if (!file || !type) {
      return applyCORS(
        NextResponse.json(
          { error: { message: "File and type are required" } },
          { status: 400 }
        ),
        request
      );
    }

    // Validate file
    const validation = validateFile(file, type);
    if (!validation.valid) {
      return applyCORS(
        NextResponse.json({ error: { message: validation.error } }, { status: 400 }),
        request
      );
    }

    // Determine bucket based on type
    const bucketMap: Record<typeof type, string> = {
      receipt: storageBuckets.receipts,
      avatar: storageBuckets.avatars,
      invoice: storageBuckets.invoices,
      general: storageBuckets.general,
    };

    const bucket = bucketMap[type];

    // Upload file
    const { url, error: uploadError } = await uploadFile({
      supabase,
      file,
      bucket,
      folder: folder || undefined,
      orgId: profile.org_id,
      processImage: type === "avatar" || type === "receipt",
    });

    if (uploadError) {
      return applyCORS(
        NextResponse.json({ error: { message: uploadError } }, { status: 500 }),
        request
      );
    }

    return applyCORS(
      applySecurityHeaders(
        NextResponse.json({
          data: {
            url,
            fileName: file.name,
            size: file.size,
            type: file.type,
          },
          error: null,
        })
      ),
      request
    );
  } catch (error) {
    console.error("Upload error:", error);
    return applyCORS(
      NextResponse.json(
        { error: { message: "Failed to process upload" } },
        { status: 500 }
      ),
      request
    );
  }
}

// Delete uploaded file
export async function DELETE(request: Request) {
  // Authentication
  const supabase = await createAuthClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return applyCORS(unauthorizedResponse(), request);
  }

  // Get profile with org_id
  const { data: profile } = await supabase
    .from("profiles")
    .select("org_id")
    .eq("id", user.id)
    .single();

  if (!profile?.org_id) {
    return applyCORS(
      NextResponse.json({ error: { message: "No workspace found" } }, { status: 403 }),
      request
    );
  }

  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return applyCORS(
      NextResponse.json({ error: { message: "File URL required" } }, { status: 400 }),
      request
    );
  }

  // Extract path from URL
  const urlObj = new URL(url);
  const pathMatch = urlObj.pathname.match(/\/object\/public\/([^/]+)\/(.+)/);
  if (!pathMatch) {
    return applyCORS(
      NextResponse.json({ error: { message: "Invalid file URL" } }, { status: 400 }),
      request
    );
  }

  const bucket = pathMatch[1];
  const path = decodeURIComponent(pathMatch[2]);

  // Enforce org-level ownership for file deletes.
  if (!path.startsWith(`${profile.org_id}/`)) {
    return applyCORS(
      NextResponse.json({ error: { message: "Forbidden" } }, { status: 403 }),
      request
    );
  }

  const { error } = await supabase.storage.from(bucket).remove([path]);

  if (error) {
    return applyCORS(
      NextResponse.json({ error: { message: error.message } }, { status: 500 }),
      request
    );
  }

  return applyCORS(
    applySecurityHeaders(
      NextResponse.json({
        data: { message: "File deleted successfully" },
        error: null,
      })
    ),
    request
  );
}
