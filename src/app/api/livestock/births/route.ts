// Birth Records API
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const createBirthSchema = z.object({
  farmId: z.string().min(1),
  damId: z.string().min(1),
  sireId: z.string().optional(),
  birthDate: z.string(),
  offspringCount: z.number().int().min(1).default(1),
  maleCount: z.number().int().min(0).default(0),
  femaleCount: z.number().int().min(0).default(0),
  birthWeight: z.number().min(0).optional(),
  healthStatus: z.enum(["HEALTHY", "WEAK", "STILLBORN"]).optional(),
  complications: z.string().optional(),
  notes: z.string().optional(),
  createOffspring: z.boolean().default(false),
});

// GET - List birth records
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const farmId = searchParams.get("farmId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const limit = parseInt(searchParams.get("limit") || "50");

    const where: any = { userId: session.user.id };

    if (farmId) where.farmId = farmId;

    if (startDate || endDate) {
      where.birthDate = {};
      if (startDate) where.birthDate.gte = new Date(startDate);
      if (endDate) where.birthDate.lte = new Date(endDate);
    }

    const [births, total] = await Promise.all([
      db.birthRecord.findMany({
        where,
        orderBy: { birthDate: "desc" },
        take: limit,
        include: {
          dam: {
            select: {
              id: true,
              name: true,
              tagNumber: true,
              livestock: { select: { englishName: true } },
            },
          },
          sire: {
            select: {
              id: true,
              name: true,
              tagNumber: true,
            },
          },
        },
      }),
      db.birthRecord.count({ where }),
    ]);

    // Summary
    const summary = await db.birthRecord.aggregate({
      where: { userId: session.user.id },
      _sum: { offspringCount: true, maleCount: true, femaleCount: true },
      _count: true,
    });

    return NextResponse.json({
      births,
      total,
      summary: {
        totalBirths: summary._count,
        totalOffspring: summary._sum.offspringCount || 0,
        maleOffspring: summary._sum.maleCount || 0,
        femaleOffspring: summary._sum.femaleCount || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching births:", error);
    return NextResponse.json(
      { error: "Failed to fetch birth records" },
      { status: 500 }
    );
  }
}

// POST - Create birth record
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createBirthSchema.parse(body);

    // Get dam info for offspring creation
    const dam = await db.livestockEntry.findFirst({
      where: { id: validatedData.damId, userId: session.user.id },
      include: { livestock: true, breed: true },
    });

    if (!dam) {
      return NextResponse.json({ error: "Dam not found" }, { status: 404 });
    }

    // Create birth record
    const birth = await db.birthRecord.create({
      data: {
        userId: session.user.id,
        farmId: validatedData.farmId,
        damId: validatedData.damId,
        sireId: validatedData.sireId,
        birthDate: new Date(validatedData.birthDate),
        offspringCount: validatedData.offspringCount,
        maleCount: validatedData.maleCount,
        femaleCount: validatedData.femaleCount,
        birthWeight: validatedData.birthWeight,
        healthStatus: validatedData.healthStatus,
        complications: validatedData.complications,
        notes: validatedData.notes,
        offspringCreated: validatedData.createOffspring,
      },
      include: {
        dam: {
          select: { id: true, name: true, tagNumber: true },
        },
      },
    });

    // Create offspring entries if requested
    if (validatedData.createOffspring && validatedData.healthStatus !== "STILLBORN") {
      const offspringEntries = [];

      for (let i = 0; i < validatedData.maleCount; i++) {
        offspringEntries.push({
          userId: session.user.id,
          farmId: validatedData.farmId,
          livestockId: dam.livestockId,
          breedId: dam.breedId,
          gender: "MALE" as const,
          birthDate: new Date(validatedData.birthDate),
          source: "BORN_ON_FARM" as const,
          status: "ACTIVE" as const,
          notes: `Born from ${dam.name || dam.tagNumber || "Dam"} - Birth record #${birth.id}`,
        });
      }

      for (let i = 0; i < validatedData.femaleCount; i++) {
        offspringEntries.push({
          userId: session.user.id,
          farmId: validatedData.farmId,
          livestockId: dam.livestockId,
          breedId: dam.breedId,
          gender: "FEMALE" as const,
          birthDate: new Date(validatedData.birthDate),
          source: "BORN_ON_FARM" as const,
          status: "ACTIVE" as const,
          notes: `Born from ${dam.name || dam.tagNumber || "Dam"} - Birth record #${birth.id}`,
        });
      }

      // Handle unknown gender
      const unknownCount = validatedData.offspringCount - validatedData.maleCount - validatedData.femaleCount;
      for (let i = 0; i < unknownCount; i++) {
        offspringEntries.push({
          userId: session.user.id,
          farmId: validatedData.farmId,
          livestockId: dam.livestockId,
          breedId: dam.breedId,
          gender: "UNKNOWN" as const,
          birthDate: new Date(validatedData.birthDate),
          source: "BORN_ON_FARM" as const,
          status: "ACTIVE" as const,
          notes: `Born from ${dam.name || dam.tagNumber || "Dam"} - Birth record #${birth.id}`,
        });
      }

      if (offspringEntries.length > 0) {
        await db.livestockEntry.createMany({ data: offspringEntries });
      }
    }

    // Update breeding record if exists
    await db.breedingRecord.updateMany({
      where: {
        livestockEntryId: validatedData.damId,
        actualBirthDate: null,
      },
      data: {
        actualBirthDate: new Date(validatedData.birthDate),
        offspringCount: validatedData.offspringCount,
      },
    });

    return NextResponse.json(birth, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating birth record:", error);
    return NextResponse.json(
      { error: "Failed to create birth record" },
      { status: 500 }
    );
  }
}
