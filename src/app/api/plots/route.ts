import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const plotSchema = z.object({
  farmId: z.string(),
  name: z.string().min(1, "Plot name is required"),
  description: z.string().optional(),
  size: z.number().positive("Size must be positive"),
  sizeUnit: z.enum(["HECTARES", "ACRES", "SQUARE_METERS"]).default("HECTARES"),
  usageType: z.enum(["CROP", "LIVESTOCK", "AQUACULTURE", "MIXED", "FALLOW", "STORAGE", "RESIDENTIAL"]),
  location: z.string().optional(),
  soilType: z.string().optional(),
  soilPh: z.number().optional(),
  irrigationType: z.string().optional(),
  status: z.enum(["AVAILABLE", "IN_USE", "FALLOW", "UNDER_PREPARATION"]).default("AVAILABLE"),
});

// GET /api/plots - Get all plots for user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const farmId = searchParams.get("farmId");

    const plots = await db.plot.findMany({
      where: {
        userId: session.user.id,
        ...(farmId && { farmId }),
      },
      include: {
        farm: {
          select: { id: true, name: true, size: true, sizeUnit: true },
        },
        pens: {
          select: {
            id: true,
            name: true,
            area: true,
            animalType: true,
            calculatedCapacity: true,
            currentOccupancy: true,
            status: true,
          },
        },
        cropAllocations: {
          select: {
            id: true,
            cropType: true,
            allocatedArea: true,
            areaUnit: true,
            calculatedCapacity: true,
            status: true,
          },
        },
        _count: {
          select: {
            pens: true,
            cropAllocations: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(plots);
  } catch (error) {
    console.error("Error fetching plots:", error);
    return NextResponse.json({ error: "Failed to fetch plots" }, { status: 500 });
  }
}

// POST /api/plots - Create a new plot
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = plotSchema.parse(body);

    // Verify farm belongs to user
    const farm = await db.farm.findFirst({
      where: { id: data.farmId, userId: session.user.id },
    });

    if (!farm) {
      return NextResponse.json({ error: "Farm not found" }, { status: 404 });
    }

    const plot = await db.plot.create({
      data: {
        userId: session.user.id,
        farmId: data.farmId,
        name: data.name,
        description: data.description,
        size: data.size,
        sizeUnit: data.sizeUnit,
        usageType: data.usageType,
        location: data.location,
        soilType: data.soilType,
        soilPh: data.soilPh,
        irrigationType: data.irrigationType,
        status: data.status,
      },
      include: {
        farm: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json(plot, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error("Error creating plot:", error);
    return NextResponse.json({ error: "Failed to create plot" }, { status: 500 });
  }
}
