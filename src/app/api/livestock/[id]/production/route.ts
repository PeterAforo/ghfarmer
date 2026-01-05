import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const productionRecordSchema = z.object({
  type: z.enum(["EGGS", "MILK", "WEIGHT", "OTHER"]),
  date: z.string(),
  // Eggs
  eggCount: z.number().optional(),
  eggGrade: z.string().optional(),
  // Milk
  milkVolume: z.number().optional(),
  milkUnit: z.string().optional(),
  // Weight
  weight: z.number().optional(),
  weightUnit: z.string().optional(),
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

    const { id: livestockEntryId } = await params;

    // Verify ownership
    const entry = await db.livestockEntry.findFirst({
      where: { id: livestockEntryId, userId: session.user.id },
    });

    if (!entry) {
      return NextResponse.json({ error: "Livestock not found" }, { status: 404 });
    }

    const records = await db.productionRecord.findMany({
      where: { livestockEntryId },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(records);
  } catch (error) {
    console.error("Error fetching production records:", error);
    return NextResponse.json({ error: "Failed to fetch records" }, { status: 500 });
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

    const { id: livestockEntryId } = await params;
    const body = await request.json();
    const data = productionRecordSchema.parse(body);

    // Verify ownership
    const entry = await db.livestockEntry.findFirst({
      where: { id: livestockEntryId, userId: session.user.id },
    });

    if (!entry) {
      return NextResponse.json({ error: "Livestock not found" }, { status: 404 });
    }

    const record = await db.productionRecord.create({
      data: {
        livestockEntryId,
        type: data.type,
        date: new Date(data.date),
        eggCount: data.eggCount,
        eggGrade: data.eggGrade,
        milkVolume: data.milkVolume,
        milkUnit: data.milkUnit,
        weight: data.weight,
        weightUnit: data.weightUnit,
        notes: data.notes,
      },
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error("Error creating production record:", error);
    return NextResponse.json({ error: "Failed to create record" }, { status: 500 });
  }
}
