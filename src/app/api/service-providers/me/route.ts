import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET - Get current user's service provider profile
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const provider = await db.serviceProvider.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: { id: true, name: true, image: true, accountType: true },
        },
        services: {
          where: { status: "ACTIVE" },
          orderBy: { createdAt: "desc" },
        },
        products: {
          where: { status: "ACTIVE" },
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: { services: true, products: true, reviews: true, bookings: true },
        },
      },
    });

    if (!provider) {
      return NextResponse.json(
        { error: "Service provider profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      provider,
      services: provider.services,
      products: provider.products,
    });
  } catch (error) {
    console.error("Error fetching provider profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch provider profile" },
      { status: 500 }
    );
  }
}
