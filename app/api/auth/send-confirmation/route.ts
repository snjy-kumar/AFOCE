import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { applySecurityHeaders } from "@/lib/utils/security";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { email, fullName } = await request.json();

    if (!email || !fullName) {
      return NextResponse.json(
        { error: "Email and name are required" },
        { status: 400 }
      );
    }

    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY not configured");
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 500 }
      );
    }

    const confirmationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?email=${encodeURIComponent(email)}`;

    const result = await resend.emails.send({
      from: process.env.FROM_EMAIL || "AFOCE <noreply@afoce.app>",
      to: email,
      subject: "Verify your email - AFOCE Accounting",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #fafafa; padding: 20px;">
          <div style="background: white; border-radius: 8px; padding: 32px; text-align: center;">
            <h2 style="color: #1f1f1f; font-size: 24px; font-weight: 600; margin: 0 0 16px 0;">Welcome to AFOCE!</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">Hi <strong>${fullName}</strong>,</p>

            <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0;">
              Verify your email address to complete your registration and start using AFOCE Accounting.
            </p>

            <a href="${confirmationUrl}" style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #1f7a68 0%, #155e4e 100%); color: white; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; margin-bottom: 24px;">
              Verify Email Address
            </a>

            <div style="background: #f5f5f5; border-left: 4px solid #1f7a68; padding: 16px; margin: 24px 0; text-align: left; border-radius: 4px;">
              <p style="color: #666; font-size: 14px; margin: 0;"><strong>Can't click?</strong></p>
              <p style="color: #666; font-size: 13px; margin: 8px 0 0 0;">Copy this link: <br/><span style="word-break: break-all; color: #1f7a68;">${confirmationUrl}</span></p>
            </div>

            <p style="color: #999; font-size: 12px; margin: 32px 0 0 0; padding-top: 16px; border-top: 1px solid #eee;">
              This link expires in 24 hours. If you didn't create this account, please ignore this email.
            </p>
          </div>
        </div>
      `,
    });

    if (result.error) {
      console.error("Failed to send confirmation email:", result.error);
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 }
      );
    }

    return applySecurityHeaders(
      NextResponse.json(
        { success: true, messageId: result.data?.id },
        { status: 200 }
      )
    );
  } catch (error) {
    console.error("Send confirmation email error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
