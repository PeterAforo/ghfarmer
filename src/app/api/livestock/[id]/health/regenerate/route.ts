import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateHealthRecords } from "@/lib/health-record-generator";

// Regenerate health records for a livestock entry
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

    // Verify ownership and get livestock info
    const entry = await db.livestockEntry.findFirst({
      where: { id: livestockEntryId, userId: session.user.id },
      include: {
        livestock: { select: { englishName: true } },
      },
    });

    if (!entry) {
      return NextResponse.json({ error: "Livestock not found" }, { status: 404 });
    }

    // Generate new health records
    const startDate = entry.acquiredDate || entry.createdAt;
    const animalType = entry.livestock?.englishName || "Unknown";

    const recordsGenerated = await generateHealthRecords({
      livestockEntryId,
      animalType,
      startDate,
    });

    return NextResponse.json({
      success: true,
      recordsGenerated,
      animalType,
    });
  } catch (error) {
    console.error("Error regenerating health records:", error);
    return NextResponse.json(
      { error: "Failed to regenerate records" },
      { status: 500 }
    );
  }
}
