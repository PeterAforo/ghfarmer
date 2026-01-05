import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { livestockEntrySchema } from "@/lib/validations/livestock";
import { z } from "zod";
import { generateLivestockTasks } from "@/lib/task-generator";
import { generateHealthRecords } from "@/lib/health-record-generator";
import { generateProductionRecords } from "@/lib/production-record-generator";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const farmId = searchParams.get("farmId");

    const livestockEntries = await db.livestockEntry.findMany({
      where: {
        userId: session.user.id,
        ...(farmId && { farmId }),
      },
      include: {
        livestock: true,
        breed: true,
        farm: {
          select: { id: true, name: true },
        },
        _count: {
          select: {
            healthRecords: true,
            productionRecords: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(livestockEntries);
  } catch (error) {
    console.error("Error fetching livestock entries:", error);
    return NextResponse.json(
      { error: "Failed to fetch livestock entries" },
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
    const validatedData = livestockEntrySchema.parse(body);

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

    // Find pen by name if location is provided
    let penId: string | undefined;
    if (validatedData.location) {
      const pen = await db.pen.findFirst({
        where: {
          name: validatedData.location,
          plot: {
            farmId: validatedData.farmId,
            userId: session.user.id,
          },
        },
      });
      
      if (pen) {
        penId = pen.id;
        
        // Check capacity before adding
        const availableSpace = (pen.calculatedCapacity || 0) - (pen.currentOccupancy || 0);
        if (validatedData.quantity > availableSpace) {
          return NextResponse.json(
            { error: `Pen capacity exceeded. Available space: ${availableSpace}, trying to add: ${validatedData.quantity}` },
            { status: 400 }
          );
        }
      }
    }

    // Use transaction to create livestock and update pen occupancy atomically
    const livestockEntry = await db.$transaction(async (tx) => {
      // Create the livestock entry
      const entry = await tx.livestockEntry.create({
        data: {
          userId: session.user.id,
          farmId: validatedData.farmId,
          livestockId: validatedData.livestockId,
          breedId: validatedData.breedId,
          penId: penId,
          tagNumber: validatedData.tagNumber,
          name: validatedData.name,
          batchId: validatedData.batchId,
          quantity: validatedData.quantity,
          gender: validatedData.gender,
          birthDate: validatedData.birthDate
            ? new Date(validatedData.birthDate)
            : undefined,
          acquiredDate: validatedData.acquiredDate
            ? new Date(validatedData.acquiredDate)
            : undefined,
          source: validatedData.source,
          costPerAnimal: validatedData.costPerAnimal,
          expectedSellingPrice: validatedData.expectedSellingPrice,
          status: validatedData.status,
          location: validatedData.location,
          notes: validatedData.notes,
        },
        include: {
          livestock: true,
          farm: { select: { id: true, name: true } },
        },
      });

      // Update pen occupancy if pen was found
      if (penId) {
        await tx.pen.update({
          where: { id: penId },
          data: {
            currentOccupancy: {
              increment: validatedData.quantity,
            },
          },
        });
      }

      return entry;
    });

    // Auto-generate tasks for the livestock entry
    let tasksGenerated = 0;
    let healthRecordsGenerated = 0;
    
    const startDate = validatedData.acquiredDate 
      ? new Date(validatedData.acquiredDate) 
      : new Date();

    try {
      tasksGenerated = await generateLivestockTasks({
        userId: session.user.id,
        livestockEntryId: livestockEntry.id,
        animalType: livestockEntry.livestock.englishName,
        animalName: validatedData.name || validatedData.batchId,
        quantity: validatedData.quantity,
        startDate,
        generateDaysAhead: 90, // Generate 90 days of tasks
      });
    } catch (taskError) {
      console.error("Error generating livestock tasks:", taskError);
      // Don't fail the request if task generation fails
    }

    // Auto-generate health records (vaccinations, deworming schedules)
    try {
      healthRecordsGenerated = await generateHealthRecords({
        livestockEntryId: livestockEntry.id,
        animalType: livestockEntry.livestock.englishName,
        startDate,
        generateDaysAhead: 365, // Generate 1 year of health records
      });
    } catch (healthError) {
      console.error("Error generating health records:", healthError);
      // Don't fail the request if health record generation fails
    }

    // Auto-generate production records (expected production milestones)
    let productionRecordsGenerated = 0;
    try {
      productionRecordsGenerated = await generateProductionRecords({
        livestockEntryId: livestockEntry.id,
        animalType: livestockEntry.livestock.englishName,
        quantity: validatedData.quantity,
        startDate,
        generateDaysAhead: 365, // Generate 1 year of production milestones
        userId: session.user.id, // Pass userId to use their custom prices
        expectedSellingPrice: validatedData.expectedSellingPrice, // Use user-defined selling price
      });
    } catch (productionError) {
      console.error("Error generating production records:", productionError);
      // Don't fail the request if production record generation fails
    }

    return NextResponse.json({
      ...livestockEntry,
      tasksGenerated,
      healthRecordsGenerated,
      productionRecordsGenerated,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error creating livestock entry:", error);
    return NextResponse.json(
      { error: "Failed to create livestock entry" },
      { status: 500 }
    );
  }
}
