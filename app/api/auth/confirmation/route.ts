import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { applySecurityHeaders } from "@/lib/utils/security";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  // Verify webhook secret
  const authHeader = request.headers.get("authorization");
  const webhookSecret = process.env.WEBHOOK_API_KEY;

  if (!authHeader?.startsWith("Bearer ") || authHeader.slice(7) !== webhookSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { type, data } = await request.json();

    // Handle signup confirmation event
    if (type === "user.signup") {
      const { email, user_metadata } = data.user;
      const fullName = user_metadata?.full_name || "User";
      const confirmationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?email=${encodeURIComponent(email)}`;

      // Send confirmation email via Resend
      const result = await resend.emails.send({
        from: process.env.FROM_EMAIL || "AFOCE <noreply@afoce.app>",
        to: email,
        subject: "Verify your email - AFOCE Accounting",
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1f1f1f; font-size: 24px; font-weight: 600;">Verify your email</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.5;">Hi ${fullName},</p>
            <p style="color: #666; font-size: 16px; line-height: 1.5;">You've successfully registered for AFOCE Accounting. Click the button below to verify your email and activate your account.</p>

            <div style="margin: 32px 0;">
              <a href="${confirmationUrl}" style="display: inline-block; padding: 12px 32px; background: #1f7a68; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Verify Email
              </a>
            </div>

            <p style="color: #999; font-size: 14px;">Or enter this code manually: <strong>[CODE]</strong></p>
            <p style="color: #999; font-size: 14px;">This link expires in 1 hour.</p>
            <p style="color: #999; font-size: 12px; margin-top: 32px; border-top: 1px solid #eee; padding-top: 16px;">
              If you didn't create this account, you can safely ignore this email.
            </p>
          </div>
        `,
      });

      if (result.error) {
        console.error("Failed to send confirmation email:", result.error);
        return NextResponse.json(
          { error: "Failed to send confirmation email" },
          { status: 500 }
        );
      }

      return applySecurityHeaders(
        NextResponse.json({ success: true, messageId: result.data?.id })
      );
    }

    // Handle other auth events
    return applySecurityHeaders(NextResponse.json({ success: true }));
  } catch (error) {
    console.error("Auth webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
