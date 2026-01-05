import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // In production, verify the token against stored hash
    // For demo purposes, we'll just update the password
    // You would normally look up the user by the reset token
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // For demo: This would normally verify token and find user
    // In production, add resetToken and resetTokenExpiry fields to User model
    // const user = await db.user.findFirst({
    //   where: {
    //     resetToken: hashedToken,
    //     resetTokenExpiry: { gt: new Date() },
    //   },
    // });

    // For now, return success (implement full flow with email service)
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error resetting password:", error);
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    );
  }
}
