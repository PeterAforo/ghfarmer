"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Check,
  Crown,
  Zap,
  Building2,
  Rocket,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

interface Plan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  icon: React.ReactNode;
  popular?: boolean;
}

const PLANS: Plan[] = [
  {
    id: "FREE",
    name: "Free",
    price: 0,
    period: "forever",
    description: "Perfect for getting started",
    icon: <Zap className="h-6 w-6" />,
    features: [
      "1 Farm",
      "Basic crop tracking",
      "Basic livestock tracking",
      "Weather forecasts",
      "Community access",
    ],
  },
  {
    id: "BASIC",
    name: "Basic",
    price: 29,
    period: "month",
    description: "For small-scale farmers",
    icon: <Crown className="h-6 w-6" />,
    features: [
      "Up to 3 Farms",
      "Advanced crop management",
      "Livestock health records",
      "Financial tracking",
      "Market price alerts",
      "Email support",
    ],
  },
  {
    id: "PROFESSIONAL",
    name: "Professional",
    price: 79,
    period: "month",
    description: "For growing operations",
    icon: <Building2 className="h-6 w-6" />,
    popular: true,
    features: [
      "Up to 10 Farms",
      "Team management (5 users)",
      "Advanced analytics",
      "Custom reports",
      "API access",
      "Priority support",
      "Marketplace access",
    ],
  },
  {
    id: "BUSINESS",
    name: "Business",
    price: 199,
    period: "month",
    description: "For commercial farms",
    icon: <Rocket className="h-6 w-6" />,
    features: [
      "Unlimited Farms",
      "Unlimited team members",
      "White-label options",
      "Dedicated account manager",
      "Custom integrations",
      "24/7 phone support",
      "Training sessions",
    ],
  },
];

export default function SubscriptionPage() {
  const { data: session } = useSession();
  const [currentPlan, setCurrentPlan] = useState<string>("FREE");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      // Get current subscription from session or fetch it
      setCurrentPlan((session.user as any).subscription || "FREE");
      setIsLoading(false);
    }
  }, [session]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/settings">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Settings
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Subscription Plans</h1>
          <p className="text-gray-600">
            Choose the plan that best fits your farming needs
          </p>
        </div>
      </div>

      {/* Current Plan */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Current Plan</p>
              <p className="text-xl font-bold text-primary">{currentPlan}</p>
            </div>
            {currentPlan !== "FREE" && (
              <div className="text-right">
                <p className="text-sm text-gray-600">Next billing date</p>
                <p className="font-medium">
                  {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {PLANS.map((plan) => {
          const isCurrent = plan.id === currentPlan;
          
          return (
            <Card
              key={plan.id}
              className={`relative ${
                plan.popular
                  ? "border-primary shadow-lg"
                  : isCurrent
                  ? "border-green-500"
                  : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-white text-xs px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              {isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full">
                    Current Plan
                  </span>
                </div>
              )}
              <CardHeader className="text-center pt-8">
                <div className="mx-auto mb-2 p-3 bg-gray-100 rounded-full w-fit">
                  {plan.icon}
                </div>
                <CardTitle>{plan.name}</CardTitle>
                <p className="text-sm text-gray-600">{plan.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <span className="text-3xl font-bold">
                    {plan.price === 0 ? "Free" : `GH₵${plan.price}`}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-gray-600">/{plan.period}</span>
                  )}
                </div>

                <ul className="space-y-2">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  variant={isCurrent ? "outline" : plan.popular ? "default" : "outline"}
                  disabled={isCurrent}
                >
                  {isCurrent
                    ? "Current Plan"
                    : plan.price === 0
                    ? "Downgrade"
                    : "Upgrade"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium">Can I change plans anytime?</h3>
            <p className="text-sm text-gray-600">
              Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
            </p>
          </div>
          <div>
            <h3 className="font-medium">What payment methods do you accept?</h3>
            <p className="text-sm text-gray-600">
              We accept Mobile Money (MTN, Vodafone, AirtelTigo), bank transfers, and major credit cards.
            </p>
          </div>
          <div>
            <h3 className="font-medium">Is there a free trial?</h3>
            <p className="text-sm text-gray-600">
              Yes! All paid plans come with a 14-day free trial. No credit card required.
            </p>
          </div>
          <div>
            <h3 className="font-medium">What happens to my data if I downgrade?</h3>
            <p className="text-sm text-gray-600">
              Your data is always safe. If you exceed the limits of your new plan, you&apos;ll have read-only access to excess data.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card>
        <CardContent className="py-6 text-center">
          <h3 className="font-medium mb-2">Need a custom plan?</h3>
          <p className="text-sm text-gray-600 mb-4">
            Contact us for enterprise pricing and custom solutions for large agricultural operations.
          </p>
          <Link href="/dashboard/support">
            <Button variant="outline">Contact Sales</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
