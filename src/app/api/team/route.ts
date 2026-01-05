// Team Management API - Business tier feature
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireFeature } from "@/lib/feature-gate";
import { z } from "zod";

const inviteSchema = z.object({
  email: z.string().email("Valid email required"),
  role: z.enum(["ADMIN", "MANAGER", "WORKER", "VIEWER"]).default("VIEWER"),
  permissions: z.object({
    canEditCrops: z.boolean().optional(),
    canEditLivestock: z.boolean().optional(),
    canViewFinances: z.boolean().optional(),
    canEditFinances: z.boolean().optional(),
    canManageTasks: z.boolean().optional(),
    canViewReports: z.boolean().optional(),
  }).optional(),
  farmIds: z.array(z.string()).optional(),
});

// GET - List team members
export async function GET(request: NextRequest) {
  try {
    const gate = await requireFeature("multiUserAccess");
    if (!gate.allowed) {
      return NextResponse.json(
        { error: gate.error?.message, upgradeRequired: true },
        { status: gate.error?.status || 403 }
      );
    }

    const userId = gate.userId!;

    // Get team members where user is owner
    const teamMembers = await db.teamMember.findMany({
      where: { ownerId: userId },
      include: {
        member: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Get teams user is a member of
    const memberOf = await db.teamMember.findMany({
      where: { memberId: userId, status: "ACTIVE" },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      team: teamMembers.map(tm => ({
        id: tm.id,
        member: tm.member,
        role: tm.role,
        status: tm.status,
        permissions: tm.permissions,
        farmIds: tm.farmIds,
        invitedAt: tm.invitedAt,
        acceptedAt: tm.acceptedAt,
      })),
      memberOf: memberOf.map(tm => ({
        id: tm.id,
        owner: tm.owner,
        role: tm.role,
        permissions: tm.permissions,
        farmIds: tm.farmIds,
      })),
    });
  } catch (error) {
    console.error("Error fetching team:", error);
    return NextResponse.json(
      { error: "Failed to fetch team" },
      { status: 500 }
    );
  }
}

// POST - Invite team member
export async function POST(request: NextRequest) {
  try {
    const gate = await requireFeature("multiUserAccess");
    if (!gate.allowed) {
      return NextResponse.json(
        { error: gate.error?.message, upgradeRequired: true },
        { status: gate.error?.status || 403 }
      );
    }

    const userId = gate.userId!;
    const body = await request.json();
    const validatedData = inviteSchema.parse(body);

    // Check team member limit (Business tier = 5 users)
    const currentTeamCount = await db.teamMember.count({
      where: { ownerId: userId, status: { in: ["PENDING", "ACTIVE"] } },
    });

    // Get user's plan limit
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { subscription: true },
    });

    const maxUsers = user?.subscription === "ENTERPRISE" ? 999 :
                     user?.subscription === "PROFESSIONAL" ? 5 : 1;

    if (currentTeamCount >= maxUsers) {
      return NextResponse.json(
        { error: `Team member limit reached (${maxUsers} members)` },
        { status: 400 }
      );
    }

    // Find the user to invite
    const invitee = await db.user.findUnique({
      where: { email: validatedData.email },
    });

    if (!invitee) {
      return NextResponse.json(
        { error: "User not found. They must register first." },
        { status: 404 }
      );
    }

    if (invitee.id === userId) {
      return NextResponse.json(
        { error: "You cannot invite yourself" },
        { status: 400 }
      );
    }

    // Check if already invited
    const existing = await db.teamMember.findUnique({
      where: {
        ownerId_memberId: {
          ownerId: userId,
          memberId: invitee.id,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "User is already a team member or has a pending invitation" },
        { status: 400 }
      );
    }

    // Set default permissions based on role
    const defaultPermissions = getDefaultPermissions(validatedData.role);
    const permissions = { ...defaultPermissions, ...validatedData.permissions };

    const teamMember = await db.teamMember.create({
      data: {
        ownerId: userId,
        memberId: invitee.id,
        role: validatedData.role,
        permissions,
        farmIds: validatedData.farmIds || [],
        status: "PENDING",
      },
      include: {
        member: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // TODO: Send invitation email/notification

    return NextResponse.json({
      message: "Invitation sent",
      teamMember: {
        id: teamMember.id,
        member: teamMember.member,
        role: teamMember.role,
        status: teamMember.status,
      },
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error inviting team member:", error);
    return NextResponse.json(
      { error: "Failed to invite team member" },
      { status: 500 }
    );
  }
}

function getDefaultPermissions(role: string) {
  switch (role) {
    case "ADMIN":
      return {
        canEditCrops: true,
        canEditLivestock: true,
        canViewFinances: true,
        canEditFinances: true,
        canManageTasks: true,
        canViewReports: true,
      };
    case "MANAGER":
      return {
        canEditCrops: true,
        canEditLivestock: true,
        canViewFinances: true,
        canEditFinances: false,
        canManageTasks: true,
        canViewReports: true,
      };
    case "WORKER":
      return {
        canEditCrops: true,
        canEditLivestock: true,
        canViewFinances: false,
        canEditFinances: false,
        canManageTasks: false,
        canViewReports: false,
      };
    case "VIEWER":
    default:
      return {
        canEditCrops: false,
        canEditLivestock: false,
        canViewFinances: false,
        canEditFinances: false,
        canManageTasks: false,
        canViewReports: false,
      };
  }
}
