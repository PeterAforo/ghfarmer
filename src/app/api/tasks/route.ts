import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { taskSchema } from "@/lib/validations/task";
import { z } from "zod";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const upcoming = searchParams.get("upcoming");
    const overdue = searchParams.get("overdue");
    const relatedType = searchParams.get("relatedType");
    const relatedId = searchParams.get("relatedId");
    const daysAhead = searchParams.get("daysAhead");

    let dateFilter = {};
    if (overdue === "true") {
      // Get overdue tasks (due date in the past, not completed)
      dateFilter = {
        dueDate: { lt: new Date() },
        status: { in: ["PENDING", "IN_PROGRESS"] },
      };
    } else if (startDate && endDate) {
      dateFilter = {
        dueDate: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      };
    } else if (upcoming === "true") {
      const now = new Date();
      const days = daysAhead ? parseInt(daysAhead) : 7;
      const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
      dateFilter = {
        dueDate: {
          gte: now,
          lte: futureDate,
        },
      };
    }

    const tasks = await db.task.findMany({
      where: {
        userId: session.user.id,
        ...(status && { status: status as any }),
        ...(category && { category: category as any }),
        ...(relatedType && { relatedType }),
        ...(relatedId && { relatedId }),
        ...dateFilter,
      },
      orderBy: [{ dueDate: "asc" }, { priority: "desc" }],
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = taskSchema.parse(body);

    const task = await db.task.create({
      data: {
        userId: session.user.id,
        title: validatedData.title,
        description: validatedData.description,
        dueDate: new Date(validatedData.dueDate),
        category: validatedData.category as any,
        priority: (validatedData.priority || "MEDIUM") as any,
        relatedType: validatedData.relatedType,
        relatedId: validatedData.relatedId,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}
