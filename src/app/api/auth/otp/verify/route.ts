import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

const verifyOtpSchema = z.object({
  phone: z.string().min(10, "Invalid phone number"),
  otp: z.string().length(6, "OTP must be 6 digits"),
  name: z.string().min(2, "Name is required").optional(),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  isRegistration: z.boolean().default(false),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, otp, name, password, isRegistration } = verifyOtpSchema.parse(body);

    // Normalize phone number
    const normalizedPhone = phone.startsWith("+233")
      ? phone
      : phone.startsWith("0")
      ? "+233" + phone.slice(1)
      : "+233" + phone;

    // Find OTP token
    const token = await db.verificationToken.findFirst({
      where: { identifier: normalizedPhone },
    });

    if (!token) {
      return NextResponse.json(
        { error: "OTP not found. Please request a new one." },
        { status: 400 }
      );
    }

    // Check if OTP is expired
    if (new Date() > token.expires) {
      await db.verificationToken.deleteMany({
        where: { identifier: normalizedPhone },
      });
      return NextResponse.json(
        { error: "OTP has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Verify OTP
    if (token.token !== otp) {
      return NextResponse.json(
        { error: "Invalid OTP" },
        { status: 400 }
      );
    }

    // Delete used token
    await db.verificationToken.deleteMany({
      where: { identifier: normalizedPhone },
    });

    // If this is a registration, create the user
    if (isRegistration) {
      if (!name || !password) {
        return NextResponse.json(
          { error: "Name and password are required for registration" },
          { status: 400 }
        );
      }

      // Check if user already exists
      const existingUser = await db.user.findUnique({
        where: { phone: normalizedPhone },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "User with this phone number already exists" },
          { status: 400 }
        );
      }

      // Create user
      const hashedPassword = await bcrypt.hash(password, 12);
      const user = await db.user.create({
        data: {
          phone: normalizedPhone,
          name,
          password: hashedPassword,
          phoneVerified: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: "Registration successful",
        userId: user.id,
      });
    }

    // For login, verify user exists
    const user = await db.user.findUnique({
      where: { phone: normalizedPhone },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Update phone verified status
    await db.user.update({
      where: { id: user.id },
      data: { phoneVerified: new Date() },
    });

    return NextResponse.json({
      success: true,
      message: "Phone verified successfully",
      userId: user.id,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error("Error verifying OTP:", error);
    return NextResponse.json(
      { error: "Failed to verify OTP" },
      { status: 500 }
    );
  }
}
