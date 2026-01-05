// Subscription management utilities
import { db } from "./db";

// Plan feature definitions
export const PLAN_FEATURES = {
  FREE: {
    maxFarms: 1,
    maxPlots: 5,
    maxRecordsPerMonth: 50,
    maxUsers: 1,
    maxPriceAlerts: 3,
    maxDseRecommendations: 5,
    maxExportsPerMonth: 0,
    maxListings: 5,
    features: {
      advancedAnalytics: false,
      realTimePrices: false,
      weatherForecasts: false,
      exportReports: false,
      offlineMode: false,
      prioritySupport: false,
      inventoryManagement: false,
      multiUserAccess: false,
      apiAccess: false,
      bulkOperations: false,
      financialIntegration: false,
      loanEligibilityReports: false,
      unlimitedDse: false,
      supplierIntegration: false,
    },
  },
  PRO: {
    maxFarms: -1, // Unlimited
    maxPlots: -1,
    maxRecordsPerMonth: -1,
    maxUsers: 1,
    maxPriceAlerts: -1,
    maxDseRecommendations: 10,
    maxExportsPerMonth: 20,
    maxListings: 20,
    features: {
      advancedAnalytics: true,
      realTimePrices: true,
      weatherForecasts: true,
      exportReports: true,
      offlineMode: true,
      prioritySupport: true,
      inventoryManagement: false,
      multiUserAccess: false,
      apiAccess: false,
      bulkOperations: false,
      financialIntegration: false,
      loanEligibilityReports: false,
      unlimitedDse: false,
      supplierIntegration: false,
    },
  },
  BUSINESS: {
    maxFarms: -1,
    maxPlots: -1,
    maxRecordsPerMonth: -1,
    maxUsers: 5,
    maxPriceAlerts: -1,
    maxDseRecommendations: -1,
    maxExportsPerMonth: -1,
    maxListings: -1,
    features: {
      advancedAnalytics: true,
      realTimePrices: true,
      weatherForecasts: true,
      exportReports: true,
      offlineMode: true,
      prioritySupport: true,
      inventoryManagement: true,
      multiUserAccess: true,
      apiAccess: true,
      bulkOperations: true,
      financialIntegration: true,
      loanEligibilityReports: true,
      unlimitedDse: true,
      supplierIntegration: true,
    },
  },
  ENTERPRISE: {
    maxFarms: -1,
    maxPlots: -1,
    maxRecordsPerMonth: -1,
    maxUsers: -1,
    maxPriceAlerts: -1,
    maxDseRecommendations: -1,
    maxExportsPerMonth: -1,
    maxListings: -1,
    features: {
      advancedAnalytics: true,
      realTimePrices: true,
      weatherForecasts: true,
      exportReports: true,
      offlineMode: true,
      prioritySupport: true,
      inventoryManagement: true,
      multiUserAccess: true,
      apiAccess: true,
      bulkOperations: true,
      financialIntegration: true,
      loanEligibilityReports: true,
      unlimitedDse: true,
      supplierIntegration: true,
      whiteLabel: true,
      dedicatedSupport: true,
      customReporting: true,
      slaGuarantee: true,
    },
  },
};

// Service provider plan features
export const PROVIDER_PLAN_FEATURES = {
  BASIC: {
    maxListings: 5,
    features: {
      verifiedBadge: false,
      featuredInSearch: false,
      analytics: false,
      directMessaging: false,
      bookingManagement: false,
      promotionalTools: false,
      bulkMessaging: false,
      deliveryIntegration: false,
    },
  },
  VERIFIED: {
    maxListings: -1,
    features: {
      verifiedBadge: true,
      featuredInSearch: true,
      analytics: true,
      directMessaging: true,
      bookingManagement: true,
      promotionalTools: false,
      bulkMessaging: false,
      deliveryIntegration: false,
    },
  },
  PREMIUM: {
    maxListings: -1,
    features: {
      verifiedBadge: true,
      featuredInSearch: true,
      analytics: true,
      directMessaging: true,
      bookingManagement: true,
      promotionalTools: true,
      bulkMessaging: true,
      deliveryIntegration: true,
      homepageFeatured: true,
      priorityRecommendations: true,
    },
  },
};

export type SubscriptionTier = "FREE" | "PRO" | "BUSINESS" | "ENTERPRISE";
export type ProviderTier = "BASIC" | "VERIFIED" | "PREMIUM";

