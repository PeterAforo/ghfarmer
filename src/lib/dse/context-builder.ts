// DSE Context Builder - Builds evaluation context from database

import { db } from "@/lib/db";
import {
  EvaluationContext,
  CropContext,
  LivestockContext,
  FarmContext,
  WeatherContext,
  MarketContext,
  FinanceContext,
  Season,
} from "./types";

// ============================================
// SEASON CALCULATOR
// ============================================

function getCurrentSeason(): Season {
  const month = new Date().getMonth() + 1; // 1-12
  
  // Ghana seasons:
  // Major Rainy: March - July
  // Minor Dry: August
  // Minor Rainy: September - November
  // Major Dry: December - February
  
  if (month >= 3 && month <= 7) return "MAJOR_RAINY";
  if (month === 8) return "MINOR_DRY";
  if (month >= 9 && month <= 11) return "MINOR_RAINY";
  return "MAJOR_DRY";
}

// ============================================
// CONTEXT BUILDERS
// ============================================

async function buildFarmContext(userId: string, farmId?: string): Promise<FarmContext | undefined> {
  const farm = farmId
    ? await db.farm.findFirst({
        where: { id: farmId, userId },
        include: {
          _count: {
            select: {
              crops: true,
              livestock: true,
            },
          },
        },
      })
    : await db.farm.findFirst({
        where: { userId },
        include: {
          _count: {
            select: {
              crops: true,
              livestock: true,
            },
          },
        },
      });

  if (!farm) return undefined;

  const activeTasks = await db.task.count({
    where: { userId, status: { in: ["PENDING", "IN_PROGRESS"] } },
  });

  const overdueTasks = await db.task.count({
    where: {
      userId,
      status: { in: ["PENDING", "IN_PROGRESS"] },
      dueDate: { lt: new Date() },
    },
  });

  return {
    id: farm.id,
    name: farm.name,
    region: farm.region || undefined,
    district: farm.district || undefined,
    size: farm.size || undefined,
    sizeUnit: farm.sizeUnit,
    totalCrops: farm._count.crops,
    totalLivestock: farm._count.livestock,
    activeTasks,
    overdueTasks,
  };
}

