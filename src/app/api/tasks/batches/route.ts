import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// Get task batches grouped by related entity (crop, livestock, aquaculture)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all crop entries with their tasks
    const cropEntries = await db.cropEntry.findMany({
      where: {
        userId: session.user.id,
        status: { notIn: ["COMPLETED", "FAILED"] },
      },
      include: {
        crop: { select: { englishName: true } },
        farm: { select: { name: true } },
        _count: {
          select: {
            activities: true,
          },
        },
      },
    });

    // Get tasks for each crop entry
    const cropBatches = await Promise.all(
      cropEntries.map(async (entry) => {
        const tasks = await db.task.findMany({
          where: {
            userId: session.user.id,
            relatedType: "crop",
            relatedId: entry.id,
          },
          orderBy: { dueDate: "asc" },
        });

        const pendingTasks = tasks.filter((t) => t.status === "PENDING");
        const completedTasks = tasks.filter((t) => t.status === "COMPLETED");
        const overdueTasks = pendingTasks.filter(
          (t) => new Date(t.dueDate) < new Date()
        );
        const upcomingTasks = pendingTasks
          .filter((t) => new Date(t.dueDate) >= new Date())
          .slice(0, 3);

        return {
          id: entry.id,
          type: "crop" as const,
          name: entry.crop?.englishName || "Unknown Crop",
          plotName: entry.plotName,
          farmName: entry.farm?.name,
          plantingDate: entry.plantingDate,
          expectedHarvestDate: entry.expectedHarvestDate,
          status: entry.status,
          totalTasks: tasks.length,
          pendingTasks: pendingTasks.length,
          completedTasks: completedTasks.length,
          overdueTasks: overdueTasks.length,
          upcomingTasks,
          progress: tasks.length > 0 
            ? Math.round((completedTasks.length / tasks.length) * 100) 
            : 0,
        };
      })
    );

    // Get all livestock entries with their tasks
    const livestockEntries = await db.livestockEntry.findMany({
      where: {
        userId: session.user.id,
        status: { notIn: ["SOLD", "DECEASED"] },
      },
      include: {
        livestock: { select: { englishName: true } },
        farm: { select: { name: true } },
      },
    });

    const livestockBatches = await Promise.all(
      livestockEntries.map(async (entry) => {
        const tasks = await db.task.findMany({
          where: {
            userId: session.user.id,
            relatedType: "livestock",
            relatedId: entry.id,
          },
          orderBy: { dueDate: "asc" },
        });

        const pendingTasks = tasks.filter((t) => t.status === "PENDING");
        const completedTasks = tasks.filter((t) => t.status === "COMPLETED");
        const overdueTasks = pendingTasks.filter(
          (t) => new Date(t.dueDate) < new Date()
        );
        const upcomingTasks = pendingTasks
          .filter((t) => new Date(t.dueDate) >= new Date())
          .slice(0, 3);

        return {
          id: entry.id,
          type: "livestock" as const,
          name: entry.livestock?.englishName || entry.name || "Unknown",
          batchName: entry.batchId,
          farmName: entry.farm?.name,
          quantity: entry.quantity,
          status: entry.status,
          totalTasks: tasks.length,
          pendingTasks: pendingTasks.length,
          completedTasks: completedTasks.length,
          overdueTasks: overdueTasks.length,
          upcomingTasks,
          progress: tasks.length > 0 
            ? Math.round((completedTasks.length / tasks.length) * 100) 
            : 0,
        };
      })
    );

    // Get all pond entries with their tasks
    const pondEntries = await db.pondEntry.findMany({
      where: {
        farm: { userId: session.user.id },
        status: { not: "HARVESTED" },
      },
      include: {
        farm: { select: { name: true, userId: true } },
      },
    });

    const aquacultureBatches = await Promise.all(
      pondEntries.map(async (entry) => {
        const tasks = await db.task.findMany({
          where: {
            userId: session.user.id,
            relatedType: "pond",
            relatedId: entry.id,
          },
          orderBy: { dueDate: "asc" },
        });

        const pendingTasks = tasks.filter((t) => t.status === "PENDING");
        const completedTasks = tasks.filter((t) => t.status === "COMPLETED");
        const overdueTasks = pendingTasks.filter(
          (t) => new Date(t.dueDate) < new Date()
        );
        const upcomingTasks = pendingTasks
          .filter((t) => new Date(t.dueDate) >= new Date())
          .slice(0, 3);

        return {
          id: entry.id,
          type: "aquaculture" as const,
          name: entry.name,
          fishSpecies: entry.fishSpecies,
          farmName: entry.farm?.name,
          status: entry.status,
          totalTasks: tasks.length,
          pendingTasks: pendingTasks.length,
          completedTasks: completedTasks.length,
          overdueTasks: overdueTasks.length,
          upcomingTasks,
          progress: tasks.length > 0 
            ? Math.round((completedTasks.length / tasks.length) * 100) 
            : 0,
        };
      })
    );

    // Calculate summary stats
    const allBatches = [...cropBatches, ...livestockBatches, ...aquacultureBatches];
    const totalPending = allBatches.reduce((sum, b) => sum + b.pendingTasks, 0);
    const totalOverdue = allBatches.reduce((sum, b) => sum + b.overdueTasks, 0);
    const totalCompleted = allBatches.reduce((sum, b) => sum + b.completedTasks, 0);

    return NextResponse.json({
      crops: cropBatches,
      livestock: livestockBatches,
      aquaculture: aquacultureBatches,
      summary: {
        totalBatches: allBatches.length,
        totalPending,
        totalOverdue,
        totalCompleted,
      },
    });
  } catch (error) {
    console.error("Error fetching task batches:", error);
    return NextResponse.json(
      { error: "Failed to fetch task batches" },
      { status: 500 }
    );
  }
}
