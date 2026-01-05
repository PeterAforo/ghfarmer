import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const createPondSchema = z.object({
  farmId: z.string().min(1, "Farm is required"),
  name: z.string().min(1, "Pond name is required"),
  size: z.number().positive("Size must be positive").optional(),
  sizeUnit: z.string().optional(),
  species: z.string().optional(),
  stockingDate: z.string().optional(),
  stockingDensity: z.number().positive().optional(),
  initialCount: z.number().int().positive().optional(),
  expectedPricePerKg: z.number().nonnegative().optional(),
  status: z.enum(["ACTIVE", "FALLOW", "HARVESTING", "PREPARING"]).default("ACTIVE"),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const farmId = searchParams.get("farmId");

    // Get user's farms first
    const userFarms = await db.farm.findMany({
      where: { userId: session.user.id },
      select: { id: true },
    });
    const farmIds = userFarms.map((f) => f.id);

    const ponds = await db.pondEntry.findMany({
      where: {
        farmId: farmId ? farmId : { in: farmIds },
      },
      include: {
        farm: {
          select: { id: true, name: true },
        },
        waterQuality: {
          take: 1,
          orderBy: { date: "desc" },
        },
        harvests: {
          take: 3,
          orderBy: { date: "desc" },
        },
        _count: {
          select: {
            waterQuality: true,
            harvests: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Map to expected format
    const mappedPonds = ponds.map((pond) => ({
      id: pond.id,
      name: pond.name,
      type: "EARTHEN", // Default since schema doesn't have type
      size: pond.size || 0,
      sizeUnit: pond.sizeUnit || "SQUARE_METERS",
      species: pond.fishSpecies,
      status: pond.status,
      stockingDate: pond.stockingDate,
      stockingDensity: pond.stockingDensity,
      initialCount: null,
      farm: pond.farm,
      waterQualityRecords: pond.waterQuality.map((wq) => ({
        id: wq.id,
        ph: wq.ph,
        temperature: wq.temperature,
        dissolvedOxygen: wq.dissolvedOxygen,
        recordedAt: wq.date,
      })),
      _count: {
        waterQualityRecords: pond._count.waterQuality,
        harvests: pond._count.harvests,
      },
    }));

    return NextResponse.json(mappedPonds);
  } catch (error) {
    console.error("Error fetching ponds:", error);
    return NextResponse.json(
      { error: "Failed to fetch ponds" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createPondSchema.parse(body);

    // Verify farm ownership
    const farm = await db.farm.findFirst({
      where: {
        id: validatedData.farmId,
        userId: session.user.id,
      },
    });

    if (!farm) {
      return NextResponse.json(
        { error: "Farm not found or access denied" },
        { status: 404 }
      );
    }

    const pond = await db.pondEntry.create({
      data: {
        farmId: validatedData.farmId,
        name: validatedData.name,
        size: validatedData.size,
        sizeUnit: validatedData.sizeUnit,
        fishSpecies: validatedData.species,
        stockingDate: validatedData.stockingDate
          ? new Date(validatedData.stockingDate)
          : undefined,
        stockingCount: validatedData.initialCount,
        stockingDensity: validatedData.stockingDensity,
        expectedPricePerKg: validatedData.expectedPricePerKg,
        status: validatedData.status as any,
        notes: validatedData.notes,
      },
      include: {
        farm: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json(pond, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error("Error creating pond:", error);
    return NextResponse.json(
      { error: "Failed to create pond" },
      { status: 500 }
    );
  }
}
