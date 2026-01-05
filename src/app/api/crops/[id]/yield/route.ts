import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const yieldSchema = z.object({
  quantity: z.number().positive("Quantity must be positive"),
  unit: z.string().min(1, "Unit is required"),
  qualityNotes: z.string().optional(),
  harvestDate: z.string(),
});

export async function PATCH(
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
    const data = yieldSchema.parse(body);

    // Verify ownership
    const cropEntry = await db.cropEntry.findFirst({
      where: { id: cropEntryId, userId: session.user.id },
    });

    if (!cropEntry) {
      return NextResponse.json({ error: "Crop not found" }, { status: 404 });
    }

    // Update crop entry with yield data
    const updated = await db.cropEntry.update({
      where: { id: cropEntryId },
      data: {
        yieldQuantity: data.quantity,
        yieldUnit: data.unit,
        qualityGrade: data.qualityNotes,
        actualHarvestDate: new Date(data.harvestDate),
        status: "COMPLETED",
      },
    });

    // Also log as harvest activity
    await db.cropActivity.create({
      data: {
        cropEntryId,
        type: "HARVESTING",
        date: new Date(data.harvestDate),
        notes: `Harvested ${data.quantity} ${data.unit}. ${data.qualityNotes || ""}`,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error("Error recording yield:", error);
    return NextResponse.json({ error: "Failed to record yield" }, { status: 500 });
  }
}
