"use client";

import { useState, useEffect, ReactNode } from "react";
import Link from "next/link";
import { Lock, Sparkles, Crown, Building2 } from "lucide-react";

interface FeatureGateProps {
  feature: string;
  children: ReactNode;
  fallback?: ReactNode;
  showUpgradePrompt?: boolean;
}

interface UserFeatures {
  tier: string;
  features: Record<string, boolean>;
  limits: Record<string, { current: number; limit: number; remaining: number }>;
}

const tierIcons: Record<string, typeof Lock> = {
  PRO: Sparkles,
  BUSINESS: Crown,
  ENTERPRISE: Building2,
};

const tierColors: Record<string, string> = {
  PRO: "text-blue-600 bg-blue-100",
  BUSINESS: "text-purple-600 bg-purple-100",
  ENTERPRISE: "text-amber-600 bg-amber-100",
};

const featureTiers: Record<string, string> = {
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

export function FeatureGate({ 
  feature, 
  children, 
  fallback,
  showUpgradePrompt = true 
}: FeatureGateProps) {
  const [userFeatures, setUserFeatures] = useState<UserFeatures | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserFeatures();
  }, []);

  async function fetchUserFeatures() {
    try {
      const res = await fetch("/api/user/features");
      if (res.ok) {
        const data = await res.json();
        setUserFeatures(data);
      }
    } catch (error) {
      console.error("Error fetching user features:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="animate-pulse bg-gray-100 rounded-lg h-20" />;
  }

  const hasAccess = userFeatures?.features?.[feature] ?? false;

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showUpgradePrompt) {
    return null;
  }

  const requiredTier = featureTiers[feature] || "PRO";
  const TierIcon = tierIcons[requiredTier] || Lock;
  const tierColor = tierColors[requiredTier] || "text-gray-600 bg-gray-100";

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
        <div className="text-center p-6">
          <div className={`inline-flex p-3 rounded-full ${tierColor} mb-3`}>
            <TierIcon className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">
            {requiredTier} Feature
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Upgrade to {requiredTier} to unlock this feature
          </p>
          <Link
            href="/dashboard/settings/subscription"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm"
          >
            <Sparkles className="h-4 w-4" />
            Upgrade Now
          </Link>
        </div>
      </div>
      <div className="opacity-30 pointer-events-none">
        {children}
      </div>
    </div>
  );
}

// Badge component to show feature tier requirement
export function FeatureBadge({ feature }: { feature: string }) {
  const requiredTier = featureTiers[feature] || "PRO";
  const TierIcon = tierIcons[requiredTier] || Lock;
  const tierColor = tierColors[requiredTier] || "text-gray-600 bg-gray-100";

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${tierColor}`}>
      <TierIcon className="h-3 w-3" />
      {requiredTier}
    </span>
  );
}

// Hook to check feature access
export function useFeatureAccess(feature: string): {
  hasAccess: boolean;
  loading: boolean;
  tier: string | null;
} {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tier, setTier] = useState<string | null>(null);

  useEffect(() => {
    async function check() {
      try {
        const res = await fetch("/api/user/features");
        if (res.ok) {
          const data = await res.json();
          setHasAccess(data.features?.[feature] ?? false);
          setTier(data.tier);
        }
      } catch (error) {
        console.error("Error checking feature access:", error);
      } finally {
        setLoading(false);
      }
    }
    check();
  }, [feature]);

  return { hasAccess, loading, tier };
}

// Limit indicator component
export function LimitIndicator({ 
  limitType,
  showBar = true 
}: { 
  limitType: string;
  showBar?: boolean;
}) {
  const [limits, setLimits] = useState<{ current: number; limit: number; remaining: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLimits() {
      try {
        const res = await fetch("/api/user/features");
        if (res.ok) {
          const data = await res.json();
          setLimits(data.limits?.[limitType]);
        }
      } catch (error) {
        console.error("Error fetching limits:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchLimits();
  }, [limitType]);

  if (loading || !limits) {
    return null;
  }

  const percentage = limits.limit > 0 ? (limits.current / limits.limit) * 100 : 0;
  const isNearLimit = percentage >= 80;
  const isAtLimit = limits.remaining <= 0;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">{limits.current} / {limits.limit}</span>
        {isAtLimit && (
          <Link href="/dashboard/settings/subscription" className="text-primary text-xs hover:underline">
            Upgrade
          </Link>
        )}
      </div>
      {showBar && (
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all ${
              isAtLimit ? "bg-red-500" : isNearLimit ? "bg-yellow-500" : "bg-green-500"
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}

// Upgrade prompt card
export function UpgradePrompt({ 
  tier = "PRO",
  title,
  description,
  features = []
}: {
  tier?: "PRO" | "BUSINESS" | "ENTERPRISE";
  title?: string;
  description?: string;
  features?: string[];
}) {
  const TierIcon = tierIcons[tier] || Sparkles;
  const tierColor = tierColors[tier] || "text-blue-600 bg-blue-100";

  return (
    <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-6">
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-full ${tierColor}`}>
          <TierIcon className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">
            {title || `Upgrade to ${tier}`}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {description || `Unlock powerful features with our ${tier} plan`}
          </p>
          {features.length > 0 && (
            <ul className="text-sm text-gray-600 space-y-1 mb-4">
              {features.map((f, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  {f}
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/dashboard/settings/subscription"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm"
          >
            <Sparkles className="h-4 w-4" />
            View Plans
          </Link>
        </div>
      </div>
    </div>
  );
}
