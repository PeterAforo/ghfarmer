import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const healthRecordSchema = z.object({
  type: z.enum(["VACCINATION", "DEWORMING", "DISEASE", "TREATMENT", "VETERINARY_VISIT", "MORTALITY"]),
  date: z.string(),
  vaccineName: z.string().optional(),
  diagnosis: z.string().optional(),
  treatment: z.string().optional(),
  medication: z.string().optional(),
  cost: z.number().optional(),
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

    const records = await db.healthRecord.findMany({
      where: { livestockEntryId },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(records);
  } catch (error) {
    console.error("Error fetching health records:", error);
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
    const data = healthRecordSchema.parse(body);

    // Verify ownership
    const entry = await db.livestockEntry.findFirst({
      where: { id: livestockEntryId, userId: session.user.id },
    });

    if (!entry) {
      return NextResponse.json({ error: "Livestock not found" }, { status: 404 });
    }

    const record = await db.healthRecord.create({
      data: {
        livestockEntryId,
        type: data.type,
        date: new Date(data.date),
        vaccineName: data.vaccineName,
        diagnosis: data.diagnosis,
        treatment: data.treatment,
        medication: data.medication,
        cost: data.cost,
        notes: data.notes,
      },
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error("Error creating health record:", error);
    return NextResponse.json({ error: "Failed to create record" }, { status: 500 });
  }
}
