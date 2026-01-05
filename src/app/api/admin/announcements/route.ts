// Super Admin - Announcements API
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

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

  return { allowed: true, userId: session.user.id };
}

// GET - List announcements
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (!auth.allowed) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const includeExpired = searchParams.get("includeExpired") === "true";

    const where: any = {};
    if (!includeExpired) {
      where.OR = [
        { expiresAt: null },
        { expiresAt: { gte: new Date() } },
      ];
    }

    const announcements = await db.announcement.findMany({
      where,
      include: {
        createdBy: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(announcements);
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return NextResponse.json(
      { error: "Failed to fetch announcements" },
      { status: 500 }
    );
  }
}

const announcementSchema = z.object({
  title: z.string().min(1, "Title required"),
  content: z.string().min(1, "Content required"),
  type: z.enum(["INFO", "WARNING", "SUCCESS", "MAINTENANCE"]).default("INFO"),
  targetRoles: z.array(z.string()).default([]),
  targetRegions: z.array(z.string()).default([]),
  publishAt: z.string().optional(),
  expiresAt: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

// POST - Create announcement
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (!auth.allowed) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const validatedData = announcementSchema.parse(body);

    const announcement = await db.announcement.create({
      data: {
        title: validatedData.title,
        content: validatedData.content,
        type: validatedData.type,
        targetRoles: validatedData.targetRoles,
        targetRegions: validatedData.targetRegions,
        publishAt: validatedData.publishAt ? new Date(validatedData.publishAt) : new Date(),
        expiresAt: validatedData.expiresAt ? new Date(validatedData.expiresAt) : null,
        isActive: validatedData.isActive,
        createdById: auth.userId!,
      },
    });

    // Create notifications for targeted users
    const userWhere: any = {};
    if (validatedData.targetRoles.length > 0) {
      userWhere.role = { in: validatedData.targetRoles };
    }
    if (validatedData.targetRegions.length > 0) {
      userWhere.region = { in: validatedData.targetRegions };
    }

    const targetUsers = await db.user.findMany({
      where: userWhere,
      select: { id: true },
    });

    if (targetUsers.length > 0) {
      await db.notification.createMany({
        data: targetUsers.map(user => ({
          userId: user.id,
          type: "SYSTEM" as const,
          title: validatedData.title,
          message: validatedData.content.substring(0, 200) + (validatedData.content.length > 200 ? "..." : ""),
        })),
      });
    }

    return NextResponse.json(announcement, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating announcement:", error);
    return NextResponse.json(
      { error: "Failed to create announcement" },
      { status: 500 }
    );
  }
}