// Get user's current subscription tier
export async function getUserSubscriptionTier(userId: string): Promise<SubscriptionTier> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { subscription: true },
  });
  
  return (user?.subscription as SubscriptionTier) || "FREE";
}

// Get user's active subscription with plan details
export async function getUserSubscription(userId: string) {
  const subscription = await db.subscription.findFirst({
    where: {
      userId,
      status: { in: ["ACTIVE", "TRIALING"] },
    },
    include: {
      plan: true,
    },
    orderBy: { createdAt: "desc" },
  });
  
  return subscription;
}

// Get plan limits for a tier
export function getPlanLimits(tier: SubscriptionTier) {
  return PLAN_FEATURES[tier] || PLAN_FEATURES.FREE;
}

// Check if user has access to a feature
export async function hasFeatureAccess(userId: string, feature: string): Promise<boolean> {
  const tier = await getUserSubscriptionTier(userId);
  const planFeatures = PLAN_FEATURES[tier]?.features || {};
  return planFeatures[feature as keyof typeof planFeatures] === true;
}

// Check if user is within their plan limits
export async function checkPlanLimit(
  userId: string,
  limitType: "farms" | "plots" | "records" | "priceAlerts" | "dseRecommendations" | "exports" | "listings"
): Promise<{ allowed: boolean; current: number; limit: number; remaining: number }> {
  const tier = await getUserSubscriptionTier(userId);
  const limits = getPlanLimits(tier);
  
  let current = 0;
  let limit = 0;
  
  switch (limitType) {
    case "farms":
      limit = limits.maxFarms;
      current = await db.farm.count({ where: { userId } });
      break;
    case "plots":
      limit = limits.maxPlots;
      current = await db.plot.count({ where: { userId } });
      break;
    case "records":
      limit = limits.maxRecordsPerMonth;
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      current = await getMonthlyRecordCount(userId, startOfMonth);
      break;
    case "priceAlerts":
      limit = limits.maxPriceAlerts;
      current = await db.priceAlert.count({ where: { userId, isActive: true } });
      break;
    case "dseRecommendations":
      limit = limits.maxDseRecommendations;
      current = await getMonthlyDseCount(userId);
      break;
    case "exports":
      limit = limits.maxExportsPerMonth;
      current = await getMonthlyExportCount(userId);
      break;
    case "listings":
      limit = limits.maxListings;
      current = await db.marketListing.count({ where: { userId, status: "ACTIVE" } });
      break;
  }
  
  // -1 means unlimited
  const allowed = limit === -1 || current < limit;
  const remaining = limit === -1 ? -1 : Math.max(0, limit - current);
  
  return { allowed, current, limit, remaining };
}

// Get monthly record count (crops, livestock, expenses, etc.)
async function getMonthlyRecordCount(userId: string, startOfMonth: Date): Promise<number> {
  const [crops, livestock, expenses, incomes, tasks] = await Promise.all([
    db.cropEntry.count({ where: { userId, createdAt: { gte: startOfMonth } } }),
    db.livestockEntry.count({ where: { userId, createdAt: { gte: startOfMonth } } }),
    db.expense.count({ where: { userId, createdAt: { gte: startOfMonth } } }),
    db.income.count({ where: { userId, createdAt: { gte: startOfMonth } } }),
    db.task.count({ where: { userId, createdAt: { gte: startOfMonth } } }),
  ]);
  
  return crops + livestock + expenses + incomes + tasks;
}

// Get monthly DSE recommendation count
async function getMonthlyDseCount(userId: string): Promise<number> {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  
  const usage = await db.usageTracking.findFirst({
    where: {
      userId,
      periodStart: startOfMonth,
    },
  });
  
  return usage?.dseRecommendations || 0;
}

// Get monthly export count
async function getMonthlyExportCount(userId: string): Promise<number> {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  
  const usage = await db.usageTracking.findFirst({
    where: {
      userId,
      periodStart: startOfMonth,
    },
  });
  
  return usage?.exportsGenerated || 0;
}

