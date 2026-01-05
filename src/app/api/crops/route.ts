import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { cropEntrySchema } from "@/lib/validations/crop";
import { z } from "zod";
import { generateCropTasks } from "@/lib/task-generator";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const farmId = searchParams.get("farmId");

    const cropEntries = await db.cropEntry.findMany({
      where: {
        userId: session.user.id,
        ...(farmId && { farmId }),
      },
      include: {
        crop: true,
        variety: true,
        farm: {
          select: { id: true, name: true },
        },
        _count: {
          select: { activities: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(cropEntries);
  } catch (error) {
    console.error("Error fetching crop entries:", error);
    return NextResponse.json(
      { error: "Failed to fetch crop entries" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = cropEntrySchema.parse(body);

    // Verify farm belongs to user
    const farm = await db.farm.findFirst({
      where: {
        id: validatedData.farmId,
        userId: session.user.id,
      },
    });

    if (!farm) {
      return NextResponse.json({ error: "Farm not found" }, { status: 404 });
    }

    const cropEntry = await db.cropEntry.create({
      data: {
        userId: session.user.id,
        farmId: validatedData.farmId,
        cropId: validatedData.cropId,
        varietyId: validatedData.varietyId,
        plotName: validatedData.plotName,
        landArea: validatedData.landArea,
        landAreaUnit: validatedData.landAreaUnit,
        plantingDate: validatedData.plantingDate
          ? new Date(validatedData.plantingDate)
          : undefined,
        expectedHarvestDate: validatedData.expectedHarvestDate
          ? new Date(validatedData.expectedHarvestDate)
          : undefined,
        seedQuantity: validatedData.seedQuantity,
        seedUnit: validatedData.seedUnit,
        seedCostPerUnit: validatedData.seedCostPerUnit,
        totalSeedCost: validatedData.totalSeedCost,
        calculatedCapacity: validatedData.calculatedCapacity,
        expectedPricePerUnit: validatedData.expectedPricePerUnit,
        status: validatedData.status,
        notes: validatedData.notes,
      },
      include: {
        crop: true,
        farm: { select: { id: true, name: true } },
      },
    });

    // Auto-generate tasks for the crop entry if planting date is provided
    let tasksGenerated = 0;
    if (validatedData.plantingDate) {
      try {
        tasksGenerated = await generateCropTasks({
          userId: session.user.id,
          cropEntryId: cropEntry.id,
          cropName: cropEntry.crop.englishName,
          plotName: validatedData.plotName,
          plantingDate: new Date(validatedData.plantingDate),
          expectedHarvestDate: validatedData.expectedHarvestDate 
            ? new Date(validatedData.expectedHarvestDate) 
            : undefined,
        });
      } catch (taskError) {
        console.error("Error generating crop tasks:", taskError);
        // Don't fail the request if task generation fails
      }
    }

    return NextResponse.json({
      ...cropEntry,
      tasksGenerated,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error creating crop entry:", error);
    return NextResponse.json(
      { error: "Failed to create crop entry" },
      { status: 500 }
    );
  }
}
