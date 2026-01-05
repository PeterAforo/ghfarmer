import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

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

    const livestockEntry = await db.livestockEntry.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        livestock: true,
        breed: true,
        farm: {
          select: { id: true, name: true },
        },
        healthRecords: {
          orderBy: { date: "desc" },
          take: 10,
        },
        _count: {
          select: { healthRecords: true },
        },
      },
    });

    if (!livestockEntry) {
      return NextResponse.json({ error: "Livestock entry not found" }, { status: 404 });
    }

    return NextResponse.json(livestockEntry);
  } catch (error) {
    console.error("Error fetching livestock entry:", error);
    return NextResponse.json(
      { error: "Failed to fetch livestock entry" },
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

    const existingEntry = await db.livestockEntry.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingEntry) {
      return NextResponse.json({ error: "Livestock entry not found" }, { status: 404 });
    }

    const livestockEntry = await db.livestockEntry.update({
      where: { id },
      data: {
        ...body,
        dateAcquired: body.dateAcquired ? new Date(body.dateAcquired) : undefined,
      },
      include: {
        livestock: true,
        farm: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(livestockEntry);
  } catch (error) {
    console.error("Error updating livestock entry:", error);
    return NextResponse.json(
      { error: "Failed to update livestock entry" },
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

    const existingEntry = await db.livestockEntry.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingEntry) {
      return NextResponse.json({ error: "Livestock entry not found" }, { status: 404 });
    }

    // If the livestock was in a pen, decrement the pen's occupancy
    if (existingEntry.penId) {
      await db.pen.update({
        where: { id: existingEntry.penId },
        data: {
          currentOccupancy: {
            decrement: existingEntry.quantity,
          },
        },
      });
    }

    await db.livestockEntry.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Livestock entry deleted successfully" });
  } catch (error) {
    console.error("Error deleting livestock entry:", error);
    return NextResponse.json(
      { error: "Failed to delete livestock entry" },
      { status: 500 }
    );
  }
}
