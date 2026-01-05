import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

// GET - List all service providers (public) or filter by type/region
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const region = searchParams.get("region");
    const search = searchParams.get("search");

    const providers = await db.serviceProvider.findMany({
      where: {
        isActive: true,
        ...(type && { businessType: type as any }),
        ...(region && { region }),
        ...(search && {
          OR: [
            { businessName: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        }),
      },
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
        _count: {
          select: { services: true, products: true, reviews: true },
        },
      },
      orderBy: [
        { isVerified: "desc" },
        { rating: "desc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json(providers);
  } catch (error) {
    console.error("Error fetching service providers:", error);
    return NextResponse.json(
      { error: "Failed to fetch service providers" },
      { status: 500 }
    );
  }
}

const updateProviderSchema = z.object({
  businessName: z.string().min(2).optional(),
  description: z.string().optional(),
  specializations: z.array(z.string()).optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional().or(z.literal("")),
  address: z.string().optional(),
  region: z.string().optional(),
  district: z.string().optional(),
  serviceAreas: z.array(z.string()).optional(),
  licenseNumber: z.string().optional(),
  certifications: z.array(z.string()).optional(),
  yearsExperience: z.number().int().nonnegative().optional(),
  operatingHours: z.record(z.string(), z.string()).optional(),
  paymentMethods: z.array(z.string()).optional(),
  deliveryOptions: z.array(z.string()).optional(),
});

// PUT - Update own service provider profile
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateProviderSchema.parse(body);

    // Find user's service provider profile
    const provider = await db.serviceProvider.findUnique({
      where: { userId: session.user.id },
    });

    if (!provider) {
      return NextResponse.json(
        { error: "Service provider profile not found" },
        { status: 404 }
      );
    }

    const updatedProvider = await db.serviceProvider.update({
      where: { id: provider.id },
      data: {
        ...validatedData,
        website: validatedData.website || null,
      },
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    return NextResponse.json(updatedProvider);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating service provider:", error);
    return NextResponse.json(
      { error: "Failed to update service provider" },
      { status: 500 }
    );
  }
}
