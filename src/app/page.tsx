import Link from "next/link";
import { Leaf, TrendingUp, Cloud, Users, Check } from "lucide-react";
import { db } from "@/lib/db";

interface SubscriptionPlanData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  priceMonthly: number;
  priceYearly: number;
  currency: string;
  features: Record<string, boolean>;
  maxFarms: number;
  maxPlots: number;
  maxUsers: number;
  isPopular: boolean;
  targetAudience: string;
}

async function getPlans(): Promise<SubscriptionPlanData[]> {
  try {
    const plans = await db.subscriptionPlan.findMany({
      where: { 
        isActive: true,
        targetAudience: "FARMER",
      },
      orderBy: { displayOrder: "asc" },
    });
    return plans as unknown as SubscriptionPlanData[];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const plans = await getPlans();
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-gray-900">Ghana Farmer</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-gray-600 hover:text-primary">
              Features
            </Link>
            <Link href="#pricing" className="text-gray-600 hover:text-primary">
              Pricing
            </Link>
            <Link href="#about" className="text-gray-600 hover:text-primary">
              About
            </Link>
            <Link href="#contact" className="text-gray-600 hover:text-primary">
              Contact
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="text-gray-600 hover:text-primary font-medium"
            >
              Login
            </Link>
            <Link
              href="/auth/register"
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 font-medium"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Empowering Ghanaian Farmers
          <br />
          <span className="text-primary">Digitally</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Comprehensive farm management, market access, and agricultural
          intelligence at your fingertips. Track crops, manage livestock, and
          grow your farm business.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/auth/register"
            className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary/90 font-medium text-lg"
          >
            Start Free Trial
          </Link>
          <Link
            href="#features"
            className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 font-medium text-lg"
          >
            Learn More
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Everything You Need to Manage Your Farm
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={<Leaf className="h-10 w-10 text-primary" />}
            title="Crop & Livestock Management"
            description="Track planting, harvesting, vaccinations, and all farm activities in one place."
          />
          <FeatureCard
            icon={<TrendingUp className="h-10 w-10 text-primary" />}
            title="Market Intelligence"
            description="Real-time market prices, buyer connections, and price alerts to maximize profits."
          />
          <FeatureCard
            icon={<Cloud className="h-10 w-10 text-primary" />}
            title="Weather & Alerts"
            description="Weather forecasts, pest alerts, and timely reminders for farm activities."
          />
          <FeatureCard
            icon={<Users className="h-10 w-10 text-primary" />}
            title="Community & Support"
            description="Connect with other farmers, extension officers, and agricultural experts."
          />
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
          Simple, Transparent Pricing
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Choose the plan that fits your farm. Start free and upgrade as you grow.
        </p>
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {plans.length > 0 ? (
            plans.map((plan) => (
              <PricingCard key={plan.id} plan={plan} />
            ))
          ) : (
            <>
              {/* Fallback static plans if DB fetch fails */}
              <div className="bg-white p-8 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Starter</h3>
                <p className="text-gray-600 mb-4">Perfect for smallholder farmers</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">Free</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <PricingFeature>1 Farm</PricingFeature>
                  <PricingFeature>Up to 5 plots</PricingFeature>
                  <PricingFeature>Basic market prices</PricingFeature>
                  <PricingFeature>Task management</PricingFeature>
                </ul>
                <Link
                  href="/auth/register"
                  className="block w-full text-center border border-primary text-primary px-6 py-3 rounded-lg hover:bg-primary/5 font-medium"
                >
                  Get Started Free
                </Link>
              </div>
              <div className="bg-primary p-8 rounded-xl shadow-lg border-2 border-primary relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full">
                  MOST POPULAR
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Professional</h3>
                <p className="text-green-100 mb-4">For growing farm businesses</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">GH₵ 65</span>
                  <span className="text-green-100">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <PricingFeature light>Unlimited Farms</PricingFeature>
                  <PricingFeature light>Advanced Analytics</PricingFeature>
                  <PricingFeature light>Weather Forecasts</PricingFeature>
                  <PricingFeature light>Export Reports</PricingFeature>
                  <PricingFeature light>Priority Support</PricingFeature>
                </ul>
                <Link
                  href="/auth/register?plan=pro"
                  className="block w-full text-center bg-white text-primary px-6 py-3 rounded-lg hover:bg-gray-100 font-medium"
                >
                  Start 14-Day Free Trial
                </Link>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Business</h3>
                <p className="text-gray-600 mb-4">For commercial farms</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">GH₵ 200</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <PricingFeature>Everything in Pro</PricingFeature>
                  <PricingFeature>Multi-user Access</PricingFeature>
                  <PricingFeature>Inventory Management</PricingFeature>
                  <PricingFeature>API Access</PricingFeature>
                  <PricingFeature>Loan Reports</PricingFeature>
                </ul>
                <Link
                  href="/auth/register?plan=business"
                  className="block w-full text-center border border-primary text-primary px-6 py-3 rounded-lg hover:bg-primary/5 font-medium"
                >
                  Start Free Trial
                </Link>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Enterprise</h3>
                <p className="text-gray-600 mb-4">For cooperatives & large farms</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">Custom</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <PricingFeature>Everything in Business</PricingFeature>
                  <PricingFeature>Unlimited Users</PricingFeature>
                  <PricingFeature>White-label Option</PricingFeature>
                  <PricingFeature>Dedicated Support</PricingFeature>
                  <PricingFeature>Custom Integrations</PricingFeature>
                </ul>
                <Link
                  href="/auth/register?plan=enterprise"
                  className="block w-full text-center border border-primary text-primary px-6 py-3 rounded-lg hover:bg-primary/5 font-medium"
                >
                  Contact Sales
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Farm?
          </h2>
          <p className="text-green-100 mb-8 max-w-xl mx-auto">
            Join thousands of Ghanaian farmers already using Ghana Farmer to
            increase productivity and profits.
          </p>
          <Link
            href="/auth/register"
            className="bg-white text-primary px-8 py-3 rounded-lg hover:bg-gray-100 font-medium text-lg inline-block"
          >
            Get Started for Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Leaf className="h-6 w-6 text-primary" />
              <span className="text-white font-bold">Ghana Farmer</span>
            </div>
            <p className="text-sm">
              © {new Date().getFullYear()} Ghana Farmer. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function PricingFeature({
  children,
  light = false,
}: {
  children: React.ReactNode;
  light?: boolean;
}) {
  return (
    <li className={`flex items-center gap-2 ${light ? "text-green-100" : "text-gray-600"}`}>
      <Check className={`h-5 w-5 flex-shrink-0 ${light ? "text-green-200" : "text-primary"}`} />
      {children}
    </li>
  );
}

function PricingCard({ plan }: { plan: SubscriptionPlanData }) {
  const features = (plan.features || {}) as Record<string, boolean>;
  const featureList = Object.entries(features)
    .filter(([, enabled]) => enabled)
    .map(([key]) => formatFeatureName(key));
  
  const isPopular = plan.isPopular;
  const isFree = plan.priceMonthly === 0;
  const isEnterprise = plan.slug === "enterprise";
  
  return (
    <div className={`p-8 rounded-xl transition-shadow ${
      isPopular 
        ? "bg-primary shadow-lg border-2 border-primary relative" 
        : "bg-white shadow-sm border hover:shadow-md"
    }`}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full">
          MOST POPULAR
        </div>
      )}
      <h3 className={`text-xl font-bold mb-2 ${isPopular ? "text-white" : "text-gray-900"}`}>
        {plan.name}
      </h3>
      <p className={`mb-4 ${isPopular ? "text-green-100" : "text-gray-600"}`}>
        {plan.description || "Perfect for your farm"}
      </p>
      <div className="mb-6">
        {isEnterprise ? (
          <span className={`text-4xl font-bold ${isPopular ? "text-white" : "text-gray-900"}`}>
            Custom
          </span>
        ) : isFree ? (
          <span className={`text-4xl font-bold ${isPopular ? "text-white" : "text-gray-900"}`}>
            Free
          </span>
        ) : (
          <>
            <span className={`text-4xl font-bold ${isPopular ? "text-white" : "text-gray-900"}`}>
              {plan.currency === "GHS" ? "GH₵" : plan.currency} {plan.priceMonthly}
            </span>
            <span className={isPopular ? "text-green-100" : "text-gray-600"}>/month</span>
          </>
        )}
      </div>
      <ul className="space-y-3 mb-8">
        {plan.maxFarms === -1 ? (
          <PricingFeature light={isPopular}>Unlimited Farms</PricingFeature>
        ) : (
          <PricingFeature light={isPopular}>{plan.maxFarms} Farm{plan.maxFarms > 1 ? "s" : ""}</PricingFeature>
        )}
        {plan.maxPlots === -1 ? (
          <PricingFeature light={isPopular}>Unlimited Plots</PricingFeature>
        ) : (
          <PricingFeature light={isPopular}>Up to {plan.maxPlots} plots</PricingFeature>
        )}
        {plan.maxUsers > 1 && (
          <PricingFeature light={isPopular}>{plan.maxUsers === -1 ? "Unlimited" : plan.maxUsers} Team Members</PricingFeature>
        )}
        {featureList.slice(0, 5).map((feature) => (
          <PricingFeature key={feature} light={isPopular}>{feature}</PricingFeature>
        ))}
      </ul>
      <Link
        href={`/auth/register?plan=${plan.slug}`}
        className={`block w-full text-center px-6 py-3 rounded-lg font-medium ${
          isPopular
            ? "bg-white text-primary hover:bg-gray-100"
            : "border border-primary text-primary hover:bg-primary/5"
        }`}
      >
        {isFree ? "Get Started Free" : isEnterprise ? "Contact Sales" : "Start Free Trial"}
      </Link>
    </div>
  );
}

function formatFeatureName(key: string): string {
  const names: Record<string, string> = {
    advancedAnalytics: "Advanced Analytics",
    realTimePrices: "Real-time Prices",
    weatherForecasts: "Weather Forecasts",
    exportReports: "Export Reports",
    offlineMode: "Offline Mode",
    prioritySupport: "Priority Support",
    inventoryManagement: "Inventory Management",
    multiUserAccess: "Multi-user Access",
    apiAccess: "API Access",
    bulkOperations: "Bulk Operations",
    financialIntegration: "Financial Integration",
    loanEligibilityReports: "Loan Reports",
    unlimitedDse: "Unlimited AI Tips",
    supplierIntegration: "Supplier Integration",
    whiteLabel: "White-label Option",
    dedicatedSupport: "Dedicated Support",
    customReporting: "Custom Reports",
    slaGuarantee: "99.9% SLA",
  };
  return names[key] || key.replace(/([A-Z])/g, " $1").trim();
}
