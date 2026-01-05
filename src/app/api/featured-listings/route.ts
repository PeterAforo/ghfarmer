// Featured Listings API - Promotional placements for service providers
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

// Featured listing pricing (GHS per day)
const FEATURED_PRICING = {
  HOMEPAGE_BANNER: 50,
  HOMEPAGE_FEATURED: 30,
  CATEGORY_TOP: 20,
  SEARCH_TOP: 15,
  SIDEBAR: 10,
};

const createFeaturedSchema = z.object({
  listingType: z.enum(["MARKET_LISTING", "PRODUCT_LISTING", "SERVICE_LISTING", "PROVIDER_PROFILE"]),
  listingId: z.string(),
  placement: z.enum(["HOMEPAGE_BANNER", "HOMEPAGE_FEATURED", "CATEGORY_TOP", "SEARCH_TOP", "SIDEBAR"]),
  durationDays: z.number().min(1).max(90),
  paymentMethod: z.string().optional(),
  paymentReference: z.string().optional(),
});

// GET - List featured listings (active ones for display, or user's own)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const placement = searchParams.get("placement");
    const myListings = searchParams.get("my") === "true";

    if (myListings) {
      // Get user's own featured listings
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Get user's provider
      const provider = await db.serviceProvider.findUnique({
        where: { userId: session.user.id },
      });

      if (!provider) {
        return NextResponse.json({ featuredListings: [], pricing: FEATURED_PRICING });
      }

      const featuredListings = await db.featuredListing.findMany({
        where: { providerId: provider.id },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json({ featuredListings, pricing: FEATURED_PRICING });
    }

    // Get active featured listings for display
    const where: any = {
      status: "ACTIVE",
      startDate: { lte: new Date() },
      endDate: { gte: new Date() },
    };

    if (placement) {
      where.placement = placement;
    }

    const featuredListings = await db.featuredListing.findMany({
      where,
      orderBy: [
        { position: "asc" },
        { createdAt: "desc" },
      ],
      take: placement ? 10 : 50,
    });

    // Increment impressions
    if (featuredListings.length > 0) {
      await db.featuredListing.updateMany({
        where: { id: { in: featuredListings.map(f => f.id) } },
        data: { impressions: { increment: 1 } },
      });
    }

    return NextResponse.json({ featuredListings });
  } catch (error) {
    console.error("Error fetching featured listings:", error);
    return NextResponse.json(
      { error: "Failed to fetch featured listings" },
      { status: 500 }
    );
  }
}

// POST - Create a featured listing
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createFeaturedSchema.parse(body);

    // Get user's provider
    const provider = await db.serviceProvider.findUnique({
      where: { userId: session.user.id },
    });

    if (!provider) {
      return NextResponse.json(
        { error: "Only service providers can create featured listings" },
        { status: 403 }
      );
    }

    // Check if provider has promotional tools access (PREMIUM tier)
    const subscription = await db.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: { in: ["ACTIVE", "TRIALING"] },
      },
      include: { plan: true },
    });

    const planFeatures = subscription?.plan?.features as Record<string, boolean> || {};
    if (!planFeatures.promotionalTools) {
      return NextResponse.json(
        { error: "Promotional tools require Premium provider subscription" },
        { status: 403 }
      );
    }

    // Verify ownership of the listing
    let isOwner = false;
    switch (validatedData.listingType) {
      case "MARKET_LISTING":
        const marketListing = await db.marketListing.findFirst({
          where: { id: validatedData.listingId, userId: session.user.id },
        });
        isOwner = !!marketListing;
        break;
      case "PRODUCT_LISTING":
        const productListing = await db.productListing.findFirst({
          where: { id: validatedData.listingId, providerId: provider.id },
        });
        isOwner = !!productListing;
        break;
      case "SERVICE_LISTING":
        const serviceListing = await db.serviceListing.findFirst({
          where: { id: validatedData.listingId, providerId: provider.id },
        });
        isOwner = !!serviceListing;
        break;
      case "PROVIDER_PROFILE":
        isOwner = validatedData.listingId === provider.id;
        break;
    }

    if (!isOwner) {
      return NextResponse.json(
        { error: "You can only feature your own listings" },
        { status: 403 }
      );
    }

    // Calculate pricing
    const dailyRate = FEATURED_PRICING[validatedData.placement];
    const totalAmount = dailyRate * validatedData.durationDays;

    // Calculate dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + validatedData.durationDays);

    // Create featured listing and payment in transaction
    const result = await db.$transaction(async (tx) => {
      // Create payment
      const payment = await tx.payment.create({
        data: {
          userId: session.user.id,
          amount: totalAmount,
          currency: "GHS",
          paymentType: "FEATURED_LISTING",
          paymentMethod: validatedData.paymentMethod,
          reference: validatedData.paymentReference,
          status: "PAID", // Would be PENDING in real payment flow
          paidAt: new Date(),
          description: `Featured listing - ${validatedData.placement} for ${validatedData.durationDays} days`,
        },
      });

      // Create featured listing
      const featuredListing = await tx.featuredListing.create({
        data: {
          listingType: validatedData.listingType,
          listingId: validatedData.listingId,
          providerId: provider.id,
          placement: validatedData.placement,
          startDate,
          endDate,
          amountPaid: totalAmount,
          paymentId: payment.id,
          status: "ACTIVE",
        },
      });

      return { featuredListing, payment };
    });

    return NextResponse.json({
      message: "Featured listing created successfully",
      featuredListing: result.featuredListing,
      payment: {
        amount: totalAmount,
        currency: "GHS",
      },
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating featured listing:", error);
    return NextResponse.json(
      { error: "Failed to create featured listing" },
      { status: 500 }
    );
  }
}
