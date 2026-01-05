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

    const pondEntry = await db.pondEntry.findFirst({
      where: {
        id,
        farm: { userId: session.user.id },
      },
      include: {
        farm: {
          select: { id: true, name: true },
        },
      },
    });

    if (!pondEntry) {
      return NextResponse.json({ error: "Pond not found" }, { status: 404 });
    }

    return NextResponse.json(pondEntry);
  } catch (error) {
    console.error("Error fetching pond:", error);
    return NextResponse.json({ error: "Failed to fetch pond" }, { status: 500 });
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

    const existing = await db.pondEntry.findFirst({
      where: { id, farm: { userId: session.user.id } },
    });

    if (!existing) {
      return NextResponse.json({ error: "Pond not found" }, { status: 404 });
    }

    const pondEntry = await db.pondEntry.update({
      where: { id },
      data: {
        name: body.name,
        size: body.size,
        sizeUnit: body.sizeUnit,
        fishSpecies: body.fishSpecies,
        stockingDensity: body.stockingDensity,
        status: body.status,
        notes: body.notes,
      },
      include: {
        farm: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(pondEntry);
  } catch (error) {
    console.error("Error updating pond:", error);
    return NextResponse.json({ error: "Failed to update pond" }, { status: 500 });
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

    const existing = await db.pondEntry.findFirst({
      where: { id, farm: { userId: session.user.id } },
    });

    if (!existing) {
      return NextResponse.json({ error: "Pond not found" }, { status: 404 });
    }

    await db.pondEntry.delete({ where: { id } });

    return NextResponse.json({ message: "Pond deleted successfully" });
  } catch (error) {
    console.error("Error deleting pond:", error);
    return NextResponse.json({ error: "Failed to delete pond" }, { status: 500 });
  }
}
