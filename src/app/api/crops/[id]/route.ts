import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
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

    const cropEntry = await db.cropEntry.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        crop: true,
        variety: true,
        farm: {
          select: { id: true, name: true },
        },
        activities: {
          orderBy: { date: "desc" },
          take: 20,
        },
        _count: {
          select: { activities: true },
        },
      },
    });

    if (!cropEntry) {
      return NextResponse.json({ error: "Crop entry not found" }, { status: 404 });
    }

    return NextResponse.json(cropEntry);
  } catch (error) {
    console.error("Error fetching crop entry:", error);
    return NextResponse.json(
      { error: "Failed to fetch crop entry" },
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

    const existingEntry = await db.cropEntry.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingEntry) {
      return NextResponse.json({ error: "Crop entry not found" }, { status: 404 });
    }

    const cropEntry = await db.cropEntry.update({
      where: { id },
      data: {
        ...body,
        plantingDate: body.plantingDate ? new Date(body.plantingDate) : undefined,
        expectedHarvestDate: body.expectedHarvestDate ? new Date(body.expectedHarvestDate) : undefined,
        actualHarvestDate: body.actualHarvestDate ? new Date(body.actualHarvestDate) : undefined,
      },
      include: {
        crop: true,
        farm: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(cropEntry);
  } catch (error) {
    console.error("Error updating crop entry:", error);
    return NextResponse.json(
      { error: "Failed to update crop entry" },
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

    const existingEntry = await db.cropEntry.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingEntry) {
      return NextResponse.json({ error: "Crop entry not found" }, { status: 404 });
    }

    await db.cropEntry.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Crop entry deleted successfully" });
  } catch (error) {
    console.error("Error deleting crop entry:", error);
    return NextResponse.json(
      { error: "Failed to delete crop entry" },
      { status: 500 }
    );
  }
}
