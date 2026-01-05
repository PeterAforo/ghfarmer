import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/dse/recommendations/[id] - Get single recommendation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const recommendation = await db.recommendation.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        feedback: true,
      },
    });

    if (!recommendation) {
      return NextResponse.json({ error: "Recommendation not found" }, { status: 404 });
    }

    return NextResponse.json(recommendation);
  } catch (error) {
    console.error("Error getting recommendation:", error);
    return NextResponse.json({ error: "Failed to get recommendation" }, { status: 500 });
  }
}

// PATCH /api/dse/recommendations/[id] - Update recommendation status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!["ACTIVE", "DISMISSED", "COMPLETED", "SNOOZED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const recommendation = await db.recommendation.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!recommendation) {
      return NextResponse.json({ error: "Recommendation not found" }, { status: 404 });
    }

    const updated = await db.recommendation.update({
      where: { id },
      data: {
        status,
        ...(status === "DISMISSED" && { dismissedAt: new Date() }),
        ...(status === "COMPLETED" && { completedAt: new Date() }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating recommendation:", error);
    return NextResponse.json({ error: "Failed to update recommendation" }, { status: 500 });
  }
}
