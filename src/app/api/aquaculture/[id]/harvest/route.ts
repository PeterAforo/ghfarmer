import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const harvestSchema = z.object({
  date: z.string(),
  quantity: z.number(),
  quantityUnit: z.string(),
  averageWeight: z.number().optional(),
  totalWeight: z.number().optional(),
  isPartial: z.boolean().optional(),
  notes: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: pondId } = await params;

    // Verify ownership through farm
    const pond = await db.pondEntry.findFirst({
      where: { id: pondId },
      include: { farm: true },
    });

    if (!pond || pond.farm.userId !== session.user.id) {
      return NextResponse.json({ error: "Pond not found" }, { status: 404 });
    }

    const harvests = await db.pondHarvest.findMany({
      where: { pondEntryId: pondId },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(harvests);
  } catch (error) {
    console.error("Error fetching harvests:", error);
    return NextResponse.json({ error: "Failed to fetch harvests" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: pondId } = await params;
    const body = await request.json();
    const data = harvestSchema.parse(body);

    // Verify ownership through farm
    const pond = await db.pondEntry.findFirst({
      where: { id: pondId },
      include: { farm: true },
    });

    if (!pond || pond.farm.userId !== session.user.id) {
      return NextResponse.json({ error: "Pond not found" }, { status: 404 });
    }

    const harvest = await db.pondHarvest.create({
      data: {
        pondEntryId: pondId,
        date: new Date(data.date),
        quantity: data.quantity,
        quantityUnit: data.quantityUnit,
        averageWeight: data.averageWeight,
        totalWeight: data.totalWeight,
        isPartial: data.isPartial ?? false,
        notes: data.notes,
      },
    });

    // Update pond status if full harvest
    if (!data.isPartial) {
      await db.pondEntry.update({
        where: { id: pondId },
        data: { status: "HARVESTED" },
      });
    }

    return NextResponse.json(harvest, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error("Error creating harvest:", error);
    return NextResponse.json({ error: "Failed to create harvest" }, { status: 500 });
  }
}
