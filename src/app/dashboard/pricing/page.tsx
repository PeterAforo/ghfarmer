"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Check, X, Loader2, Crown, Zap, Building2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  currency: string;
  maxFarms: number;
  maxPlots: number;
  maxRecordsPerMonth: number;
  maxUsers: number;
  maxPriceAlerts: number;
  maxDseRecommendations: number;
  maxExportsPerMonth: number;
  maxListings: number;
  features: Record<string, boolean>;
  isPopular: boolean;
}

interface Subscription {
  tier: string;
  subscription: {
    id: string;
    status: string;
    billingCycle: string;
    endDate: string;
    plan: Plan;
  } | null;
}

const PLAN_ICONS: Record<string, React.ReactNode> = {
  free: <Sparkles className="h-6 w-6" />,
  pro: <Zap className="h-6 w-6" />,
  business: <Building2 className="h-6 w-6" />,
  enterprise: <Crown className="h-6 w-6" />,
};

const PLAN_COLORS: Record<string, string> = {
  free: "border-gray-200",
  pro: "border-green-500 ring-2 ring-green-500/20",
  business: "border-blue-500 ring-2 ring-blue-500/20",
  enterprise: "border-purple-500 ring-2 ring-purple-500/20",
};

const FEATURE_LIST = [
  { key: "maxFarms", label: "Farms", format: (v: number) => v === -1 ? "Unlimited" : v.toString() },
  { key: "maxPlots", label: "Plots", format: (v: number) => v === -1 ? "Unlimited" : v.toString() },
  { key: "maxRecordsPerMonth", label: "Records/month", format: (v: number) => v === -1 ? "Unlimited" : v.toString() },
  { key: "maxUsers", label: "Team members", format: (v: number) => v === -1 ? "Unlimited" : v.toString() },
  { key: "maxPriceAlerts", label: "Price alerts", format: (v: number) => v === -1 ? "Unlimited" : v.toString() },
  { key: "maxDseRecommendations", label: "AI recommendations/month", format: (v: number) => v === -1 ? "Unlimited" : v.toString() },
  { key: "maxExportsPerMonth", label: "Report exports/month", format: (v: number) => v === -1 ? "Unlimited" : v === 0 ? "—" : v.toString() },
];

const FEATURE_FLAGS = [
  { key: "advancedAnalytics", label: "Advanced Analytics" },
  { key: "realTimePrices", label: "Real-time Market Prices" },
  { key: "weatherForecasts", label: "7-Day Weather Forecasts" },
  { key: "exportReports", label: "Export Reports (PDF/Excel)" },
  { key: "offlineMode", label: "Offline Mode" },
  { key: "prioritySupport", label: "Priority Support" },
  { key: "inventoryManagement", label: "Inventory Management" },
  { key: "multiUserAccess", label: "Multi-user Access" },
  { key: "apiAccess", label: "API Access" },
  { key: "bulkOperations", label: "Bulk Operations" },
  { key: "financialIntegration", label: "Financial Integration" },
  { key: "loanEligibilityReports", label: "Loan Eligibility Reports" },
  { key: "unlimitedDse", label: "Unlimited AI Recommendations" },
  { key: "supplierIntegration", label: "Supplier Integration" },
];

