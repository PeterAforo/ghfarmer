import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const waterQualitySchema = z.object({
  date: z.string(),
  ph: z.number().optional(),
  temperature: z.number().optional(),
  dissolvedOxygen: z.number().optional(),
  ammonia: z.number().optional(),
  nitrite: z.number().optional(),
  nitrate: z.number().optional(),
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

    const records = await db.waterQualityRecord.findMany({
      where: { pondEntryId: pondId },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(records);
  } catch (error) {
    console.error("Error fetching water quality records:", error);
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

    const { id: pondId } = await params;
    const body = await request.json();
    const data = waterQualitySchema.parse(body);

    // Verify ownership through farm
    const pond = await db.pondEntry.findFirst({
      where: { id: pondId },
      include: { farm: true },
    });

    if (!pond || pond.farm.userId !== session.user.id) {
      return NextResponse.json({ error: "Pond not found" }, { status: 404 });
    }

    const record = await db.waterQualityRecord.create({
      data: {
        pondEntryId: pondId,
        date: new Date(data.date),
        ph: data.ph,
        temperature: data.temperature,
        dissolvedOxygen: data.dissolvedOxygen,
        ammonia: data.ammonia,
        notes: data.notes,
      },
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error("Error creating water quality record:", error);
    return NextResponse.json({ error: "Failed to create record" }, { status: 500 });
  }
}
