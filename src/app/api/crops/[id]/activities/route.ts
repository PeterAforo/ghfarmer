import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const activitySchema = z.object({
  type: z.enum([
    "LAND_PREPARATION",
    "PLANTING",
    "FERTILIZER_APPLICATION",
    "PEST_TREATMENT",
    "DISEASE_TREATMENT",
    "IRRIGATION",
    "WEEDING",
    "PRUNING",
    "HARVESTING",
    "POST_HARVEST",
    "OTHER",
  ]),
  date: z.string(),
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

    const { id: cropEntryId } = await params;

    // Verify ownership
    const cropEntry = await db.cropEntry.findFirst({
      where: { id: cropEntryId, userId: session.user.id },
    });

    if (!cropEntry) {
      return NextResponse.json({ error: "Crop not found" }, { status: 404 });
    }

    const activities = await db.cropActivity.findMany({
      where: { cropEntryId },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(activities);
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 });
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

    const { id: cropEntryId } = await params;
    const body = await request.json();
    const data = activitySchema.parse(body);

    // Verify ownership
    const cropEntry = await db.cropEntry.findFirst({
      where: { id: cropEntryId, userId: session.user.id },
    });

    if (!cropEntry) {
      return NextResponse.json({ error: "Crop not found" }, { status: 404 });
    }

    const activity = await db.cropActivity.create({
      data: {
        cropEntryId,
        type: data.type,
        date: new Date(data.date),
        cost: data.cost,
        notes: data.notes,
      },
    });

    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error("Error creating activity:", error);
    return NextResponse.json({ error: "Failed to create activity" }, { status: 500 });
  }
}