async function buildCropContexts(userId: string, farmId?: string): Promise<CropContext[]> {
  const crops = await db.cropEntry.findMany({
    where: {
      userId,
      ...(farmId && { farmId }),
      status: { in: ["PLANNED", "GROWING"] },
    },
    include: {
      crop: true,
      variety: true,
      activities: {
        orderBy: { date: "desc" },
        take: 10,
      },
    },
  });

  const now = new Date();

  return crops.map((entry) => {
    const plantingDate = entry.plantingDate ? new Date(entry.plantingDate) : now;
    const daysFromPlanting = Math.floor(
      (now.getTime() - plantingDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    const expectedHarvestDate = entry.expectedHarvestDate
      ? new Date(entry.expectedHarvestDate)
      : undefined;
    const daysToHarvest = expectedHarvestDate
      ? Math.floor((expectedHarvestDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : undefined;

    // Group activities by type
    const activityGroups: Record<string, { count: number; lastDate?: Date }> = {};
    for (const activity of entry.activities) {
      if (!activityGroups[activity.type]) {
        activityGroups[activity.type] = { count: 0 };
      }
      activityGroups[activity.type].count++;
      if (!activityGroups[activity.type].lastDate) {
        activityGroups[activity.type].lastDate = activity.date;
      }
    }

    const activitiesLogged = Object.entries(activityGroups).map(([type, data]) => ({
      type,
      count: data.count,
      lastDate: data.lastDate,
    }));

    // Calculate gaps
    const lastFertilizer = activityGroups["FERTILIZER_APPLICATION"]?.lastDate;
    const fertilizerGapDays = lastFertilizer
      ? Math.floor((now.getTime() - lastFertilizer.getTime()) / (1000 * 60 * 60 * 24))
      : daysFromPlanting;

    const lastWeeding = activityGroups["WEEDING"]?.lastDate;
    const weedingGapDays = lastWeeding
      ? Math.floor((now.getTime() - lastWeeding.getTime()) / (1000 * 60 * 60 * 24))
      : daysFromPlanting;

    const lastActivity = entry.activities[0];

    return {
      id: entry.id,
      cropType: entry.crop.englishName,
      variety: entry.variety?.name,
      plantingDate,
      daysFromPlanting,
      expectedHarvestDate,
      daysToHarvest,
      status: entry.status,
      areaPlanted: entry.landArea || undefined,
      areaUnit: entry.landAreaUnit || undefined,
      lastActivity: lastActivity
        ? {
            type: lastActivity.type,
            date: lastActivity.date,
            daysSince: Math.floor(
              (now.getTime() - lastActivity.date.getTime()) / (1000 * 60 * 60 * 24)
            ),
          }
        : undefined,
      activitiesLogged,
      fertilizerGapDays,
      weedingGapDays,
      yieldQuantity: entry.yieldQuantity || undefined,
      yieldUnit: entry.yieldUnit || undefined,
    };
  });
}

async function buildLivestockContexts(userId: string, farmId?: string): Promise<LivestockContext[]> {
  const livestock = await db.livestockEntry.findMany({
    where: {
      userId,
      ...(farmId && { farmId }),
      status: "ACTIVE",
    },
    include: {
      livestock: true,
      breed: true,
      healthRecords: {
        orderBy: { date: "desc" },
        take: 20,
      },
    },
  });

  const now = new Date();

  return livestock.map((entry) => {
    const dateAcquired = entry.acquiredDate ? new Date(entry.acquiredDate) : now;
    const ageInDays = Math.floor(
      (now.getTime() - dateAcquired.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Find last vaccination and deworming
    const vaccinations = entry.healthRecords.filter((r) => r.type === "VACCINATION");
    const dewormings = entry.healthRecords.filter((r) => r.type === "DEWORMING");

    const lastVaccination = vaccinations[0];
    const lastDeworming = dewormings[0];

    return {
      id: entry.id,
      livestockType: entry.livestock.englishName,
      breed: entry.breed?.name,
      quantity: entry.quantity,
      dateAcquired,
      ageInDays,
      status: entry.status,
      lastVaccination: lastVaccination
        ? {
            name: lastVaccination.vaccineName || "Unknown",
            date: lastVaccination.date,
            daysSince: Math.floor(
              (now.getTime() - lastVaccination.date.getTime()) / (1000 * 60 * 60 * 24)
            ),
          }
        : undefined,
      lastDeworming: lastDeworming
        ? {
            date: lastDeworming.date,
            daysSince: Math.floor(
              (now.getTime() - lastDeworming.date.getTime()) / (1000 * 60 * 60 * 24)
            ),
          }
        : undefined,
      vaccinationsDue: [], // TODO: Calculate from schedules
      mortalityRate: undefined, // TODO: Calculate from records
      productionRate: undefined, // TODO: Calculate from production records
    };
  });
}

async function buildFinanceContext(userId: string, farmId?: string): Promise<FinanceContext> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const expenses = await db.expense.findMany({
    where: {
      userId,
      date: { gte: thirtyDaysAgo },
    },
  });

  const incomes = await db.income.findMany({
    where: {
      userId,
      date: { gte: thirtyDaysAgo },
    },
  });

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalIncome = incomes.reduce((sum, i) => sum + i.totalAmount, 0);

  const expensesByCategory: Record<string, number> = {};
  for (const expense of expenses) {
    expensesByCategory[expense.category] =
      (expensesByCategory[expense.category] || 0) + expense.amount;
  }

  const incomeByProduct: Record<string, number> = {};
  for (const income of incomes) {
    incomeByProduct[income.productType] =
      (incomeByProduct[income.productType] || 0) + income.totalAmount;
  }

  return {
    totalExpenses,
    totalIncome,
    netProfit: totalIncome - totalExpenses,
    cashFlow: totalIncome - totalExpenses,
    expensesByCategory,
    incomeByProduct,
  };
}

// ============================================
// MAIN CONTEXT BUILDER
// ============================================

export async function buildEvaluationContext(
  userId: string,
  farmId?: string
): Promise<EvaluationContext> {
  const [farm, crops, livestock, finance] = await Promise.all([
    buildFarmContext(userId, farmId),
    buildCropContexts(userId, farmId),
    buildLivestockContexts(userId, farmId),
    buildFinanceContext(userId, farmId),
  ]);

  return {
    userId,
    farm,
    crops,
    livestock,
    weather: undefined, // TODO: Fetch from weather API
    market: undefined, // TODO: Fetch from market prices
    finance,
    currentDate: new Date(),
    currentSeason: getCurrentSeason(),
  };
}

export default buildEvaluationContext;
