// Mortality Records API
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const createMortalitySchema = z.object({
  livestockEntryId: z.string().min(1),
  farmId: z.string().optional(),
  deathDate: z.string(),
  quantity: z.number().int().min(1).default(1),
  cause: z.enum(["DISEASE", "PREDATOR", "ACCIDENT", "OLD_AGE", "WEATHER", "POISONING", "UNKNOWN", "OTHER"]),
  causeDetails: z.string().optional(),
  symptoms: z.string().optional(),
  estimatedLoss: z.number().min(0).optional(),
  disposalMethod: z.string().optional(),
  veterinarianConsulted: z.boolean().default(false),
  veterinarianNotes: z.string().optional(),
  notes: z.string().optional(),
  updateLivestockStatus: z.boolean().default(true),
});

// GET - List mortality records
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const farmId = searchParams.get("farmId");
    const cause = searchParams.get("cause");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const limit = parseInt(searchParams.get("limit") || "50");

    const where: any = { userId: session.user.id };

    if (farmId) where.farmId = farmId;
    if (cause) where.cause = cause;

    if (startDate || endDate) {
      where.deathDate = {};
      if (startDate) where.deathDate.gte = new Date(startDate);
      if (endDate) where.deathDate.lte = new Date(endDate);
    }

    const [records, total] = await Promise.all([
      db.mortalityRecord.findMany({
        where,
        orderBy: { deathDate: "desc" },
        take: limit,
        include: {
          livestockEntry: {
            select: {
              id: true,
              name: true,
              tagNumber: true,
              batchId: true,
              livestock: { select: { englishName: true } },
            },
          },
        },
      }),
      db.mortalityRecord.count({ where }),
    ]);

    // Summary by cause
    const byCause = await db.mortalityRecord.groupBy({
      by: ["cause"],
      where: { userId: session.user.id },
      _sum: { quantity: true, estimatedLoss: true },
      _count: true,
    });

    const summary = await db.mortalityRecord.aggregate({
      where: { userId: session.user.id },
      _sum: { quantity: true, estimatedLoss: true },
      _count: true,
    });

    return NextResponse.json({
      records,
      total,
      summary: {
        totalRecords: summary._count,
        totalDeaths: summary._sum.quantity || 0,
        totalLoss: summary._sum.estimatedLoss || 0,
        byCause: byCause.map(c => ({
          cause: c.cause,
          count: c._sum.quantity || 0,
          loss: c._sum.estimatedLoss || 0,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching mortality records:", error);
    return NextResponse.json(
      { error: "Failed to fetch mortality records" },
      { status: 500 }
    );
  }
}

// POST - Create mortality record
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createMortalitySchema.parse(body);

    // Get livestock entry
    const livestockEntry = await db.livestockEntry.findFirst({
      where: { id: validatedData.livestockEntryId, userId: session.user.id },
    });

    if (!livestockEntry) {
      return NextResponse.json({ error: "Livestock entry not found" }, { status: 404 });
    }

    // Create mortality record
    const record = await db.mortalityRecord.create({
      data: {
        userId: session.user.id,
        livestockEntryId: validatedData.livestockEntryId,
        farmId: validatedData.farmId || livestockEntry.farmId,
        deathDate: new Date(validatedData.deathDate),
        quantity: validatedData.quantity,
        cause: validatedData.cause,
        causeDetails: validatedData.causeDetails,
        symptoms: validatedData.symptoms,
        estimatedLoss: validatedData.estimatedLoss,
        disposalMethod: validatedData.disposalMethod,
        veterinarianConsulted: validatedData.veterinarianConsulted,
        veterinarianNotes: validatedData.veterinarianNotes,
        notes: validatedData.notes,
      },
      include: {
        livestockEntry: {
          select: { id: true, name: true, tagNumber: true },
        },
      },
    });

    // Update livestock entry status
    if (validatedData.updateLivestockStatus) {
      const newQuantity = Math.max(0, livestockEntry.quantity - validatedData.quantity);

      if (newQuantity === 0) {
        // All animals in this entry are deceased
        await db.livestockEntry.update({
          where: { id: validatedData.livestockEntryId },
          data: {
            status: "DECEASED",
            exitDate: new Date(validatedData.deathDate),
            exitReason: `Mortality - ${validatedData.cause}`,
            quantity: 0,
          },
        });
      } else {
        // Reduce quantity
        await db.livestockEntry.update({
          where: { id: validatedData.livestockEntryId },
          data: {
            quantity: newQuantity,
          },
        });
      }
    }

    // Create health record for tracking
    await db.healthRecord.create({
      data: {
        livestockEntryId: validatedData.livestockEntryId,
        type: "MORTALITY",
        status: "COMPLETED",
        date: new Date(validatedData.deathDate),
        completedDate: new Date(validatedData.deathDate),
        diagnosis: validatedData.cause,
        notes: `${validatedData.quantity} animal(s) deceased. Cause: ${validatedData.cause}. ${validatedData.causeDetails || ""}`,
        cost: validatedData.estimatedLoss,
      },
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating mortality record:", error);
    return NextResponse.json(
      { error: "Failed to create mortality record" },
      { status: 500 }
    );
  }
}
