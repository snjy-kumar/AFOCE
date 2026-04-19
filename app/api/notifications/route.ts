// ============================================================
// Notifications API
// ============================================================

import { NextResponse } from "next/server";
import { createAuthClient, unauthorizedResponse } from "@/lib/supabase/server";
import {
  getUnreadNotificationsCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/lib/utils/notifications";
import { applySecurityHeaders, applyCORS } from "@/lib/utils/security";

export async function GET(request: Request) {
  // Authentication
  const supabase = await createAuthClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return applyCORS(unauthorizedResponse(), request);
  }

  const { searchParams } = new URL(request.url);
  const unreadOnly = searchParams.get("unread") === "true";
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "20");

  if (unreadOnly) {
    const count = await getUnreadNotificationsCount(supabase, user.id);
    return applyCORS(
      applySecurityHeaders(
        NextResponse.json({ data: { count }, error: null })
      ),
      request
    );
  }

  // Get notifications with pagination
  let query = supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  const { data, error } = await query;

  if (error) {
    return applyCORS(
      NextResponse.json({ error: { message: error.message } }, { status: 500 }),
      request
    );
  }

  const { count } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  return applyCORS(
    applySecurityHeaders(
      NextResponse.json({
        data: {
          notifications: data,
          pagination: {
            page,
            pageSize,
            total: count || 0,
          },
        },
        error: null,
      })
    ),
    request
  );
}

// Mark notification as read
export async function PATCH(request: Request) {
  // Authentication
  const supabase = await createAuthClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return applyCORS(unauthorizedResponse(), request);
  }

  const body = await request.json();
  const { notificationId, markAll = false } = body;

  if (markAll) {
    await markAllNotificationsAsRead(supabase, user.id);
    return applyCORS(
      applySecurityHeaders(
        NextResponse.json({
          data: { message: "All notifications marked as read" },
          error: null,
        })
      ),
      request
    );
  }

  if (!notificationId) {
    return applyCORS(
      NextResponse.json(
        { error: { message: "Notification ID required" } },
        { status: 400 }
      ),
      request
    );
  }

  const { error } = await markNotificationAsRead(supabase, notificationId, user.id);

  if (error) {
    return applyCORS(
      NextResponse.json({ error: { message: error.message } }, { status: 500 }),
      request
    );
  }

  return applyCORS(
    applySecurityHeaders(
      NextResponse.json({
        data: { message: "Notification marked as read" },
        error: null,
      })
    ),
    request
  );
}

// Delete notification
export async function DELETE(request: Request) {
  // Authentication
  const supabase = await createAuthClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return applyCORS(unauthorizedResponse(), request);
  }

  const { searchParams } = new URL(request.url);
  const notificationId = searchParams.get("id");

  if (!notificationId) {
    return applyCORS(
      NextResponse.json(
        { error: { message: "Notification ID required" } },
        { status: 400 }
      ),
      request
    );
  }

  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", notificationId)
    .eq("user_id", user.id);

  if (error) {
    return applyCORS(
      NextResponse.json({ error: { message: error.message } }, { status: 500 }),
      request
    );
  }

  return applyCORS(
    applySecurityHeaders(
      NextResponse.json({
        data: { message: "Notification deleted" },
        error: null,
      })
    ),
    request
  );
}
