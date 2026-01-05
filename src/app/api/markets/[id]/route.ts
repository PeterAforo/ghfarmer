import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const market = await db.market.findUnique({
      where: { id },
      include: {
        prices: {
          orderBy: { date: "desc" },
          take: 100,
        },
      },
    });

    if (!market) {
      return NextResponse.json({ error: "Market not found" }, { status: 404 });
    }

    // Group prices by product type for easier display
    const pricesByProduct: Record<string, any[]> = {};
    market.prices.forEach((price) => {
      if (!pricesByProduct[price.productType]) {
        pricesByProduct[price.productType] = [];
      }
      pricesByProduct[price.productType].push(price);
    });

    return NextResponse.json({
      ...market,
      pricesByProduct,
    });
  } catch (error) {
    console.error("Error fetching market:", error);
    return NextResponse.json(
      { error: "Failed to fetch market" },
      { status: 500 }
    );
  }
}
