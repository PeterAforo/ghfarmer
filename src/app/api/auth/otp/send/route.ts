import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const sendOtpSchema = z.object({
  phone: z.string().min(10, "Invalid phone number"),
});

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone } = sendOtpSchema.parse(body);

    // Normalize phone number (Ghana format)
    const normalizedPhone = phone.startsWith("+233")
      ? phone
      : phone.startsWith("0")
      ? "+233" + phone.slice(1)
      : "+233" + phone;

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete any existing tokens for this phone
    await db.verificationToken.deleteMany({
      where: { identifier: normalizedPhone },
    });

    // Create new token
    await db.verificationToken.create({
      data: {
        identifier: normalizedPhone,
        token: otp,
        expires: expiresAt,
      },
    });

    // In production, integrate with SMS provider (Hubtel, Arkesel, etc.)
    // For now, we'll log the OTP (development mode)
    console.log(`[DEV] OTP for ${normalizedPhone}: ${otp}`);

    // TODO: Integrate with SMS provider
    // await sendSMS(normalizedPhone, `Your Ghana Farmer verification code is: ${otp}`);

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
      // Only include OTP in development for testing
      ...(process.env.NODE_ENV === "development" && { otp }),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error("Error sending OTP:", error);
    return NextResponse.json(
      { error: "Failed to send OTP" },
      { status: 500 }
    );
  }
}
