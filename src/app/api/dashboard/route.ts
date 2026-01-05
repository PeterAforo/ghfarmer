import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const userRole = session.user.role || "USER";

    // Check if user is a team member of any farm
    const teamMemberships = await db.teamMember.findMany({
      where: {
        memberId: userId,
        status: "ACTIVE",
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            farms: {
              select: {
                id: true,
                name: true,
                region: true,
                district: true,
              },
            },
          },
        },
      },
    });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // If user is a team member (not farm owner), show team member dashboard
    if (teamMemberships.length > 0) {
      // Get the owner's farms that this team member has access to
      const ownerIds = teamMemberships.map(tm => tm.ownerId);
      
      // Aggregate data from all farms the team member has access to
      const [
        farms,
        crops,
        livestock,
        tasks,
        overdueTasks,
      ] = await Promise.all([
        db.farm.findMany({
          where: { userId: { in: ownerIds } },
          select: { id: true, name: true, region: true },
        }),
        db.cropEntry.count({ where: { userId: { in: ownerIds } } }),
        db.livestockEntry.aggregate({
          where: { userId: { in: ownerIds } },
          _sum: { quantity: true },
        }),
        db.task.findMany({
          where: {
            userId: { in: ownerIds },
            status: { in: ["PENDING", "IN_PROGRESS"] },
            dueDate: { gte: now, lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
          },
          orderBy: { dueDate: "asc" },
          take: 10,
        }),
        db.task.count({
          where: {
            userId: { in: ownerIds },
            status: "OVERDUE",
          },
        }),
      ]);

      return NextResponse.json({
        type: "team_member",
        memberships: teamMemberships.map(tm => ({
          id: tm.id,
          role: tm.role,
          ownerName: tm.owner.name,
          farmCount: tm.owner.farms.length,
          permissions: tm.permissions,
        })),
        stats: {
          farmsAccess: farms.length,
          totalCrops: crops,
          totalLivestock: livestock._sum.quantity || 0,
          pendingTasks: tasks.length,
          overdueTasks,
        },
        farms,
        upcomingTasks: tasks,
      });
    }

    // Regular farm owner dashboard
    const [
      farms,
      crops,
      livestock,
      plots,
      upcomingTasks,
      overdueTasks,
      monthlyExpenses,
      monthlyIncome,
      yearlyExpenses,
      yearlyIncome,
      teamMembers,
    ] = await Promise.all([
      db.farm.findMany({
        where: { userId },
        select: {
          id: true,
          name: true,
          region: true,
          size: true,
          sizeUnit: true,
          _count: { select: { crops: true, livestock: true, plots: true } },
        },
      }),
      db.cropEntry.count({ where: { userId } }),
      db.livestockEntry.aggregate({
        where: { userId },
        _sum: { quantity: true },
      }),
      db.plot.count({ where: { farm: { userId } } }),
      db.task.findMany({
        where: {
          userId,
          status: { in: ["PENDING", "IN_PROGRESS"] },
          dueDate: { gte: now, lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
        },
        orderBy: { dueDate: "asc" },
        take: 5,
      }),
      db.task.count({
        where: { userId, status: "OVERDUE" },
      }),
      db.expense.aggregate({
        where: { userId, date: { gte: startOfMonth } },
        _sum: { amount: true },
      }),
      db.income.aggregate({
        where: { userId, date: { gte: startOfMonth } },
        _sum: { totalAmount: true },
      }),
      db.expense.aggregate({
        where: { userId, date: { gte: startOfYear } },
        _sum: { amount: true },
      }),
      db.income.aggregate({
        where: { userId, date: { gte: startOfYear } },
        _sum: { totalAmount: true },
      }),
      db.teamMember.count({
        where: { ownerId: userId, status: "ACTIVE" },
      }),
    ]);

    const monthlyProfit = (monthlyIncome._sum.totalAmount || 0) - (monthlyExpenses._sum.amount || 0);
    const yearlyProfit = (yearlyIncome._sum.totalAmount || 0) - (yearlyExpenses._sum.amount || 0);

    // Generate recommendations
    const recommendations = [];

    if (overdueTasks > 0) {
      recommendations.push({
        type: "warning",
        title: "Overdue Tasks",
        message: `You have ${overdueTasks} overdue task${overdueTasks > 1 ? "s" : ""}. Complete them to maintain productivity.`,
        priority: "high",
      });
    }

    if (farms.length === 0) {
      recommendations.push({
        type: "action",
        title: "Get Started",
        message: "Create your first farm to start tracking your agricultural activities.",
        priority: "high",
      });
    }

    if (monthlyProfit < 0) {
      recommendations.push({
        type: "warning",
        title: "Negative Cash Flow",
        message: `Your expenses exceed income by GHS ${Math.abs(monthlyProfit).toLocaleString()} this month.`,
        priority: "high",
      });
    } else if (monthlyProfit > 0) {
      recommendations.push({
        type: "success",
        title: "Positive Cash Flow",
        message: `Great! You're making GHS ${monthlyProfit.toLocaleString()} profit this month.`,
        priority: "low",
      });
    }

    return NextResponse.json({
      type: "owner",
      user: {
        name: session.user.name,
        role: userRole,
      },
      stats: {
        totalFarms: farms.length,
        totalCrops: crops,
        totalLivestock: livestock._sum.quantity || 0,
        totalPlots: plots,
        pendingTasks: upcomingTasks.length,
        overdueTasks,
        teamMembers,
      },
      financials: {
        monthly: {
          income: monthlyIncome._sum.totalAmount || 0,
          expenses: monthlyExpenses._sum.amount || 0,
          profit: monthlyProfit,
        },
        yearly: {
          income: yearlyIncome._sum.totalAmount || 0,
          expenses: yearlyExpenses._sum.amount || 0,
          profit: yearlyProfit,
        },
      },
      farms,
      upcomingTasks,
      recommendations,
    });
  } catch (error) {
    console.error("Error fetching dashboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard" },
      { status: 500 }
    );
  }
}
