import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { calculateCropCapacity } from "@/lib/capacity-calculator";

const allocationSchema = z.object({
  cropType: z.string().min(1, "Crop type is required"),
  allocatedArea: z.number().positive("Area must be positive"),
  areaUnit: z.enum(["HECTARES", "ACRES", "SQUARE_METERS"]).default("HECTARES"),
  plantSpacing: z.number().positive().optional(),
  rowSpacing: z.number().positive().optional(),
  plannedPlantingDate: z.string().optional(),
  notes: z.string().optional(),
  // New fields for seed/planting material
  seedQuantity: z.number().positive().optional(),
  seedUnit: z.string().optional(),
  seedCostPerUnit: z.number().min(0).optional(),
});

// GET /api/plots/[id]/allocations - Get all crop allocations for a plot
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

    const allocations = await db.cropPlotAllocation.findMany({
      where: { plotId },
      include: {
        cropEntry: {
          select: { id: true, status: true, plantingDate: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(allocations);
  } catch (error) {
    console.error("Error fetching allocations:", error);
    return NextResponse.json({ error: "Failed to fetch allocations" }, { status: 500 });
  }
}

// POST /api/plots/[id]/allocations - Create a new crop allocation
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
    const data = allocationSchema.parse(body);

    // Verify plot belongs to user
    const plot = await db.plot.findFirst({
      where: { id: plotId, userId: session.user.id },
    });

    if (!plot) {
      return NextResponse.json({ error: "Plot not found" }, { status: 404 });
    }

    // Calculate capacity
    const capacityResult = calculateCropCapacity(
      data.cropType,
      data.allocatedArea,
      data.areaUnit,
      data.plantSpacing,
      data.rowSpacing
    );

    // Calculate expected harvest date and total seed cost
    const daysToMaturity = capacityResult.spacingInfo?.daysToMaturity || 90;
    const plantingMaterial = capacityResult.spacingInfo?.plantingMaterial || "seeds";
    const plannedDate = data.plannedPlantingDate ? new Date(data.plannedPlantingDate) : null;
    const expectedHarvestDate = plannedDate 
      ? new Date(plannedDate.getTime() + daysToMaturity * 24 * 60 * 60 * 1000) 
      : null;
    const totalSeedCost = (data.seedQuantity && data.seedCostPerUnit) 
      ? data.seedQuantity * data.seedCostPerUnit 
      : null;

    const allocation = await db.cropPlotAllocation.create({
      data: {
        plotId,
        cropType: data.cropType,
        allocatedArea: data.allocatedArea,
        areaUnit: data.areaUnit,
        plantSpacing: data.plantSpacing || capacityResult.spacingInfo?.plantSpacing,
        rowSpacing: data.rowSpacing || capacityResult.spacingInfo?.rowSpacing,
        calculatedCapacity: capacityResult.capacity,
        plannedPlantingDate: plannedDate,
        expectedHarvestDate,
        daysToMaturity,
        plantingMaterial,
        seedQuantity: data.seedQuantity,
        seedUnit: data.seedUnit,
        seedCostPerUnit: data.seedCostPerUnit,
        totalSeedCost,
        notes: data.notes,
      },
    });

    return NextResponse.json({
      ...allocation,
      capacityInfo: capacityResult,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error("Error creating allocation:", error);
    return NextResponse.json({ error: "Failed to create allocation" }, { status: 500 });
  }
}
