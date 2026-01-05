// Promotions API - Discount codes and promotional tools for service providers
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const createPromotionSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  promotionType: z.enum(["DISCOUNT", "FREE_SHIPPING", "BUY_ONE_GET_ONE", "BUNDLE"]),
  discountType: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]),
  discountValue: z.number().positive(),
  minPurchase: z.number().min(0).optional(),
  maxDiscount: z.number().min(0).optional(),
  startDate: z.string(),
  endDate: z.string(),
  maxUses: z.number().int().positive().optional(),
  maxUsesPerUser: z.number().int().positive().default(1),
  code: z.string().min(4).max(20).optional(),
  applicableTo: z.object({
    productIds: z.array(z.string()).optional(),
    serviceIds: z.array(z.string()).optional(),
    categories: z.array(z.string()).optional(),
  }).optional(),
});

// GET - List promotions
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    // If code is provided, validate it for use
    if (code) {
      const promotion = await db.promotion.findFirst({
        where: {
          code: code.toUpperCase(),
          isActive: true,
          startDate: { lte: new Date() },
          endDate: { gte: new Date() },
        },
      });

      if (!promotion) {
        return NextResponse.json(
          { error: "Invalid or expired promotion code" },
          { status: 404 }
        );
      }

      // Check if max uses reached
      if (promotion.maxUses && promotion.usedCount >= promotion.maxUses) {
        return NextResponse.json(
          { error: "Promotion code has reached maximum uses" },
          { status: 400 }
        );
      }

      // Check if user has already used this code
      const userUsage = await db.promotionUsage.count({
        where: {
          promotionId: promotion.id,
          userId: session.user.id,
        },
      });

      if (userUsage >= promotion.maxUsesPerUser) {
        return NextResponse.json(
          { error: "You have already used this promotion code" },
          { status: 400 }
        );
      }

      return NextResponse.json({
        valid: true,
        promotion: {
          id: promotion.id,
          name: promotion.name,
          description: promotion.description,
          promotionType: promotion.promotionType,
          discountType: promotion.discountType,
          discountValue: promotion.discountValue,
          minPurchase: promotion.minPurchase,
          maxDiscount: promotion.maxDiscount,
        },
      });
    }

    // Get provider's promotions
    const provider = await db.serviceProvider.findUnique({
      where: { userId: session.user.id },
    });

    if (!provider) {
      return NextResponse.json({ promotions: [] });
    }

    const promotions = await db.promotion.findMany({
      where: { providerId: provider.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { usages: true },
        },
      },
    });

    return NextResponse.json({
      promotions: promotions.map(p => ({
        ...p,
        usageCount: p._count.usages,
      })),
    });
  } catch (error) {
    console.error("Error fetching promotions:", error);
    return NextResponse.json(
      { error: "Failed to fetch promotions" },
      { status: 500 }
    );
  }
}

// POST - Create a promotion
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createPromotionSchema.parse(body);

    // Get provider
    const provider = await db.serviceProvider.findUnique({
      where: { userId: session.user.id },
    });

    if (!provider) {
      return NextResponse.json(
        { error: "Only service providers can create promotions" },
        { status: 403 }
      );
    }

    // Check if provider has promotional tools access
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

    // Generate code if not provided
    const code = validatedData.code?.toUpperCase() || generatePromoCode();

    // Check if code already exists
    const existingCode = await db.promotion.findUnique({
      where: { code },
    });

    if (existingCode) {
      return NextResponse.json(
        { error: "Promotion code already exists" },
        { status: 400 }
      );
    }

    const promotion = await db.promotion.create({
      data: {
        providerId: provider.id,
        name: validatedData.name,
        description: validatedData.description,
        promotionType: validatedData.promotionType,
        discountType: validatedData.discountType,
        discountValue: validatedData.discountValue,
        minPurchase: validatedData.minPurchase,
        maxDiscount: validatedData.maxDiscount,
        startDate: new Date(validatedData.startDate),
        endDate: new Date(validatedData.endDate),
        maxUses: validatedData.maxUses,
        maxUsesPerUser: validatedData.maxUsesPerUser,
        code,
        applicableTo: validatedData.applicableTo,
        isActive: true,
      },
    });

    return NextResponse.json({
      message: "Promotion created successfully",
      promotion,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating promotion:", error);
    return NextResponse.json(
      { error: "Failed to create promotion" },
      { status: 500 }
    );
  }
}

function generatePromoCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
