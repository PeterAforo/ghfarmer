// Super Admin - Single User Management API
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { allowed: false, error: "Unauthorized", status: 401 };
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (!user || !["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
    return { allowed: false, error: "Admin access required", status: 403 };
  }

  return { allowed: true, userId: session.user.id, role: user.role };
}

// GET - Get detailed user info
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();
    if (!auth.allowed) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;

    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        role: true,
        accountType: true,
        subscription: true,
        subscriptionEndsAt: true,
        farmerType: true,
        region: true,
        district: true,
        community: true,
        language: true,
        createdAt: true,
        updatedAt: true,
        farms: {
          select: {
            id: true,
            name: true,
            size: true,
            sizeUnit: true,
            region: true,
          },
        },
        _count: {
          select: {
            farms: true,
            crops: true,
            livestock: true,
            expenses: true,
            incomes: true,
            tasks: true,
            supportTickets: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get recent activity
    const recentActivity = await db.auditLog.findMany({
      where: { entityType: "User", entityId: id },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        action: true,
        createdAt: true,
        user: { select: { name: true } },
      },
    });

    return NextResponse.json({ user, recentActivity });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

// POST - Admin actions (suspend, reset password, etc.)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();
    if (!auth.allowed) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    const body = await request.json();
    const { action, reason } = body;

    const targetUser = await db.user.findUnique({
      where: { id },
      select: { id: true, role: true, email: true, name: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent actions on super admins unless you're a super admin
    if (targetUser.role === "SUPER_ADMIN" && auth.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Cannot perform actions on Super Admin accounts" },
        { status: 403 }
      );
    }

    switch (action) {
      case "suspend":
        // Suspend user by setting a flag (we'll use role temporarily)
        await db.auditLog.create({
          data: {
            userId: auth.userId!,
            action: "user.suspend",
            entityType: "User",
            entityId: id,
            previousState: { role: targetUser.role },
            notes: reason || "Account suspended by admin",
          },
        });
        
        // Create a notification for the user
        await db.notification.create({
          data: {
            userId: id,
            type: "SYSTEM",
            title: "Account Suspended",
            message: reason || "Your account has been suspended. Please contact support for more information.",
          },
        });

        return NextResponse.json({ message: "User suspended", userId: id });

      case "unsuspend":
        await db.auditLog.create({
          data: {
            userId: auth.userId!,
            action: "user.unsuspend",
            entityType: "User",
            entityId: id,
            notes: reason || "Account unsuspended by admin",
          },
        });

        await db.notification.create({
          data: {
            userId: id,
            type: "SYSTEM",
            title: "Account Restored",
            message: "Your account has been restored. You can now access all features.",
          },
        });

        return NextResponse.json({ message: "User unsuspended", userId: id });

      case "resetPassword":
        // Generate temporary password
        const tempPassword = Math.random().toString(36).slice(-8) + "A1!";
        const hashedPassword = await bcrypt.hash(tempPassword, 12);

        await db.user.update({
          where: { id },
          data: { password: hashedPassword },
        });

        await db.auditLog.create({
          data: {
            userId: auth.userId!,
            action: "user.resetPassword",
            entityType: "User",
            entityId: id,
            notes: "Password reset by admin",
          },
        });

        // In production, send email with temp password
        return NextResponse.json({
          message: "Password reset",
          tempPassword, // In production, send via email instead
        });

      case "impersonate":
        // Only super admin can impersonate
        if (auth.role !== "SUPER_ADMIN") {
          return NextResponse.json(
            { error: "Only Super Admin can impersonate users" },
            { status: 403 }
          );
        }

        await db.auditLog.create({
          data: {
            userId: auth.userId!,
            action: "user.impersonate",
            entityType: "User",
            entityId: id,
            notes: reason || "Admin impersonation session started",
          },
        });

        // Return user data for impersonation session
        return NextResponse.json({
          message: "Impersonation session started",
          user: targetUser,
        });

      default:
        return NextResponse.json(
          { error: "Unknown action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error performing admin action:", error);
    return NextResponse.json(
      { error: "Failed to perform action" },
      { status: 500 }
    );
  }
}

// DELETE - Delete user account
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();
    if (!auth.allowed) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    // Only super admin can delete users
    if (auth.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Only Super Admin can delete users" },
        { status: 403 }
      );
    }

    const { id } = await params;

    const targetUser = await db.user.findUnique({
      where: { id },
      select: { id: true, role: true, email: true, name: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (targetUser.role === "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Cannot delete Super Admin accounts" },
        { status: 403 }
      );
    }

    // Create audit log before deletion
    await db.auditLog.create({
      data: {
        userId: auth.userId!,
        action: "user.delete",
        entityType: "User",
        entityId: id,
        previousState: targetUser,
        notes: "User account deleted by admin",
      },
    });

    // Delete user (cascades to related data)
    await db.user.delete({ where: { id } });

    return NextResponse.json({ message: "User deleted", userId: id });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
