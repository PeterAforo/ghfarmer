// Marketplace Transactions API - Handle platform fees
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

// Platform fee percentage (3% default)
const PLATFORM_FEE_PERCENT = 3.0;

const createTransactionSchema = z.object({
  listingType: z.enum(["market_listing", "product_order"]),
  listingId: z.string(),
  buyerId: z.string(),
  subtotal: z.number().positive(),
});

// GET - List transactions (for seller or buyer)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role") || "seller"; // seller or buyer
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: any = role === "seller" 
      ? { sellerId: session.user.id }
      : { buyerId: session.user.id };
    
    if (status) {
      where.status = status;
    }

    const transactions = await db.marketplaceTransaction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    // Calculate summary
    const summary = {
      total: transactions.length,
      totalSubtotal: transactions.reduce((sum, t) => sum + t.subtotal, 0),
      totalFees: transactions.reduce((sum, t) => sum + t.platformFee, 0),
      totalSellerAmount: transactions.reduce((sum, t) => sum + t.sellerAmount, 0),
      byStatus: {} as Record<string, number>,
    };

    transactions.forEach(t => {
      summary.byStatus[t.status] = (summary.byStatus[t.status] || 0) + 1;
    });

    return NextResponse.json({ transactions, summary });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}

// POST - Create a new transaction (when purchase is made)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createTransactionSchema.parse(body);

    // Get the listing to find the seller
    let sellerId: string;
    
    if (validatedData.listingType === "market_listing") {
      const listing = await db.marketListing.findUnique({
        where: { id: validatedData.listingId },
        select: { userId: true },
      });
      if (!listing) {
        return NextResponse.json(
          { error: "Listing not found" },
          { status: 404 }
        );
      }
      sellerId = listing.userId;
    } else {
      // For product orders, get from ProductOrder -> ProductListing -> ServiceProvider -> User
      const order = await db.productOrder.findUnique({
        where: { id: validatedData.listingId },
        include: {
          product: {
            include: {
              provider: {
                select: { userId: true },
              },
            },
          },
        },
      });
      if (!order) {
        return NextResponse.json(
          { error: "Order not found" },
          { status: 404 }
        );
      }
      sellerId = order.product.provider.userId;
    }

    // Calculate fees
    const platformFee = (validatedData.subtotal * PLATFORM_FEE_PERCENT) / 100;
    const sellerAmount = validatedData.subtotal - platformFee;

    const transaction = await db.marketplaceTransaction.create({
      data: {
        sellerId,
        buyerId: validatedData.buyerId,
        listingType: validatedData.listingType,
        listingId: validatedData.listingId,
        subtotal: validatedData.subtotal,
        platformFee,
        platformFeePercent: PLATFORM_FEE_PERCENT,
        sellerAmount,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      transaction,
      breakdown: {
        subtotal: validatedData.subtotal,
        platformFee,
        platformFeePercent: PLATFORM_FEE_PERCENT,
        sellerAmount,
      },
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating transaction:", error);
    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 }
    );
  }
}
