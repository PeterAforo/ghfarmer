import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Find user by email
    const user = await db.user.findUnique({
      where: { email },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ success: true });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // Store reset token (in production, hash this token)
    await db.user.update({
      where: { id: user.id },
      data: {
        // Store token in a field - we'll use emailVerified temporarily
        // In production, add proper resetToken and resetTokenExpiry fields
      },
    });

    // In production, send email with reset link
    // For now, log the token (remove in production)
    console.log(`Password reset token for ${email}: ${resetToken}`);
    console.log(`Reset link: ${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`);

    // TODO: Integrate with email service (SendGrid, AWS SES, etc.)
    // await sendPasswordResetEmail(email, resetToken);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in forgot password:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
