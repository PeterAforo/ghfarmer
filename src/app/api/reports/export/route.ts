// Export Reports API - Pro feature (PDF/Excel)
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireFeature, trackUsage } from "@/lib/feature-gate";

export async function POST(request: NextRequest) {
  try {
    // Check feature access
    const gate = await requireFeature("exportReports");
    if (!gate.allowed) {
      return NextResponse.json(
        { error: gate.error?.message, upgradeRequired: true },
        { status: gate.error?.status || 403 }
      );
    }

    const userId = gate.userId!;
    const body = await request.json();
    const { reportType, format, dateRange, filters } = body;

    // Validate inputs
    if (!reportType || !format) {
      return NextResponse.json(
        { error: "Report type and format are required" },
        { status: 400 }
      );
    }

    if (!["pdf", "excel", "csv"].includes(format)) {
      return NextResponse.json(
        { error: "Invalid format. Use pdf, excel, or csv" },
        { status: 400 }
      );
    }

    // Get date range
    const startDate = dateRange?.start ? new Date(dateRange.start) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = dateRange?.end ? new Date(dateRange.end) : new Date();

    let reportData: any;
    let reportTitle: string;

    switch (reportType) {
      case "financial":
        reportData = await generateFinancialReport(userId, startDate, endDate);
        reportTitle = "Financial Report";
        break;
      case "crops":
        reportData = await generateCropReport(userId, startDate, endDate);
        reportTitle = "Crop Report";
        break;
      case "livestock":
        reportData = await generateLivestockReport(userId, startDate, endDate);
        reportTitle = "Livestock Report";
        break;
      case "inventory":
        reportData = await generateInventoryReport(userId);
        reportTitle = "Inventory Report";
        break;
      case "loan-eligibility":
        reportData = await generateLoanEligibilityReport(userId);
        reportTitle = "Loan Eligibility Report";
        break;
      default:
        return NextResponse.json(
          { error: "Invalid report type" },
          { status: 400 }
        );
    }

    // Track usage
    await trackUsage(userId, "exportsGenerated");

    // For now, return JSON data that frontend can format
    // In production, you'd use libraries like pdfmake, exceljs, etc.
    return NextResponse.json({
      success: true,
      report: {
        title: reportTitle,
        generatedAt: new Date().toISOString(),
        period: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        },
        format,
        data: reportData,
      },
    });
  } catch (error) {
    console.error("Error generating report:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}

async function generateFinancialReport(userId: string, startDate: Date, endDate: Date) {
  const [expenses, incomes] = await Promise.all([
    db.expense.findMany({
      where: { userId, date: { gte: startDate, lte: endDate } },
      orderBy: { date: "desc" },
      select: {
        id: true,
        category: true,
        amount: true,
        date: true,
        description: true,
        paymentMethod: true,
      },
    }),
    db.income.findMany({
      where: { userId, date: { gte: startDate, lte: endDate } },
      orderBy: { date: "desc" },
      select: {
        id: true,
        productType: true,
        totalAmount: true,
        date: true,
        notes: true,
      },
    }),
  ]);

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

  return {
    summary: {
      totalIncome,
      totalExpenses,
      netProfit: totalIncome - totalExpenses,
      profitMargin: totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100).toFixed(2) : 0,
      transactionCount: expenses.length + incomes.length,
    },
    expensesByCategory: Object.entries(expensesByCategory).map(([category, data]) => ({
      category,
      total: data.total,
      count: data.count,
    })),
    incomesByCategory: Object.entries(incomesByType).map(([category, data]) => ({
      category,
      total: data.total,
      count: data.count,
    })),
    transactions: {
      expenses: expenses.map(e => ({
        ...e,
        date: e.date.toISOString().split("T")[0],
      })),
      incomes: incomes.map(i => ({
        id: i.id,
        category: i.productType,
        amount: i.totalAmount,
        date: i.date.toISOString().split("T")[0],
        description: i.notes,
      })),
    },
  };
}

async function generateCropReport(userId: string, startDate: Date, endDate: Date) {
  const [crops, activities] = await Promise.all([
    db.cropEntry.findMany({
      where: { userId },
      include: {
        farm: { select: { name: true } },
        crop: { select: { englishName: true } },
        variety: { select: { name: true } },
      },
      orderBy: { plantingDate: "desc" },
    }),
    db.cropActivity.findMany({
      where: { 
        cropEntry: { userId },
        date: { gte: startDate, lte: endDate },
      },
      include: {
        cropEntry: { 
          include: { 
            crop: { select: { englishName: true } },
            variety: { select: { name: true } },
          },
        },
      },
      orderBy: { date: "desc" },
    }),
  ]);

  const totalArea = crops.reduce((sum, c) => sum + (c.landArea || 0), 0);
  const totalYield = crops.reduce((sum, c) => sum + (c.yieldQuantity || 0), 0);
  const totalActivityCost = activities.reduce((sum, a) => sum + (a.cost || 0), 0);

  return {
    summary: {
      totalCrops: crops.length,
      totalArea,
      totalYield,
      averageYieldPerHa: totalArea > 0 ? (totalYield / totalArea).toFixed(2) : 0,
      totalActivityCost,
    },
    crops: crops.map(c => ({
      id: c.id,
      cropType: c.crop?.englishName || "Unknown",
      variety: c.variety?.name,
      farm: c.farm?.name,
      areaPlanted: c.landArea,
      plantingDate: c.plantingDate?.toISOString().split("T")[0],
      expectedHarvestDate: c.expectedHarvestDate?.toISOString().split("T")[0],
      status: c.status,
      expectedYield: c.expectedYield,
      actualYield: c.yieldQuantity,
    })),
    activities: activities.map(a => ({
      date: a.date.toISOString().split("T")[0],
      crop: `${a.cropEntry.crop?.englishName || "Unknown"} - ${a.cropEntry.variety?.name || "N/A"}`,
      activityType: a.type,
      description: a.notes,
      cost: a.cost,
    })),
    yieldAnalysis: crops.filter(c => c.yieldQuantity).map(c => ({
      cropType: c.crop?.englishName || "Unknown",
      variety: c.variety?.name,
      expected: c.expectedYield,
      actual: c.yieldQuantity,
      variance: c.expectedYield ? (((c.yieldQuantity || 0) - c.expectedYield) / c.expectedYield * 100).toFixed(1) : 0,
      harvestDate: c.actualHarvestDate?.toISOString().split("T")[0],
    })),
  };
}

async function generateLivestockReport(userId: string, startDate: Date, endDate: Date) {
  const [livestock, healthRecords, productionRecords] = await Promise.all([
    db.livestockEntry.findMany({
      where: { userId },
      include: {
        farm: { select: { name: true } },
        livestock: { select: { englishName: true } },
        breed: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.healthRecord.findMany({
      where: {
        livestockEntry: { userId },
        date: { gte: startDate, lte: endDate },
      },
      include: {
        livestockEntry: { 
          include: { 
            livestock: { select: { englishName: true } },
          },
        },
      },
      orderBy: { date: "desc" },
    }),
    db.productionRecord.findMany({
      where: {
        livestockEntry: { userId },
        date: { gte: startDate, lte: endDate },
      },
      include: {
        livestockEntry: { 
          include: { 
            livestock: { select: { englishName: true } },
          },
        },
      },
      orderBy: { date: "desc" },
    }),
  ]);

  const totalAnimals = livestock.reduce((sum, l) => sum + (l.quantity || 1), 0);
  const deceasedCount = livestock.filter(l => l.status === "DECEASED").length;
  const totalHealthCost = healthRecords.reduce((sum, h) => sum + (h.cost || 0), 0);
  const totalProductionValue = productionRecords.reduce((sum, p) => sum + (p.actualRevenue || 0), 0);

  return {
    summary: {
      totalEntries: livestock.length,
      totalAnimals,
      deceasedCount,
      mortalityRate: totalAnimals > 0 ? ((deceasedCount / totalAnimals) * 100).toFixed(2) : 0,
      totalHealthCost,
      totalProductionValue,
    },
    livestock: livestock.map(l => ({
      id: l.id,
      type: l.livestock?.englishName || "Unknown",
      breed: l.breed?.name,
      tagNumber: l.tagNumber,
      farm: l.farm?.name,
      quantity: l.quantity,
      status: l.status,
      acquiredDate: l.acquiredDate?.toISOString().split("T")[0],
    })),
    healthRecords: healthRecords.map(h => ({
      date: h.date.toISOString().split("T")[0],
      animal: `${h.livestockEntry.livestock?.englishName || "Unknown"} - ${h.livestockEntry.tagNumber || "N/A"}`,
      recordType: h.type,
      diagnosis: h.diagnosis,
      cost: h.cost,
      veterinarian: h.veterinarian,
    })),
    productionRecords: productionRecords.map(p => ({
      date: p.date.toISOString().split("T")[0],
      animal: `${p.livestockEntry.livestock?.englishName || "Unknown"} - ${p.livestockEntry.tagNumber || "N/A"}`,
      productionType: p.type,
      eggCount: p.actualEggCount,
      milkVolume: p.actualMilkVolume,
      weight: p.actualWeight,
      revenue: p.actualRevenue,
    })),
  };
}

async function generateInventoryReport(userId: string) {
  const inventory = await db.inventoryItem.findMany({
    where: { userId },
    include: {
      movements: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
    orderBy: { name: "asc" },
  });

  const totalValue = inventory.reduce((sum, i) => sum + (i.totalValue || 0), 0);
  const lowStockItems = inventory.filter(i => 
    i.minQuantity && i.quantity <= i.minQuantity
  );
  const expiringSoon = inventory.filter(i => {
    if (!i.expiryDate) return false;
    const daysUntilExpiry = (i.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  });

  return {
    summary: {
      totalItems: inventory.length,
      totalValue,
      lowStockCount: lowStockItems.length,
      expiringSoonCount: expiringSoon.length,
    },
    items: inventory.map(i => ({
      id: i.id,
      name: i.name,
      category: i.category,
      sku: i.sku,
      quantity: i.quantity,
      unit: i.unit,
      unitCost: i.unitCost,
      totalValue: i.totalValue,
      minQuantity: i.minQuantity,
      status: i.status,
      expiryDate: i.expiryDate?.toISOString().split("T")[0],
      supplierName: i.supplierName,
      location: i.location,
    })),
    lowStockAlerts: lowStockItems.map(i => ({
      name: i.name,
      currentQuantity: i.quantity,
      minQuantity: i.minQuantity,
      unit: i.unit,
    })),
    expiringItems: expiringSoon.map(i => ({
      name: i.name,
      quantity: i.quantity,
      expiryDate: i.expiryDate?.toISOString().split("T")[0],
    })),
  };
}

async function generateLoanEligibilityReport(userId: string) {
  // Get comprehensive farm data for loan assessment
  const [user, farms, crops, livestock, expenses, incomes] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        phone: true,
        region: true,
        district: true,
        createdAt: true,
      },
    }),
    db.farm.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        size: true,
        sizeUnit: true,
        region: true,
      },
    }),
    db.cropEntry.findMany({
      where: { userId },
      include: {
        crop: { select: { englishName: true } },
      },
    }),
    db.livestockEntry.findMany({
      where: { userId },
      include: {
        livestock: { select: { englishName: true } },
      },
    }),
    db.expense.findMany({
      where: { 
        userId,
        date: { gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) },
      },
      select: { amount: true },
    }),
    db.income.findMany({
      where: { 
        userId,
        date: { gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) },
      },
      select: { totalAmount: true },
    }),
  ]);

  const totalFarmSize = farms.reduce((sum, f) => sum + (f.size || 0), 0);
  const totalLivestock = livestock.reduce((sum, l) => sum + (l.quantity || 1), 0);
  const annualIncome = incomes.reduce((sum, i) => sum + i.totalAmount, 0);
  const annualExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = annualIncome - annualExpenses;

  // Calculate eligibility score (simplified)
  let eligibilityScore = 0;
  const factors: { factor: string; score: number; maxScore: number; notes: string }[] = [];

  // Farm size factor (max 20 points)
  const farmSizeScore = Math.min(totalFarmSize * 2, 20);
  factors.push({
    factor: "Farm Size",
    score: farmSizeScore,
    maxScore: 20,
    notes: `${totalFarmSize.toFixed(1)} hectares total`,
  });
  eligibilityScore += farmSizeScore;

  // Crop diversity (max 15 points)
  const uniqueCrops = new Set(crops.map(c => c.crop?.englishName)).size;
  const cropDiversityScore = Math.min(uniqueCrops * 3, 15);
  factors.push({
    factor: "Crop Diversity",
    score: cropDiversityScore,
    maxScore: 15,
    notes: `${uniqueCrops} different crop types`,
  });
  eligibilityScore += cropDiversityScore;

  // Livestock assets (max 15 points)
  const livestockScore = Math.min(totalLivestock * 0.5, 15);
  factors.push({
    factor: "Livestock Assets",
    score: livestockScore,
    maxScore: 15,
    notes: `${totalLivestock} animals`,
  });
  eligibilityScore += livestockScore;

  // Financial history (max 25 points)
  const hasPositiveProfit = netProfit > 0;
  const financialScore = hasPositiveProfit ? 25 : Math.max(0, 25 + (netProfit / 1000));
  factors.push({
    factor: "Financial Performance",
    score: Math.max(0, financialScore),
    maxScore: 25,
    notes: `Net profit: GHS ${netProfit.toLocaleString()}`,
  });
  eligibilityScore += Math.max(0, financialScore);

  // Record keeping (max 15 points)
  const totalRecords = expenses.length + incomes.length + crops.length + livestock.length;
  const recordScore = Math.min(totalRecords * 0.5, 15);
  factors.push({
    factor: "Record Keeping",
    score: recordScore,
    maxScore: 15,
    notes: `${totalRecords} records maintained`,
  });
  eligibilityScore += recordScore;

  // Account age (max 10 points)
  const accountAgeDays = user ? (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24) : 0;
  const accountAgeScore = Math.min(accountAgeDays / 30, 10);
  factors.push({
    factor: "Account History",
    score: accountAgeScore,
    maxScore: 10,
    notes: `${Math.floor(accountAgeDays)} days on platform`,
  });
  eligibilityScore += accountAgeScore;

  // Determine eligibility tier
  let eligibilityTier: string;
  let maxLoanAmount: number;
  if (eligibilityScore >= 80) {
    eligibilityTier = "Premium";
    maxLoanAmount = 50000;
  } else if (eligibilityScore >= 60) {
    eligibilityTier = "Standard";
    maxLoanAmount = 25000;
  } else if (eligibilityScore >= 40) {
    eligibilityTier = "Basic";
    maxLoanAmount = 10000;
  } else {
    eligibilityTier = "Building Credit";
    maxLoanAmount = 5000;
  }

  return {
    farmer: {
      name: user?.name,
      email: user?.email,
      phone: user?.phone,
      region: user?.region,
      district: user?.district,
      memberSince: user?.createdAt.toISOString().split("T")[0],
    },
    assets: {
      farms: farms.length,
      totalFarmSize,
      cropEntries: crops.length,
      livestockEntries: livestock.length,
      totalLivestock,
    },
    financials: {
      annualIncome,
      annualExpenses,
      netProfit,
      profitMargin: annualIncome > 0 ? ((netProfit / annualIncome) * 100).toFixed(1) : 0,
    },
    eligibility: {
      score: Math.round(eligibilityScore),
      maxScore: 100,
      tier: eligibilityTier,
      maxLoanAmount,
      factors,
    },
    recommendations: [
      eligibilityScore < 40 ? "Add more farm records to improve your score" : null,
      uniqueCrops < 3 ? "Diversify your crops to improve eligibility" : null,
      netProfit < 0 ? "Work on improving profitability" : null,
      totalRecords < 20 ? "Maintain more detailed records" : null,
    ].filter(Boolean),
  };
}
