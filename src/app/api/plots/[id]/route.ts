import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const updatePlotSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  size: z.number().positive().optional(),
  sizeUnit: z.enum(["HECTARES", "ACRES", "SQUARE_METERS"]).optional(),
  usageType: z.enum(["CROP", "LIVESTOCK", "AQUACULTURE", "MIXED", "FALLOW", "STORAGE", "RESIDENTIAL"]).optional(),
  location: z.string().optional(),
  soilType: z.string().optional(),
  soilPh: z.number().optional(),
  irrigationType: z.string().optional(),
  status: z.enum(["AVAILABLE", "IN_USE", "FALLOW", "UNDER_PREPARATION"]).optional(),
});

// GET /api/plots/[id] - Get single plot
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

    const plot = await db.plot.findFirst({
      where: { id, userId: session.user.id },
      include: {
        farm: {
          select: { id: true, name: true, size: true, sizeUnit: true },
        },
        pens: {
          select: {
            id: true,
            name: true,
            penType: true,
            length: true,
            width: true,
            area: true,
            animalType: true,
            calculatedCapacity: true,
            actualCapacity: true,
            currentOccupancy: true,
            status: true,
            livestockEntries: {
              select: { id: true, quantity: true, status: true },
            },
          },
        },
        cropAllocations: {
          include: {
            cropEntry: {
              select: { id: true, status: true },
            },
          },
        },
      },
    });

    if (!plot) {
      return NextResponse.json({ error: "Plot not found" }, { status: 404 });
    }

    // Recalculate pen occupancy based on actual ACTIVE livestock entries
    for (const pen of plot.pens) {
      const actualOccupancy = pen.livestockEntries
        .filter((entry: { status: string }) => entry.status === "ACTIVE")
        .reduce((sum: number, entry: { quantity: number }) => sum + entry.quantity, 0);
      
      if (pen.currentOccupancy !== actualOccupancy) {
        await db.pen.update({
          where: { id: pen.id },
          data: { currentOccupancy: actualOccupancy },
        });
        pen.currentOccupancy = actualOccupancy;
      }
    }

    return NextResponse.json(plot);
  } catch (error) {
    console.error("Error fetching plot:", error);
    return NextResponse.json({ error: "Failed to fetch plot" }, { status: 500 });
  }
}

// PATCH /api/plots/[id] - Update plot
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
    const data = updatePlotSchema.parse(body);

    const plot = await db.plot.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!plot) {
      return NextResponse.json({ error: "Plot not found" }, { status: 404 });
    }

    const updated = await db.plot.update({
      where: { id },
      data,
      include: {
        farm: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error("Error updating plot:", error);
    return NextResponse.json({ error: "Failed to update plot" }, { status: 500 });
  }
}

// DELETE /api/plots/[id] - Delete plot
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

    const plot = await db.plot.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!plot) {
      return NextResponse.json({ error: "Plot not found" }, { status: 404 });
    }

    await db.plot.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting plot:", error);
    return NextResponse.json({ error: "Failed to delete plot" }, { status: 500 });
  }
}
