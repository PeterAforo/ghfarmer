import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: farmId } = await params;

    // Verify farm ownership
    const farm = await db.farm.findFirst({
      where: { id: farmId, userId: session.user.id },
    });

    if (!farm) {
      return NextResponse.json({ error: "Farm not found" }, { status: 404 });
    }

    // Get financial data for this farm
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Get crop and livestock entry IDs for this farm to filter expenses/income
    const cropEntryIds = await db.cropEntry.findMany({
      where: { farmId, userId: session.user.id },
      select: { id: true },
    });
    const livestockEntryIds = await db.livestockEntry.findMany({
      where: { farmId, userId: session.user.id },
      select: { id: true },
    });

    const cropIds = cropEntryIds.map(c => c.id);
    const livestockIds = livestockEntryIds.map(l => l.id);
    const hasEntries = cropIds.length > 0 || livestockIds.length > 0;

    // Initialize financial data
    let monthlyExpensesSum = 0;
    let yearlyExpensesSum = 0;
    let allExpenses: any[] = [];
    let monthlyIncomeSum = 0;
    let yearlyIncomeSum = 0;
    let allIncome: any[] = [];

    // Only query expenses/income if there are entries linked to this farm
    if (hasEntries) {
      const orConditions = [];
      if (cropIds.length > 0) {
        orConditions.push({ cropEntryId: { in: cropIds } });
      }
      if (livestockIds.length > 0) {
        orConditions.push({ livestockEntryId: { in: livestockIds } });
      }

      const [monthlyExp, yearlyExp, recentExp] = await Promise.all([
        db.expense.aggregate({
          where: { userId: session.user.id, date: { gte: startOfMonth }, OR: orConditions },
          _sum: { amount: true },
        }),
        db.expense.aggregate({
          where: { userId: session.user.id, date: { gte: startOfYear }, OR: orConditions },
          _sum: { amount: true },
        }),
        db.expense.findMany({
          where: { userId: session.user.id, OR: orConditions },
          orderBy: { date: "desc" },
          take: 5,
        }),
      ]);

      monthlyExpensesSum = monthlyExp._sum.amount || 0;
      yearlyExpensesSum = yearlyExp._sum.amount || 0;
      allExpenses = recentExp;

      const [monthlyInc, yearlyInc, recentInc] = await Promise.all([
        db.income.aggregate({
          where: { userId: session.user.id, date: { gte: startOfMonth }, OR: orConditions },
          _sum: { totalAmount: true },
        }),
        db.income.aggregate({
          where: { userId: session.user.id, date: { gte: startOfYear }, OR: orConditions },
          _sum: { totalAmount: true },
        }),
        db.income.findMany({
          where: { userId: session.user.id, OR: orConditions },
          orderBy: { date: "desc" },
          take: 5,
        }),
      ]);

      monthlyIncomeSum = monthlyInc._sum.totalAmount || 0;
      yearlyIncomeSum = yearlyInc._sum.totalAmount || 0;
      allIncome = recentInc;
    }

    // Get tasks for this user (general tasks, not farm-specific since Task doesn't have farmId)
    const [upcomingTasks, overdueTasks, pendingTasks] = await Promise.all([
      db.task.findMany({
        where: {
          userId: session.user.id,
          status: { in: ["PENDING", "IN_PROGRESS"] },
          dueDate: { gte: now },
        },
        orderBy: { dueDate: "asc" },
        take: 5,
      }),
      db.task.count({
        where: { userId: session.user.id, status: "OVERDUE" },
      }),
      db.task.count({
        where: { userId: session.user.id, status: "PENDING" },
      }),
    ]);

    // Get plots for this farm
    const plots = await db.plot.findMany({
      where: { farmId },
      include: {
        pens: true,
        cropAllocations: true,
      },
    });

    // Get crop entries with status
    const cropEntries = await db.cropEntry.findMany({
      where: { farmId, userId: session.user.id },
      include: {
        crop: { select: { englishName: true, category: true } },
      },
    });

    // Get livestock entries
    const livestockEntries = await db.livestockEntry.findMany({
      where: { farmId, userId: session.user.id },
      include: {
        livestock: { select: { englishName: true, category: true } },
        _count: { select: { healthRecords: true, productionRecords: true } },
      },
    });

    // Calculate land usage
    const totalFarmSize = farm.size || 0;
    const plotsUsage = plots.reduce((acc: number, plot) => {
      return acc + (plot.size || 0);
    }, 0);

    // Group crops by status
    const cropsByStatus = cropEntries.reduce((acc, entry) => {
      acc[entry.status] = (acc[entry.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Group livestock by category
    const livestockByCategory = livestockEntries.reduce((acc, entry) => {
      const category = entry.livestock?.category || "OTHER";
      acc[category] = (acc[category] || 0) + entry.quantity;
      return acc;
    }, {} as Record<string, number>);

    // Calculate total livestock
    const totalLivestock = livestockEntries.reduce((sum, e) => sum + e.quantity, 0);

    // Financial summary
    const monthlyProfit = monthlyIncomeSum - monthlyExpensesSum;
    const yearlyProfit = yearlyIncomeSum - yearlyExpensesSum;

    // Generate AI recommendations based on farm data
    const recommendations = generateRecommendations({
      farm,
      cropEntries,
      livestockEntries,
      overdueTasks,
      monthlyProfit,
      yearlyProfit,
      plotsUsage,
      totalFarmSize,
    });

    return NextResponse.json({
      farm: {
        id: farm.id,
        name: farm.name,
        size: farm.size,
        sizeUnit: farm.sizeUnit,
        region: farm.region,
        district: farm.district,
      },
      stats: {
        totalCrops: cropEntries.length,
        totalLivestock,
        totalPlots: plots.length,
        pendingTasks,
        overdueTasks,
      },
      financials: {
        monthly: {
          income: monthlyIncomeSum,
          expenses: monthlyExpensesSum,
          profit: monthlyProfit,
        },
        yearly: {
          income: yearlyIncomeSum,
          expenses: yearlyExpensesSum,
          profit: yearlyProfit,
        },
        recentExpenses: allExpenses,
        recentIncome: allIncome,
      },
      landUsage: {
        totalSize: totalFarmSize,
        usedSize: plotsUsage,
        availableSize: totalFarmSize - plotsUsage,
        utilizationPercent: totalFarmSize > 0 ? Math.round((plotsUsage / totalFarmSize) * 100) : 0,
        plots: plots.map(p => ({
          id: p.id,
          name: p.name,
          size: p.size,
          sizeUnit: p.sizeUnit,
          cropCount: p.cropAllocations.length,
          penCount: p.pens.length,
        })),
      },
      crops: {
        entries: cropEntries.slice(0, 10),
        byStatus: cropsByStatus,
      },
      livestock: {
        entries: livestockEntries.slice(0, 10),
        byCategory: livestockByCategory,
        totalCount: totalLivestock,
      },
      tasks: {
        upcoming: upcomingTasks,
        pendingCount: pendingTasks,
        overdueCount: overdueTasks,
      },
      recommendations,
    });
  } catch (error) {
    console.error("Error fetching farm dashboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch farm dashboard" },
      { status: 500 }
    );
  }
}

interface RecommendationInput {
  farm: any;
  cropEntries: any[];
  livestockEntries: any[];
  overdueTasks: number;
  monthlyProfit: number;
  yearlyProfit: number;
  plotsUsage: number;
  totalFarmSize: number;
}

function generateRecommendations(data: RecommendationInput): Array<{
  type: "warning" | "success" | "info" | "action";
  title: string;
  message: string;
  priority: "high" | "medium" | "low";
}> {
  const recommendations = [];

  // Check for overdue tasks
  if (data.overdueTasks > 0) {
    recommendations.push({
      type: "warning" as const,
      title: "Overdue Tasks",
      message: `You have ${data.overdueTasks} overdue task${data.overdueTasks > 1 ? "s" : ""}. Complete them to maintain farm productivity.`,
      priority: "high" as const,
    });
  }

  // Check land utilization
  const utilizationPercent = data.totalFarmSize > 0 
    ? (data.plotsUsage / data.totalFarmSize) * 100 
    : 0;

  if (utilizationPercent < 50 && data.totalFarmSize > 0) {
    recommendations.push({
      type: "info" as const,
      title: "Underutilized Land",
      message: `Only ${Math.round(utilizationPercent)}% of your farm land is being used. Consider expanding crop cultivation or adding more livestock pens.`,
      priority: "medium" as const,
    });
  } else if (utilizationPercent > 90) {
    recommendations.push({
      type: "warning" as const,
      title: "Near Capacity",
      message: `Your farm is at ${Math.round(utilizationPercent)}% capacity. Consider acquiring more land for expansion.`,
      priority: "medium" as const,
    });
  }

  // Check profitability
  if (data.monthlyProfit < 0) {
    recommendations.push({
      type: "warning" as const,
      title: "Negative Monthly Profit",
      message: `Your farm is operating at a loss this month (GHS ${Math.abs(data.monthlyProfit).toLocaleString()}). Review expenses and consider cost-cutting measures.`,
      priority: "high" as const,
    });
  } else if (data.monthlyProfit > 0) {
    recommendations.push({
      type: "success" as const,
      title: "Profitable Month",
      message: `Great job! Your farm made a profit of GHS ${data.monthlyProfit.toLocaleString()} this month.`,
      priority: "low" as const,
    });
  }

  // Check crop diversity
  const cropCategories = new Set(data.cropEntries.map(c => c.crop?.category));
  if (data.cropEntries.length > 0 && cropCategories.size === 1) {
    recommendations.push({
      type: "info" as const,
      title: "Crop Diversification",
      message: "Consider diversifying your crops across different categories to reduce risk and improve soil health.",
      priority: "medium" as const,
    });
  }

  // Check livestock health records
  const livestockWithNoRecords = data.livestockEntries.filter(
    l => l._count.healthRecords === 0
  );
  if (livestockWithNoRecords.length > 0) {
    recommendations.push({
      type: "action" as const,
      title: "Health Records Needed",
      message: `${livestockWithNoRecords.length} livestock entr${livestockWithNoRecords.length > 1 ? "ies have" : "y has"} no health records. Generate health schedules to track vaccinations and treatments.`,
      priority: "medium" as const,
    });
  }

  // Check for no crops or livestock
  if (data.cropEntries.length === 0 && data.livestockEntries.length === 0) {
    recommendations.push({
      type: "action" as const,
      title: "Get Started",
      message: "Your farm has no crops or livestock yet. Add your first crop or livestock entry to start tracking.",
      priority: "high" as const,
    });
  }

  return recommendations;
}
