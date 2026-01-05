import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// Update health record status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, completedDate, cost, notes } = body;

    // Verify the health record belongs to user's livestock
    const healthRecord = await db.healthRecord.findFirst({
      where: {
        id,
        livestockEntry: {
          userId: session.user.id,
        },
      },
    });

    if (!healthRecord) {
      return NextResponse.json({ error: "Health record not found" }, { status: 404 });
    }

    // Update the health record
    const updatedRecord = await db.healthRecord.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(status === "COMPLETED" && { completedDate: completedDate ? new Date(completedDate) : new Date() }),
        ...(cost !== undefined && { cost }),
        ...(notes !== undefined && { notes }),
      },
    });

    return NextResponse.json(updatedRecord);
  } catch (error) {
    console.error("Error updating health record:", error);
    return NextResponse.json(
      { error: "Failed to update health record" },
      { status: 500 }
    );
  }
}

// Delete health record
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify the health record belongs to user's livestock
    const healthRecord = await db.healthRecord.findFirst({
      where: {
        id,
        livestockEntry: {
          userId: session.user.id,
        },
      },
    });

    if (!healthRecord) {
      return NextResponse.json({ error: "Health record not found" }, { status: 404 });
    }

    await db.healthRecord.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting health record:", error);
    return NextResponse.json(
      { error: "Failed to delete health record" },
      { status: 500 }
    );
  }
}