// Increment usage counter
export async function incrementUsage(
  userId: string,
  usageType: "recordsCreated" | "apiCalls" | "dseRecommendations" | "exportsGenerated" | "priceAlertsCreated" | "listingsCreated",
  amount: number = 1
) {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  
  const endOfMonth = new Date(startOfMonth);
  endOfMonth.setMonth(endOfMonth.getMonth() + 1);
  
  await db.usageTracking.upsert({
    where: {
      userId_periodStart: {
        userId,
        periodStart: startOfMonth,
      },
    },
    create: {
      userId,
      periodStart: startOfMonth,
      periodEnd: endOfMonth,
      [usageType]: amount,
    },
    update: {
      [usageType]: { increment: amount },
    },
  });
}

// Get user's usage for current period
export async function getCurrentUsage(userId: string) {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  
  const usage = await db.usageTracking.findFirst({
    where: {
      userId,
      periodStart: startOfMonth,
    },
  });
  
  return usage || {
    recordsCreated: 0,
    apiCalls: 0,
    dseRecommendations: 0,
    exportsGenerated: 0,
    priceAlertsCreated: 0,
    listingsCreated: 0,
    storageUsedMb: 0,
  };
}

// Calculate upgrade price
export function calculateUpgradePrice(
  currentTier: SubscriptionTier,
  newTier: SubscriptionTier,
  billingCycle: "MONTHLY" | "YEARLY",
  daysRemaining: number = 30
): { price: number; prorated: number; total: number } {
  const prices = {
    FREE: { monthly: 0, yearly: 0 },
    PRO: { monthly: 65, yearly: 650 },
    BUSINESS: { monthly: 200, yearly: 2000 },
    ENTERPRISE: { monthly: 0, yearly: 0 }, // Custom pricing
  };
  
  const currentPrice = billingCycle === "MONTHLY" 
    ? prices[currentTier].monthly 
    : prices[currentTier].yearly / 12;
  
  const newPrice = billingCycle === "MONTHLY"
    ? prices[newTier].monthly
    : prices[newTier].yearly / 12;
  
  const priceDiff = newPrice - currentPrice;
  const prorated = (priceDiff * daysRemaining) / 30;
  
  return {
    price: newPrice,
    prorated: Math.max(0, prorated),
    total: billingCycle === "MONTHLY" ? newPrice : prices[newTier].yearly,
  };
}

// Check if user can upgrade to a tier
export function canUpgradeTo(currentTier: SubscriptionTier, targetTier: SubscriptionTier): boolean {
  const tierOrder = ["FREE", "PRO", "BUSINESS", "ENTERPRISE"];
  return tierOrder.indexOf(targetTier) > tierOrder.indexOf(currentTier);
}

// Check if user can downgrade to a tier
export function canDowngradeTo(currentTier: SubscriptionTier, targetTier: SubscriptionTier): boolean {
  const tierOrder = ["FREE", "PRO", "BUSINESS", "ENTERPRISE"];
  return tierOrder.indexOf(targetTier) < tierOrder.indexOf(currentTier);
}

// Format feature name for display
export function formatFeatureName(feature: string): string {
  const featureNames: Record<string, string> = {
    advancedAnalytics: "Advanced Analytics",
    realTimePrices: "Real-time Market Prices",
    weatherForecasts: "7-Day Weather Forecasts",
    exportReports: "Export Reports (PDF/Excel)",
    offlineMode: "Offline Mode",
    prioritySupport: "Priority Support",
    inventoryManagement: "Inventory Management",
    multiUserAccess: "Multi-user Access",
    apiAccess: "API Access",
    bulkOperations: "Bulk Operations",
    financialIntegration: "Financial Integration",
    loanEligibilityReports: "Loan Eligibility Reports",
    unlimitedDse: "Unlimited AI Recommendations",
    supplierIntegration: "Supplier Integration",
    whiteLabel: "White-label Option",
    dedicatedSupport: "Dedicated Account Manager",
    customReporting: "Custom Reporting",
    slaGuarantee: "99.9% SLA Guarantee",
  };
  
  return featureNames[feature] || feature;
}

// Get all features for a tier with their status
export function getTierFeatures(tier: SubscriptionTier): { name: string; displayName: string; enabled: boolean }[] {
  const allFeatures = Object.keys(PLAN_FEATURES.ENTERPRISE.features);
  const tierFeatures = PLAN_FEATURES[tier]?.features || {};
  
  return allFeatures.map(feature => ({
    name: feature,
    displayName: formatFeatureName(feature),
    enabled: tierFeatures[feature as keyof typeof tierFeatures] === true,
  }));
}
