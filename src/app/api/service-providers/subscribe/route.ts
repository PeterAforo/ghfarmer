// Service Provider Subscription API
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const subscribeSchema = z.object({
  tier: z.enum(["BASIC", "VERIFIED", "PREMIUM"]),
  billingCycle: z.enum(["MONTHLY", "YEARLY"]).default("MONTHLY"),
  paymentMethod: z.string().optional(),
  paymentReference: z.string().optional(),
});

// Provider tier pricing
const PROVIDER_PRICING = {
  BASIC: { monthly: 0, yearly: 0 },
  VERIFIED: { monthly: 100, yearly: 1000 },
  PREMIUM: { monthly: 300, yearly: 3000 },
};

// Provider tier features
const PROVIDER_FEATURES = {
  BASIC: {
    maxListings: 5,
    verifiedBadge: false,
    featuredInSearch: false,
    analytics: false,
    directMessaging: false,
    bookingManagement: false,
    promotionalTools: false,
  },
  VERIFIED: {
    maxListings: -1,
    verifiedBadge: true,
    featuredInSearch: true,
    analytics: true,
    directMessaging: true,
    bookingManagement: true,
    promotionalTools: false,
  },
  PREMIUM: {
    maxListings: -1,
    verifiedBadge: true,
    featuredInSearch: true,
    analytics: true,
    directMessaging: true,
    bookingManagement: true,
    promotionalTools: true,
    homepageFeatured: true,
    priorityRecommendations: true,
    bulkMessaging: true,
  },
};

// GET - Get provider subscription status
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get service provider
    const provider = await db.serviceProvider.findUnique({
      where: { userId: session.user.id },
    });

    if (!provider) {
      return NextResponse.json(
        { error: "Not a service provider" },
        { status: 404 }
      );
    }

    // Get active subscription
    const subscription = await db.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: { in: ["ACTIVE", "TRIALING"] },
      },
      include: { plan: true },
      orderBy: { createdAt: "desc" },
    });

    // Determine current tier
    const currentTier = subscription?.plan?.slug?.toUpperCase() || "BASIC";
    const features = PROVIDER_FEATURES[currentTier as keyof typeof PROVIDER_FEATURES] || PROVIDER_FEATURES.BASIC;

    // Get listing count
    const listingCount = await db.productListing.count({
      where: { providerId: provider.id },
    }) + await db.serviceListing.count({
      where: { providerId: provider.id },
    });

    return NextResponse.json({
      provider: {
        id: provider.id,
        businessName: provider.businessName,
        isVerified: provider.isVerified,
      },
      subscription: subscription ? {
        id: subscription.id,
        status: subscription.status,
        billingCycle: subscription.billingCycle,
        endDate: subscription.endDate,
        plan: subscription.plan,
      } : null,
      currentTier,
      features,
      usage: {
        listings: listingCount,
        maxListings: features.maxListings,
      },
      pricing: PROVIDER_PRICING,
    });
  } catch (error) {
    console.error("Error fetching provider subscription:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 }
    );
  }
}

// POST - Subscribe to a provider tier
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = subscribeSchema.parse(body);

    // Get service provider
    const provider = await db.serviceProvider.findUnique({
      where: { userId: session.user.id },
    });

    if (!provider) {
      return NextResponse.json(
        { error: "Not a service provider. Register as a provider first." },
        { status: 404 }
      );
    }

    // Get or create plan
    let plan = await db.subscriptionPlan.findFirst({
      where: { 
        slug: `provider-${validatedData.tier.toLowerCase()}`,
        targetAudience: { in: ["SERVICE_PROVIDER", "BOTH"] },
      },
    });

    if (!plan) {
      // Create the plan if it doesn't exist
      const pricing = PROVIDER_PRICING[validatedData.tier];
      const features = PROVIDER_FEATURES[validatedData.tier];
      
      plan = await db.subscriptionPlan.create({
        data: {
          name: `Provider ${validatedData.tier}`,
          slug: `provider-${validatedData.tier.toLowerCase()}`,
          description: `Service provider ${validatedData.tier.toLowerCase()} tier`,
          priceMonthly: pricing.monthly,
          priceYearly: pricing.yearly,
          targetAudience: "SERVICE_PROVIDER",
          maxListings: features.maxListings,
          features: features,
          isActive: true,
        },
      });
    }

    // Calculate dates
    const startDate = new Date();
    const endDate = new Date();
    if (validatedData.billingCycle === "MONTHLY") {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    const price = validatedData.billingCycle === "MONTHLY"
      ? plan.priceMonthly
      : plan.priceYearly;

    // Create subscription in transaction
    const result = await db.$transaction(async (tx) => {
      // Cancel existing subscription
      await tx.subscription.updateMany({
        where: {
          userId: session.user.id,
          status: { in: ["ACTIVE", "TRIALING"] },
        },
        data: {
          status: "CANCELLED",
          cancelledAt: new Date(),
        },
      });

      // Create new subscription
      const subscription = await tx.subscription.create({
        data: {
          userId: session.user.id,
          planId: plan!.id,
          status: "ACTIVE",
          billingCycle: validatedData.billingCycle,
          startDate,
          endDate,
          nextPaymentAt: endDate,
          paymentMethod: validatedData.paymentMethod,
          paymentReference: validatedData.paymentReference,
        },
        include: { plan: true },
      });

      // Update provider verification status for VERIFIED and PREMIUM
      if (validatedData.tier !== "BASIC") {
        await tx.serviceProvider.update({
          where: { id: provider.id },
          data: { isVerified: true },
        });
      }

      // Create payment record if price > 0
      if (price > 0) {
        await tx.payment.create({
          data: {
            subscriptionId: subscription.id,
            userId: session.user.id,
            amount: price,
            currency: "GHS",
            paymentType: "SUBSCRIPTION",
            paymentMethod: validatedData.paymentMethod,
            reference: validatedData.paymentReference,
            status: "PAID",
            paidAt: new Date(),
            description: `Provider ${validatedData.tier} - ${validatedData.billingCycle} subscription`,
          },
        });
      }

      return subscription;
    });

    return NextResponse.json({
      message: "Subscription created successfully",
      subscription: result,
      features: PROVIDER_FEATURES[validatedData.tier],
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating provider subscription:", error);
    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 }
    );
  }
}
