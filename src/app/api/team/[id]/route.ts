// Team Member API - Update, Accept, Remove
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireFeature } from "@/lib/feature-gate";
import { z } from "zod";

const updateSchema = z.object({
  role: z.enum(["ADMIN", "MANAGER", "WORKER", "VIEWER"]).optional(),
  permissions: z.object({
    canEditCrops: z.boolean().optional(),
    canEditLivestock: z.boolean().optional(),
    canViewFinances: z.boolean().optional(),
    canEditFinances: z.boolean().optional(),
    canManageTasks: z.boolean().optional(),
    canViewReports: z.boolean().optional(),
  }).optional(),
  farmIds: z.array(z.string()).optional(),
  status: z.enum(["ACTIVE", "SUSPENDED"]).optional(),
});

// GET - Get team member details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const userId = session.user.id;

    const teamMember = await db.teamMember.findFirst({
      where: {
        id,
        OR: [
          { ownerId: userId },
          { memberId: userId },
        ],
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        member: {
          select: { id: true, name: true, email: true, phone: true, image: true },
        },
      },
    });

    if (!teamMember) {
      return NextResponse.json(
        { error: "Team member not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(teamMember);
  } catch (error) {
    console.error("Error fetching team member:", error);
    return NextResponse.json(
      { error: "Failed to fetch team member" },
      { status: 500 }
    );
  }
}

// PATCH - Update team member or accept invitation
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
    const userId = session.user.id;
    const body = await request.json();

    const teamMember = await db.teamMember.findUnique({
      where: { id },
    });

    if (!teamMember) {
      return NextResponse.json(
        { error: "Team member not found" },
        { status: 404 }
      );
    }

    // Handle invitation acceptance
    if (body.action === "accept") {
      if (teamMember.memberId !== userId) {
        return NextResponse.json(
          { error: "You can only accept your own invitations" },
          { status: 403 }
        );
      }

      if (teamMember.status !== "PENDING") {
        return NextResponse.json(
          { error: "Invitation is not pending" },
          { status: 400 }
        );
      }

      const updated = await db.teamMember.update({
        where: { id },
        data: {
          status: "ACTIVE",
          acceptedAt: new Date(),
        },
      });

      return NextResponse.json({
        message: "Invitation accepted",
        teamMember: updated,
      });
    }

    // Handle invitation rejection
    if (body.action === "reject") {
      if (teamMember.memberId !== userId) {
        return NextResponse.json(
          { error: "You can only reject your own invitations" },
          { status: 403 }
        );
      }

      await db.teamMember.delete({
        where: { id },
      });

      return NextResponse.json({ message: "Invitation rejected" });
    }

    // Handle owner updates
    if (teamMember.ownerId !== userId) {
      return NextResponse.json(
        { error: "Only the team owner can update members" },
        { status: 403 }
      );
    }

    const validatedData = updateSchema.parse(body);

    const updated = await db.teamMember.update({
      where: { id },
      data: {
        role: validatedData.role,
        permissions: validatedData.permissions 
          ? { ...(teamMember.permissions as object || {}), ...validatedData.permissions }
          : undefined,
        farmIds: validatedData.farmIds,
        status: validatedData.status,
      },
      include: {
        member: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating team member:", error);
    return NextResponse.json(
      { error: "Failed to update team member" },
      { status: 500 }
    );
  }
}

// DELETE - Remove team member
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
    const userId = session.user.id;

    const teamMember = await db.teamMember.findUnique({
      where: { id },
    });

    if (!teamMember) {
      return NextResponse.json(
        { error: "Team member not found" },
        { status: 404 }
      );
    }

    // Allow owner to remove or member to leave
    if (teamMember.ownerId !== userId && teamMember.memberId !== userId) {
      return NextResponse.json(
        { error: "Not authorized to remove this team member" },
        { status: 403 }
      );
    }

    await db.teamMember.delete({
      where: { id },
    });

    return NextResponse.json({ 
      message: teamMember.ownerId === userId 
        ? "Team member removed" 
        : "You have left the team" 
    });
  } catch (error) {
    console.error("Error removing team member:", error);
    return NextResponse.json(
      { error: "Failed to remove team member" },
      { status: 500 }
    );
  }
}
