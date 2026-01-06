// Public API to fetch subscription plans for landing page
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const plans = await db.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { price: "asc" },
      select: {
        id: true,
        name: true,
        tier: true,
        description: true,
        price: true,
        currency: true,
        billingCycle: true,
        features: true,
        limits: true,
        isPopular: true,
        trialDays: true,
      },
    });

    // Group by tier for display
    const farmerPlans = plans.filter(p => 
      ["FREE", "PRO", "BUSINESS", "ENTERPRISE"].includes(p.tier)
    );

    const providerPlans = plans.filter(p => 
      ["BASIC", "VERIFIED", "PREMIUM"].includes(p.tier)
    );

    return NextResponse.json({
      farmerPlans,
      providerPlans,
    });
  } catch (error) {
    console.error("Error fetching plans:", error);
    return NextResponse.json(
      { error: "Failed to fetch plans" },
      { status: 500 }
    );
  }
}
