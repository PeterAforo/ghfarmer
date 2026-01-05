import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { calculateLivestockCapacity, calculatePenArea } from "@/lib/capacity-calculator";

const penSchema = z.object({
  name: z.string().min(1, "Pen name is required"),
  penType: z.string().min(1, "Pen type is required"),
  length: z.number().positive().optional(),
  width: z.number().positive().optional(),
  area: z.number().positive().optional(),
  animalType: z.string().optional(),
  actualCapacity: z.number().int().positive().optional(),
  hasRoof: z.boolean().default(true),
  hasFeeder: z.boolean().default(false),
  hasWaterer: z.boolean().default(false),
  ventilationType: z.string().optional(),
  floorType: z.string().optional(),
  notes: z.string().optional(),
});

// GET /api/plots/[id]/pens - Get all pens for a plot
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: plotId } = await params;

    // Verify plot belongs to user
    const plot = await db.plot.findFirst({
      where: { id: plotId, userId: session.user.id },
    });

    if (!plot) {
      return NextResponse.json({ error: "Plot not found" }, { status: 404 });
    }

    const pens = await db.pen.findMany({
      where: { plotId },
      include: {
        livestockEntries: {
          select: { id: true, quantity: true, name: true, status: true },
        },
        _count: {
          select: { livestockEntries: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Recalculate occupancy for each pen based on actual ACTIVE livestock entries
    const pensWithCorrectOccupancy = await Promise.all(
      pens.map(async (pen) => {
        const actualOccupancy = pen.livestockEntries
          .filter((entry: { status: string }) => entry.status === "ACTIVE")
          .reduce((sum: number, entry: { quantity: number }) => sum + entry.quantity, 0);
        
        // Update if there's a mismatch
        if (pen.currentOccupancy !== actualOccupancy) {
          await db.pen.update({
            where: { id: pen.id },
            data: { currentOccupancy: actualOccupancy },
          });
          return { ...pen, currentOccupancy: actualOccupancy };
        }
        return pen;
      })
    );

    return NextResponse.json(pensWithCorrectOccupancy);
  } catch (error) {
    console.error("Error fetching pens:", error);
    return NextResponse.json({ error: "Failed to fetch pens" }, { status: 500 });
  }
}

// POST /api/plots/[id]/pens - Create a new pen
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: plotId } = await params;
    const body = await request.json();
    const data = penSchema.parse(body);

    // Verify plot belongs to user
    const plot = await db.plot.findFirst({
      where: { id: plotId, userId: session.user.id },
    });

    if (!plot) {
      return NextResponse.json({ error: "Plot not found" }, { status: 404 });
    }

    // Calculate area if dimensions provided
    let penArea = data.area;
    if (data.length && data.width && !penArea) {
      penArea = calculatePenArea(data.length, data.width);
    }

    // Calculate capacity if animal type and area provided (now includes pen type)
    let calculatedCapacity: number | undefined;
    if (data.animalType && penArea) {
      const capacityResult = calculateLivestockCapacity(data.animalType, penArea, data.penType);
      calculatedCapacity = capacityResult.capacity;
    }

    const pen = await db.pen.create({
      data: {
        plotId,
        name: data.name,
        penType: data.penType,
        length: data.length,
        width: data.width,
        area: penArea,
        animalType: data.animalType,
        calculatedCapacity,
        actualCapacity: data.actualCapacity,
        hasRoof: data.hasRoof,
        hasFeeder: data.hasFeeder,
        hasWaterer: data.hasWaterer,
        ventilationType: data.ventilationType,
        floorType: data.floorType,
        notes: data.notes,
      },
    });

    return NextResponse.json(pen, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error("Error creating pen:", error);
    return NextResponse.json({ error: "Failed to create pen" }, { status: 500 });
  }
}