export default function PricingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "YEARLY">("MONTHLY");
  const [isLoading, setIsLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
    if (session?.user) {
      fetchCurrentSubscription();
    }
  }, [session]);

  async function fetchPlans() {
    try {
      const response = await fetch("/api/subscriptions");
      if (response.ok) {
        const data = await response.json();
        setPlans(data);
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchCurrentSubscription() {
    try {
      const response = await fetch("/api/subscriptions/me");
      if (response.ok) {
        const data = await response.json();
        setCurrentSubscription(data);
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
    }
  }

  async function handleSubscribe(planId: string) {
    if (!session?.user) {
      router.push("/auth/login?callbackUrl=/dashboard/pricing");
      return;
    }

    setSubscribing(planId);
    try {
      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          billingCycle,
        }),
      });

      if (response.ok) {
        await fetchCurrentSubscription();
        router.push("/dashboard?upgraded=true");
      } else {
        const data = await response.json();
        alert(data.error || "Failed to subscribe");
      }
    } catch (error) {
      console.error("Error subscribing:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setSubscribing(null);
    }
  }

  function getButtonText(plan: Plan) {
    const currentTier = currentSubscription?.tier?.toLowerCase();
    const planSlug = plan.slug.toLowerCase();

    if (currentTier === planSlug) {
      return "Current Plan";
    }

    const tierOrder = ["free", "pro", "business", "enterprise"];
    const currentIndex = tierOrder.indexOf(currentTier || "free");
    const planIndex = tierOrder.indexOf(planSlug);

    if (planIndex > currentIndex) {
      return "Upgrade";
    } else if (planIndex < currentIndex) {
      return "Downgrade";
    }

    return "Select";
  }

  function isCurrentPlan(plan: Plan) {
    return currentSubscription?.tier?.toLowerCase() === plan.slug.toLowerCase();
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Unlock powerful features to grow your farm business. Start free and upgrade as you scale.
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <span className={billingCycle === "MONTHLY" ? "font-semibold" : "text-muted-foreground"}>
            Monthly
          </span>
          <button
            onClick={() => setBillingCycle(billingCycle === "MONTHLY" ? "YEARLY" : "MONTHLY")}
            className={`relative w-14 h-7 rounded-full transition-colors ${
              billingCycle === "YEARLY" ? "bg-primary" : "bg-gray-300"
            }`}
          >
            <span
              className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                billingCycle === "YEARLY" ? "translate-x-8" : "translate-x-1"
              }`}
            />
          </button>
          <span className={billingCycle === "YEARLY" ? "font-semibold" : "text-muted-foreground"}>
            Yearly
            <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
              Save 17%
            </span>
          </span>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative ${PLAN_COLORS[plan.slug.toLowerCase()] || "border-gray-200"} ${
              plan.isPopular ? "scale-105" : ""
            }`}
          >
            {plan.isPopular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                  Most Popular
                </span>
              </div>
            )}

            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-2 p-3 rounded-full bg-gray-100">
                {PLAN_ICONS[plan.slug.toLowerCase()]}
              </div>
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <CardDescription className="min-h-[40px]">{plan.description}</CardDescription>
            </CardHeader>

            <CardContent className="text-center">
              <div className="mb-6">
                <span className="text-4xl font-bold">
                  {plan.currency} {billingCycle === "MONTHLY" ? plan.priceMonthly : Math.round(plan.priceYearly / 12)}
                </span>
                <span className="text-muted-foreground">/month</span>
                {billingCycle === "YEARLY" && plan.priceYearly > 0 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Billed {plan.currency} {plan.priceYearly}/year
                  </p>
                )}
              </div>

              {/* Limits */}
              <div className="space-y-2 text-sm text-left mb-6">
                {FEATURE_LIST.map((feature) => (
                  <div key={feature.key} className="flex justify-between">
                    <span className="text-muted-foreground">{feature.label}</span>
                    <span className="font-medium">
                      {feature.format((plan as any)[feature.key])}
                    </span>
                  </div>
                ))}
              </div>

              {/* Feature Flags */}
              <div className="space-y-2 text-sm text-left border-t pt-4">
                {FEATURE_FLAGS.slice(0, 6).map((feature) => (
                  <div key={feature.key} className="flex items-center gap-2">
                    {plan.features?.[feature.key] ? (
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    ) : (
                      <X className="h-4 w-4 text-gray-300 flex-shrink-0" />
                    )}
                    <span className={plan.features?.[feature.key] ? "" : "text-muted-foreground"}>
                      {feature.label}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>

            <CardFooter>
              <Button
                className="w-full"
                variant={isCurrentPlan(plan) ? "outline" : plan.isPopular ? "default" : "outline"}
                disabled={isCurrentPlan(plan) || subscribing === plan.id}
                onClick={() => handleSubscribe(plan.id)}
              >
                {subscribing === plan.id ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {getButtonText(plan)}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Feature Comparison Table */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-center mb-8">Compare All Features</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-4 px-4 font-medium">Feature</th>
                {plans.map((plan) => (
                  <th key={plan.id} className="text-center py-4 px-4 font-medium">
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Limits */}
              {FEATURE_LIST.map((feature) => (
                <tr key={feature.key} className="border-b">
                  <td className="py-3 px-4">{feature.label}</td>
                  {plans.map((plan) => (
                    <td key={plan.id} className="text-center py-3 px-4">
                      {feature.format((plan as any)[feature.key])}
                    </td>
                  ))}
                </tr>
              ))}
              {/* Feature Flags */}
              {FEATURE_FLAGS.map((feature) => (
                <tr key={feature.key} className="border-b">
                  <td className="py-3 px-4">{feature.label}</td>
                  {plans.map((plan) => (
                    <td key={plan.id} className="text-center py-3 px-4">
                      {plan.features?.[feature.key] ? (
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-gray-300 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-16 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Can I change my plan later?</h3>
            <p className="text-muted-foreground">
              Yes! You can upgrade or downgrade your plan at any time. When upgrading, you&apos;ll be charged the prorated difference. When downgrading, the change takes effect at the end of your billing cycle.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
            <p className="text-muted-foreground">
              We accept Mobile Money (MTN, Vodafone, AirtelTigo), bank transfers, and card payments (Visa, Mastercard).
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Is there a free trial?</h3>
            <p className="text-muted-foreground">
              Yes! All paid plans come with a 14-day free trial. No credit card required to start.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">What happens when I reach my limits?</h3>
            <p className="text-muted-foreground">
              You&apos;ll receive a notification when approaching your limits. You can upgrade anytime to continue adding more records, farms, or using premium features.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Can I get a refund?</h3>
            <p className="text-muted-foreground">
              We offer a 30-day money-back guarantee for annual plans. Monthly plans can be cancelled anytime with no refund for the current period.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-16 text-center bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8">
        <h2 className="text-2xl font-bold mb-4">Need a Custom Solution?</h2>
        <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
          For cooperatives, NGOs, and large agribusinesses, we offer custom Enterprise plans with dedicated support, white-labeling, and bulk farmer onboarding.
        </p>
        <Button size="lg" variant="outline">
          Contact Sales
        </Button>
      </div>
    </div>
  );
}
