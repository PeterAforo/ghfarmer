import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: programId } = await params;

    const program = await db.governmentProgram.findUnique({
      where: { id: programId },
    });

    if (!program) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }

    if (program.status !== "ACTIVE") {
      return NextResponse.json({ error: "Program is not accepting applications" }, { status: 400 });
    }

    // Check if already applied
    const existing = await db.programApplication.findUnique({
      where: {
        programId_userId: {
          programId,
          userId: session.user.id,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: "You have already applied to this program" }, { status: 400 });
    }

    const application = await db.programApplication.create({
      data: {
        programId,
        userId: session.user.id,
      },
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error("Error applying to program:", error);
    return NextResponse.json({ error: "Failed to apply" }, { status: 500 });
  }
}
