import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET - Get a specific service provider's profile
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const provider = await db.serviceProvider.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
        services: {
          where: { status: "ACTIVE" },
          orderBy: { createdAt: "desc" },
        },
        products: {
          where: { status: "ACTIVE" },
          orderBy: { createdAt: "desc" },
        },
        reviews: {
          include: {
            provider: {
              select: { businessName: true },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        _count: {
          select: { services: true, products: true, reviews: true, bookings: true },
        },
      },
    });

    if (!provider) {
      return NextResponse.json(
        { error: "Service provider not found" },
        { status: 404 }
      );
    }

    // Increment view count could be added here

    return NextResponse.json(provider);
  } catch (error) {
    console.error("Error fetching service provider:", error);
    return NextResponse.json(
      { error: "Failed to fetch service provider" },
      { status: 500 }
    );
  }
}
