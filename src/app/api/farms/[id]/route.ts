import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { farmSchema } from "@/lib/validations/farm";
import { z } from "zod";

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

    const farm = await db.farm.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        crops: {
          include: {
            crop: true,
          },
          take: 10,
          orderBy: { createdAt: "desc" },
        },
        livestock: {
          include: {
            livestock: true,
          },
          take: 10,
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: {
            crops: true,
            livestock: true,
          },
        },
      },
    });

    if (!farm) {
      return NextResponse.json({ error: "Farm not found" }, { status: 404 });
    }

    return NextResponse.json(farm);
  } catch (error) {
    console.error("Error fetching farm:", error);
    return NextResponse.json(
      { error: "Failed to fetch farm" },
      { status: 500 }
    );
  }
}

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
    const validatedData = farmSchema.partial().parse(body);

    const existingFarm = await db.farm.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingFarm) {
      return NextResponse.json({ error: "Farm not found" }, { status: 404 });
    }

    const farm = await db.farm.update({
      where: { id },
      data: validatedData,
    });

    return NextResponse.json(farm);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error updating farm:", error);
    return NextResponse.json(
      { error: "Failed to update farm" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existingFarm = await db.farm.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingFarm) {
      return NextResponse.json({ error: "Farm not found" }, { status: 404 });
    }

    await db.farm.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Farm deleted successfully" });
  } catch (error) {
    console.error("Error deleting farm:", error);
    return NextResponse.json(
      { error: "Failed to delete farm" },
      { status: 500 }
    );
  }
}
