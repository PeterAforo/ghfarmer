// Advanced Analytics API - Pro feature
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireFeature } from "@/lib/feature-gate";

export async function GET(request: NextRequest) {
  try {
    // Check feature access
    const gate = await requireFeature("advancedAnalytics");
    if (!gate.allowed) {
      return NextResponse.json(
        { error: gate.error?.message, upgradeRequired: true },
        { status: gate.error?.status || 403 }
      );
    }

    const userId = gate.userId!;
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30"; // days
    const type = searchParams.get("type") || "overview";

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    switch (type) {
      case "overview":
        return NextResponse.json(await getOverviewAnalytics(userId, startDate));
      case "crops":
        return NextResponse.json(await getCropAnalytics(userId, startDate));
      case "livestock":
        return NextResponse.json(await getLivestockAnalytics(userId, startDate));
      case "financial":
        return NextResponse.json(await getFinancialAnalytics(userId, startDate));
      case "productivity":
        return NextResponse.json(await getProductivityAnalytics(userId, startDate));
      default:
        return NextResponse.json(await getOverviewAnalytics(userId, startDate));
    }
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}

async function getOverviewAnalytics(userId: string, startDate: Date) {
  const [
    farms,
    crops,
    livestock,
    expenses,
    incomes,
    tasks,
    recentExpenses,
    recentIncomes,
  ] = await Promise.all([
    db.farm.count({ where: { userId } }),
    db.cropEntry.count({ where: { userId } }),
    db.livestockEntry.count({ where: { userId } }),
    db.expense.aggregate({
      where: { userId, date: { gte: startDate } },
      _sum: { amount: true },
      _count: true,
    }),
    db.income.aggregate({
      where: { userId, date: { gte: startDate } },
      _sum: { totalAmount: true },
      _count: true,
    }),
    db.task.groupBy({
      by: ["status"],
      where: { userId },
      _count: true,
    }),
    db.expense.findMany({
      where: { userId, date: { gte: startDate } },
      orderBy: { date: "desc" },
      take: 10,
      select: { id: true, category: true, amount: true, date: true, description: true },
    }),
    db.income.findMany({
      where: { userId, date: { gte: startDate } },
      orderBy: { date: "desc" },
      take: 10,
      select: { id: true, productType: true, totalAmount: true, date: true, notes: true },
    }),
  ]);

  const totalExpenses = expenses._sum.amount || 0;
  const totalIncome = incomes._sum.totalAmount || 0;
  const netProfit = totalIncome - totalExpenses;
  const profitMargin = totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : 0;

  // Task completion rate
  const totalTasks = tasks.reduce((sum, t) => sum + t._count, 0);
  const completedTasks = tasks.find(t => t.status === "COMPLETED")?._count || 0;
  const taskCompletionRate = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : 0;

  return {
    summary: {
      farms,
      crops,
      livestock,
      totalExpenses,
      totalIncome,
      netProfit,
      profitMargin: parseFloat(profitMargin as string),
      expenseCount: expenses._count,
      incomeCount: incomes._count,
      taskCompletionRate: parseFloat(taskCompletionRate as string),
    },
    recentTransactions: {
      expenses: recentExpenses,
      incomes: recentIncomes,
    },
    taskBreakdown: tasks.map(t => ({
      status: t.status,
      count: t._count,
    })),
  };
}

async function getCropAnalytics(userId: string, startDate: Date) {
  const [
    cropsByStatus,
    cropEntries,
    activities,
  ] = await Promise.all([
    db.cropEntry.groupBy({
      by: ["status"],
      where: { userId },
      _count: true,
    }),
    db.cropEntry.findMany({
      where: { userId },
      include: {
        crop: { select: { englishName: true } },
        variety: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    db.cropActivity.findMany({
      where: { cropEntry: { userId }, date: { gte: startDate } },
      select: { type: true, cost: true },
    }),
  ]);

  // Group by crop name
  const cropsByName: Record<string, { count: number; totalArea: number }> = {};
  cropEntries.forEach(entry => {
    const cropName = entry.crop?.englishName || "Unknown";
    if (!cropsByName[cropName]) {
      cropsByName[cropName] = { count: 0, totalArea: 0 };
    }
    cropsByName[cropName].count += 1;
    cropsByName[cropName].totalArea += entry.landArea || 0;
  });

  // Group activities by type
  const activityByType: Record<string, { count: number; totalCost: number }> = {};
  activities.forEach(a => {
    if (!activityByType[a.type]) {
      activityByType[a.type] = { count: 0, totalCost: 0 };
    }
    activityByType[a.type].count += 1;
    activityByType[a.type].totalCost += a.cost || 0;
  });

  // Get yield data
  const yieldData = cropEntries
    .filter(e => e.yieldQuantity)
    .map(e => ({
      cropName: e.crop?.englishName || "Unknown",
      variety: e.variety?.name,
      actualYield: e.yieldQuantity,
      expectedYield: e.expectedYield,
      landArea: e.landArea,
      harvestDate: e.actualHarvestDate,
    }));

  // Calculate average yield by crop
  const yieldByCrop: Record<string, { total: number; area: number; count: number }> = {};
  yieldData.forEach(crop => {
    if (!yieldByCrop[crop.cropName]) {
      yieldByCrop[crop.cropName] = { total: 0, area: 0, count: 0 };
    }
    yieldByCrop[crop.cropName].total += crop.actualYield || 0;
    yieldByCrop[crop.cropName].area += crop.landArea || 0;
    yieldByCrop[crop.cropName].count += 1;
  });

  const averageYields = Object.entries(yieldByCrop).map(([name, data]) => ({
    cropType: name,
    averageYield: data.count > 0 ? data.total / data.count : 0,
    yieldPerHa: data.area > 0 ? data.total / data.area : 0,
    totalArea: data.area,
    count: data.count,
  }));

  return {
    distribution: {
      byType: Object.entries(cropsByName).map(([name, data]) => ({
        cropType: name,
        count: data.count,
        totalArea: data.totalArea,
      })),
      byStatus: cropsByStatus.map(c => ({
        status: c.status,
        count: c._count,
      })),
    },
    yields: {
      recent: yieldData.slice(0, 20),
      averageByType: averageYields,
      topPerformers: yieldData
        .filter(y => y.landArea && y.landArea > 0)
        .map(y => ({ ...y, yieldPerHa: (y.actualYield || 0) / (y.landArea || 1) }))
        .sort((a, b) => b.yieldPerHa - a.yieldPerHa)
        .slice(0, 5),
    },
    activities: Object.entries(activityByType).map(([type, data]) => ({
      type,
      count: data.count,
      totalCost: data.totalCost,
    })),
  };
}

async function getLivestockAnalytics(userId: string, startDate: Date) {
  const [
    livestockByStatus,
    livestockEntries,
    healthRecords,
    productionData,
  ] = await Promise.all([
    db.livestockEntry.groupBy({
      by: ["status"],
      where: { userId },
      _count: true,
    }),
    db.livestockEntry.findMany({
      where: { userId },
      include: {
        livestock: { select: { englishName: true, category: true } },
      },
    }),
    db.healthRecord.findMany({
      where: { livestockEntry: { userId }, date: { gte: startDate } },
      select: { type: true, cost: true },
    }),
    db.productionRecord.findMany({
      where: { livestockEntry: { userId }, date: { gte: startDate } },
      select: {
        type: true,
        actualEggCount: true,
        actualMilkVolume: true,
        actualWeight: true,
        actualRevenue: true,
        date: true,
      },
      orderBy: { date: "desc" },
      take: 50,
    }),
  ]);

  // Group by livestock type
  const byType: Record<string, { count: number; totalAnimals: number }> = {};
  livestockEntries.forEach(entry => {
    const typeName = entry.livestock?.englishName || "Unknown";
    if (!byType[typeName]) {
      byType[typeName] = { count: 0, totalAnimals: 0 };
    }
    byType[typeName].count += 1;
    byType[typeName].totalAnimals += entry.quantity || 1;
  });

  // Group health records by type
  const healthByType: Record<string, { count: number; totalCost: number }> = {};
  healthRecords.forEach(h => {
    if (!healthByType[h.type]) {
      healthByType[h.type] = { count: 0, totalCost: 0 };
    }
    healthByType[h.type].count += 1;
    healthByType[h.type].totalCost += h.cost || 0;
  });

  // Aggregate production by type
  const productionByType: Record<string, { quantity: number; value: number; count: number }> = {};
  productionData.forEach(record => {
    if (!productionByType[record.type]) {
      productionByType[record.type] = { quantity: 0, value: 0, count: 0 };
    }
    // Sum up different production metrics
    const quantity = (record.actualEggCount || 0) + (record.actualMilkVolume || 0) + (record.actualWeight || 0);
    productionByType[record.type].quantity += quantity;
    productionByType[record.type].value += record.actualRevenue || 0;
    productionByType[record.type].count += 1;
  });

  // Calculate mortality (entries with DECEASED status)
  const deceasedByType: Record<string, number> = {};
  const totalByType: Record<string, number> = {};
  livestockEntries.forEach(entry => {
    const typeName = entry.livestock?.englishName || "Unknown";
    totalByType[typeName] = (totalByType[typeName] || 0) + (entry.quantity || 1);
    if (entry.status === "DECEASED") {
      deceasedByType[typeName] = (deceasedByType[typeName] || 0) + (entry.quantity || 1);
    }
  });

  const mortalityRates = Object.entries(totalByType).map(([type, total]) => ({
    livestockType: type,
    totalCount: total,
    deaths: deceasedByType[type] || 0,
    mortalityRate: total > 0 ? (((deceasedByType[type] || 0) / total) * 100).toFixed(2) : 0,
  }));

  return {
    distribution: {
      byType: Object.entries(byType).map(([name, data]) => ({
        livestockType: name,
        count: data.count,
        totalAnimals: data.totalAnimals,
      })),
      byStatus: livestockByStatus.map(l => ({
        status: l.status,
        count: l._count,
      })),
    },
    health: {
      records: Object.entries(healthByType).map(([type, data]) => ({
        type,
        count: data.count,
        totalCost: data.totalCost,
      })),
    },
    production: {
      byType: Object.entries(productionByType).map(([type, data]) => ({
        productionType: type,
        totalQuantity: data.quantity,
        totalValue: data.value,
        recordCount: data.count,
      })),
      recent: productionData.slice(0, 10),
    },
    mortality: mortalityRates,
  };
}

async function getFinancialAnalytics(userId: string, startDate: Date) {
  const [
    expenses,
    incomes,
  ] = await Promise.all([
    db.expense.findMany({
      where: { userId, date: { gte: startDate } },
      select: { category: true, amount: true, date: true },
      orderBy: { date: "asc" },
    }),
    db.income.findMany({
      where: { userId, date: { gte: startDate } },
      select: { productType: true, totalAmount: true, date: true },
      orderBy: { date: "asc" },
    }),
  ]);

  // Calculate totals
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalIncome = incomes.reduce((sum, i) => sum + i.totalAmount, 0);

  // Group expenses by category
  const expensesByCategory: Record<string, { total: number; count: number }> = {};
  expenses.forEach(e => {
    if (!expensesByCategory[e.category]) {
      expensesByCategory[e.category] = { total: 0, count: 0 };
    }
    expensesByCategory[e.category].total += e.amount;
    expensesByCategory[e.category].count += 1;
  });

  // Group incomes by product type
  const incomesByType: Record<string, { total: number; count: number }> = {};
  incomes.forEach(i => {
    if (!incomesByType[i.productType]) {
      incomesByType[i.productType] = { total: 0, count: 0 };
    }
    incomesByType[i.productType].total += i.totalAmount;
    incomesByType[i.productType].count += 1;
  });

  // Aggregate by week for trend chart
  const weeklyData: Record<string, { expenses: number; income: number }> = {};
  
  expenses.forEach(e => {
    const weekStart = getWeekStart(e.date);
    if (!weeklyData[weekStart]) {
      weeklyData[weekStart] = { expenses: 0, income: 0 };
    }
    weeklyData[weekStart].expenses += e.amount;
  });

  incomes.forEach(i => {
    const weekStart = getWeekStart(i.date);
    if (!weeklyData[weekStart]) {
      weeklyData[weekStart] = { expenses: 0, income: 0 };
    }
    weeklyData[weekStart].income += i.totalAmount;
  });

  const trendData = Object.entries(weeklyData)
    .map(([week, data]) => ({
      week,
      expenses: data.expenses,
      income: data.income,
      profit: data.income - data.expenses,
    }))
    .sort((a, b) => a.week.localeCompare(b.week));

  return {
    summary: {
      totalExpenses,
      totalIncome,
      netProfit: totalIncome - totalExpenses,
      profitMargin: totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100).toFixed(1) : 0,
      avgExpense: expenses.length > 0 ? totalExpenses / expenses.length : 0,
      avgIncome: incomes.length > 0 ? totalIncome / incomes.length : 0,
      expenseCount: expenses.length,
      incomeCount: incomes.length,
    },
    breakdown: {
      expenses: Object.entries(expensesByCategory).map(([category, data]) => ({
        category,
        total: data.total,
        count: data.count,
        percentage: totalExpenses > 0 ? ((data.total / totalExpenses) * 100).toFixed(1) : 0,
      })),
      income: Object.entries(incomesByType).map(([category, data]) => ({
        category,
        total: data.total,
        count: data.count,
        percentage: totalIncome > 0 ? ((data.total / totalIncome) * 100).toFixed(1) : 0,
      })),
    },
    trend: trendData,
  };
}

async function getProductivityAnalytics(userId: string, startDate: Date) {
  const [
    tasksCompleted,
    tasksByPriority,
    avgCompletionTime,
    activitiesLogged,
  ] = await Promise.all([
    db.task.count({
      where: { userId, status: "COMPLETED", completedAt: { gte: startDate } },
    }),
    db.task.groupBy({
      by: ["priority"],
      where: { userId, createdAt: { gte: startDate } },
      _count: true,
    }),
    db.task.findMany({
      where: { 
        userId, 
        status: "COMPLETED",
        completedAt: { not: null },
        createdAt: { gte: startDate },
      },
      select: { createdAt: true, completedAt: true },
    }),
    db.cropActivity.count({
      where: { cropEntry: { userId }, date: { gte: startDate } },
    }),
  ]);

  // Calculate average completion time in days
  let totalCompletionDays = 0;
  avgCompletionTime.forEach(task => {
    if (task.completedAt) {
      const days = (task.completedAt.getTime() - task.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      totalCompletionDays += days;
    }
  });
  const avgDays = avgCompletionTime.length > 0 ? totalCompletionDays / avgCompletionTime.length : 0;

  return {
    tasks: {
      completed: tasksCompleted,
      byPriority: tasksByPriority.map(t => ({
        priority: t.priority,
        count: t._count,
      })),
      avgCompletionDays: avgDays.toFixed(1),
    },
    activities: {
      logged: activitiesLogged,
    },
  };
}

function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split("T")[0];
}
