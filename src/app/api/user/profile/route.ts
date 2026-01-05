import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  farmerType: z.enum(["SMALLHOLDER", "COMMERCIAL", "COOPERATIVE"]).optional(),
  language: z.enum(["ENGLISH", "TWI", "GA", "EWE", "HAUSA", "DAGBANI"]).optional(),
  region: z.string().optional(),
  district: z.string().optional(),
  community: z.string().optional(),
  currency: z.string().optional(),
  units: z.enum(["METRIC", "IMPERIAL"]).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        image: true,
        farmerType: true,
        language: true,
        region: true,
        district: true,
        community: true,
        currency: true,
        units: true,
        createdAt: true,
        _count: {
          select: {
            farms: true,
            crops: true,
            livestock: true,
            tasks: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateProfileSchema.parse(body);

    const user = await db.user.update({
      where: { id: session.user.id },
      data: {
        ...(validatedData.name && { name: validatedData.name }),
        ...(validatedData.phone !== undefined && { phone: validatedData.phone }),
        ...(validatedData.farmerType && { farmerType: validatedData.farmerType as any }),
        ...(validatedData.language && { language: validatedData.language as any }),
        ...(validatedData.region !== undefined && { region: validatedData.region }),
        ...(validatedData.district !== undefined && { district: validatedData.district }),
        ...(validatedData.community !== undefined && { community: validatedData.community }),
        ...(validatedData.currency && { currency: validatedData.currency }),
        ...(validatedData.units && { units: validatedData.units as any }),
      },
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        farmerType: true,
        language: true,
        region: true,
        district: true,
        community: true,
        currency: true,
        units: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
