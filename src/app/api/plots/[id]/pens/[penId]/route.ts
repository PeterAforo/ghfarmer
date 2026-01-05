import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { calculateLivestockCapacity, calculatePenArea } from "@/lib/capacity-calculator";

const penUpdateSchema = z.object({
  name: z.string().min(1, "Pen name is required").optional(),
  penType: z.string().min(1, "Pen type is required").optional(),
  length: z.number().positive().optional().nullable(),
  width: z.number().positive().optional().nullable(),
  area: z.number().positive().optional().nullable(),
  animalType: z.string().optional().nullable(),
  actualCapacity: z.number().int().positive().optional().nullable(),
  hasRoof: z.boolean().optional(),
  hasFeeder: z.boolean().optional(),
  hasWaterer: z.boolean().optional(),
  ventilationType: z.string().optional().nullable(),
  floorType: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

// GET /api/plots/[id]/pens/[penId] - Get a specific pen
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; penId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: plotId, penId } = await params;
    const { searchParams } = new URL(request.url);
    const recalculate = searchParams.get("recalculate") === "true";

    // Verify plot belongs to user
    const plot = await db.plot.findFirst({
      where: { id: plotId, userId: session.user.id },
    });

    if (!plot) {
      return NextResponse.json({ error: "Plot not found" }, { status: 404 });
    }

    const pen = await db.pen.findFirst({
      where: { id: penId, plotId },
      include: {
        livestockEntries: {
          select: { id: true, quantity: true, name: true, status: true },
        },
        _count: {
          select: { livestockEntries: true },
        },
      },
    });

    if (!pen) {
      return NextResponse.json({ error: "Pen not found" }, { status: 404 });
    }

    // Recalculate occupancy if requested or if there's a mismatch
    const actualOccupancy = pen.livestockEntries
      .filter(entry => entry.status === "ACTIVE")
      .reduce((sum, entry) => sum + entry.quantity, 0);
    
    if (recalculate || pen.currentOccupancy !== actualOccupancy) {
      await db.pen.update({
        where: { id: penId },
        data: { currentOccupancy: actualOccupancy },
      });
      pen.currentOccupancy = actualOccupancy;
    }

    return NextResponse.json(pen);
  } catch (error) {
    console.error("Error fetching pen:", error);
    return NextResponse.json({ error: "Failed to fetch pen" }, { status: 500 });
  }
}

// PATCH /api/plots/[id]/pens/[penId] - Update a pen
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; penId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: plotId, penId } = await params;
    const body = await request.json();
    const data = penUpdateSchema.parse(body);

    // Verify plot belongs to user
    const plot = await db.plot.findFirst({
      where: { id: plotId, userId: session.user.id },
    });

    if (!plot) {
      return NextResponse.json({ error: "Plot not found" }, { status: 404 });
    }

    // Verify pen exists
    const existingPen = await db.pen.findFirst({
      where: { id: penId, plotId },
    });

    if (!existingPen) {
      return NextResponse.json({ error: "Pen not found" }, { status: 404 });
    }

    // Calculate area if dimensions provided
    let penArea = data.area;
    if (data.length && data.width && !penArea) {
      penArea = calculatePenArea(data.length, data.width);
    }

    // Calculate capacity if animal type and area provided
    let calculatedCapacity: number | undefined;
    const animalType = data.animalType ?? existingPen.animalType;
    const finalArea = penArea ?? existingPen.area;
    const penType = data.penType ?? existingPen.penType;
    
    if (animalType && finalArea) {
      const capacityResult = calculateLivestockCapacity(animalType, finalArea, penType);
      calculatedCapacity = capacityResult.capacity;
    }

    const pen = await db.pen.update({
      where: { id: penId },
      data: {
        ...data,
        area: penArea,
        calculatedCapacity,
      },
    });

    return NextResponse.json(pen);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error("Error updating pen:", error);
    return NextResponse.json({ error: "Failed to update pen" }, { status: 500 });
  }
}

// DELETE /api/plots/[id]/pens/[penId] - Delete a pen
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; penId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: plotId, penId } = await params;

    // Verify plot belongs to user
    const plot = await db.plot.findFirst({
      where: { id: plotId, userId: session.user.id },
    });

    if (!plot) {
      return NextResponse.json({ error: "Plot not found" }, { status: 404 });
    }

    // Verify pen exists
    const existingPen = await db.pen.findFirst({
      where: { id: penId, plotId },
    });

    if (!existingPen) {
      return NextResponse.json({ error: "Pen not found" }, { status: 404 });
    }

    await db.pen.delete({
      where: { id: penId },
    });

    return NextResponse.json({ message: "Pen deleted successfully" });
  } catch (error) {
    console.error("Error deleting pen:", error);
    return NextResponse.json({ error: "Failed to delete pen" }, { status: 500 });
  }
}
