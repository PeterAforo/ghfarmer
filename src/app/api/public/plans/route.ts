// Public API to fetch subscription plans for landing page
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const plans = await db.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        priceMonthly: true,
        priceYearly: true,
        currency: true,
        targetAudience: true,
        features: true,
        maxFarms: true,
        maxPlots: true,
        maxUsers: true,
        isPopular: true,
      },
    });

    // Group by target audience for display
    const farmerPlans = plans.filter(p => p.targetAudience === "FARMER");
    const providerPlans = plans.filter(p => p.targetAudience === "SERVICE_PROVIDER");

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
