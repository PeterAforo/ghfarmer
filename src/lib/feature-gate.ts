// Feature gating utilities for tier-based access control
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { 
  getUserSubscriptionTier, 
  hasFeatureAccess, 
  checkPlanLimit,
  incrementUsage,
  type SubscriptionTier 
} from "./subscription";

// Feature gate result
export interface FeatureGateResult {
  allowed: boolean;
  reason?: string;
  upgradeRequired?: SubscriptionTier;
  currentTier?: SubscriptionTier;
  limit?: number;
  current?: number;
}

// Check if user can access a feature
export async function gateFeature(
  userId: string,
  feature: string
): Promise<FeatureGateResult> {
  const tier = await getUserSubscriptionTier(userId);
  const hasAccess = await hasFeatureAccess(userId, feature);
  
  if (hasAccess) {
    return { allowed: true, currentTier: tier };
  }
  
  // Determine which tier is required
  const featureTiers: Record<string, SubscriptionTier> = {
    advancedAnalytics: "PRO",
    realTimePrices: "PRO",
    weatherForecasts: "PRO",
    exportReports: "PRO",
    offlineMode: "PRO",
    prioritySupport: "PRO",
    inventoryManagement: "BUSINESS",
    multiUserAccess: "BUSINESS",
    apiAccess: "BUSINESS",
    bulkOperations: "BUSINESS",
    financialIntegration: "BUSINESS",
    loanEligibilityReports: "BUSINESS",
    unlimitedDse: "BUSINESS",
    supplierIntegration: "BUSINESS",
    whiteLabel: "ENTERPRISE",
    dedicatedSupport: "ENTERPRISE",
    customReporting: "ENTERPRISE",
    slaGuarantee: "ENTERPRISE",
  };
  
  return {
    allowed: false,
    reason: `This feature requires ${featureTiers[feature] || "PRO"} plan or higher`,
    upgradeRequired: featureTiers[feature] || "PRO",
    currentTier: tier,
  };
}

// Check if user can perform an action within their limits
export async function gateLimitedAction(
  userId: string,
  limitType: "farms" | "plots" | "records" | "priceAlerts" | "dseRecommendations" | "exports" | "listings"
): Promise<FeatureGateResult> {
  const tier = await getUserSubscriptionTier(userId);
  const limitCheck = await checkPlanLimit(userId, limitType);
  
  if (limitCheck.allowed) {
    return { 
      allowed: true, 
      currentTier: tier,
      limit: limitCheck.limit,
      current: limitCheck.current,
    };
  }
  
  // Determine upgrade tier based on limit type
  const upgradeTier: SubscriptionTier = tier === "FREE" ? "PRO" : "BUSINESS";
  
  return {
    allowed: false,
    reason: `You've reached your ${limitType} limit (${limitCheck.current}/${limitCheck.limit}). Upgrade to add more.`,
    upgradeRequired: upgradeTier,
    currentTier: tier,
    limit: limitCheck.limit,
    current: limitCheck.current,
  };
}

// Middleware-style function for API routes
export async function requireFeature(feature: string): Promise<{
  allowed: boolean;
  error?: { status: number; message: string };
  userId?: string;
}> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return {
      allowed: false,
      error: { status: 401, message: "Unauthorized" },
    };
  }
  
  const result = await gateFeature(session.user.id, feature);
  
  if (!result.allowed) {
    return {
      allowed: false,
      error: { 
        status: 403, 
        message: result.reason || "Feature not available on your plan",
      },
      userId: session.user.id,
    };
  }
  
  return { allowed: true, userId: session.user.id };
}

// Middleware-style function for limited actions
export async function requireLimit(
  limitType: "farms" | "plots" | "records" | "priceAlerts" | "dseRecommendations" | "exports" | "listings"
): Promise<{
  allowed: boolean;
  error?: { status: number; message: string; limit?: number; current?: number };
  userId?: string;
}> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return {
      allowed: false,
      error: { status: 401, message: "Unauthorized" },
    };
  }
  
  const result = await gateLimitedAction(session.user.id, limitType);
  
  if (!result.allowed) {
    return {
      allowed: false,
      error: { 
        status: 403, 
        message: result.reason || "Limit reached",
        limit: result.limit,
        current: result.current,
      },
      userId: session.user.id,
    };
  }
  
  return { allowed: true, userId: session.user.id };
}

// Track usage after successful action
export async function trackUsage(
  userId: string,
  usageType: "recordsCreated" | "apiCalls" | "dseRecommendations" | "exportsGenerated" | "priceAlertsCreated" | "listingsCreated",
  amount: number = 1
): Promise<void> {
  await incrementUsage(userId, usageType, amount);
}

// Higher-order function to wrap API handlers with feature gating
export function withFeatureGate(feature: string) {
  return async function checkGate(): Promise<FeatureGateResult & { userId?: string }> {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return { allowed: false, reason: "Unauthorized" };
    }
    
    const result = await gateFeature(session.user.id, feature);
    return { ...result, userId: session.user.id };
  };
}

// Higher-order function to wrap API handlers with limit checking
export function withLimitGate(
  limitType: "farms" | "plots" | "records" | "priceAlerts" | "dseRecommendations" | "exports" | "listings"
) {
  return async function checkGate(): Promise<FeatureGateResult & { userId?: string }> {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return { allowed: false, reason: "Unauthorized" };
    }
    
    const result = await gateLimitedAction(session.user.id, limitType);
    return { ...result, userId: session.user.id };
  };
}

// Check multiple features at once
export async function gateMultipleFeatures(
  userId: string,
  features: string[]
): Promise<Record<string, FeatureGateResult>> {
  const results: Record<string, FeatureGateResult> = {};
  
  for (const feature of features) {
    results[feature] = await gateFeature(userId, feature);
  }
  
  return results;
}

// Get all available features for a user
export async function getUserFeatures(userId: string): Promise<{
  tier: SubscriptionTier;
  features: Record<string, boolean>;
  limits: Record<string, { current: number; limit: number; remaining: number }>;
}> {
  const tier = await getUserSubscriptionTier(userId);
  
  const allFeatures = [
    "advancedAnalytics",
    "realTimePrices",
    "weatherForecasts",
    "exportReports",
    "offlineMode",
    "prioritySupport",
    "inventoryManagement",
    "multiUserAccess",
    "apiAccess",
    "bulkOperations",
    "financialIntegration",
    "loanEligibilityReports",
    "unlimitedDse",
    "supplierIntegration",
  ];
  
  const features: Record<string, boolean> = {};
  for (const feature of allFeatures) {
    features[feature] = await hasFeatureAccess(userId, feature);
  }
  
  const limitTypes = ["farms", "plots", "records", "priceAlerts", "dseRecommendations", "exports", "listings"] as const;
  const limits: Record<string, { current: number; limit: number; remaining: number }> = {};
  
  for (const limitType of limitTypes) {
    const check = await checkPlanLimit(userId, limitType);
    limits[limitType] = {
      current: check.current,
      limit: check.limit,
      remaining: check.remaining,
    };
  }
  
  return { tier, features, limits };
}
