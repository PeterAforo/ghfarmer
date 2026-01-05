// Super Admin - User Management API
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

// Middleware to check admin access
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

// GET - List all users with filters
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (!auth.allowed) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role");
    const subscription = searchParams.get("subscription");
    const region = searchParams.get("region");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (subscription) {
      where.subscription = subscription;
    }

    if (region) {
      where.region = region;
    }

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          accountType: true,
          subscription: true,
          subscriptionEndsAt: true,
          region: true,
          district: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              farms: true,
              crops: true,
              livestock: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.user.count({ where }),
    ]);

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

const updateUserSchema = z.object({
  role: z.enum(["USER", "ADMIN", "SUPER_ADMIN"]).optional(),
  subscription: z.enum(["FREE", "BASIC", "PROFESSIONAL", "BUSINESS", "ENTERPRISE"]).optional(),
  subscriptionEndsAt: z.string().optional().nullable(),
  notes: z.string().optional(),
});

// PATCH - Update user (role, subscription, etc.)
export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (!auth.allowed) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const { userId, ...updateData } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const validatedData = updateUserSchema.parse(updateData);

    // Only SUPER_ADMIN can change roles
    if (validatedData.role && auth.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Only Super Admin can change user roles" },
        { status: 403 }
      );
    }

    // Get previous state for audit log
    const previousUser = await db.user.findUnique({
      where: { id: userId },
      select: { role: true, subscription: true, subscriptionEndsAt: true },
    });

    if (!previousUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        role: validatedData.role,
        subscription: validatedData.subscription,
        subscriptionEndsAt: validatedData.subscriptionEndsAt 
          ? new Date(validatedData.subscriptionEndsAt) 
          : validatedData.subscriptionEndsAt === null ? null : undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        subscription: true,
        subscriptionEndsAt: true,
      },
    });

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: auth.userId!,
        action: "user.update",
        entityType: "User",
        entityId: userId,
        previousState: previousUser,
        newState: updatedUser,
        notes: validatedData.notes,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
