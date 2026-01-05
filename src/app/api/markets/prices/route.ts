import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productType = searchParams.get("product");
    const marketId = searchParams.get("marketId");
    const region = searchParams.get("region");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Build where clause
    const where: any = {};
    if (productType) where.productType = productType;
    if (marketId) where.marketId = marketId;
    if (region) {
      where.market = { region };
    }

    const prices = await db.marketPrice.findMany({
      where,
      include: {
        market: {
          select: { id: true, name: true, region: true },
        },
      },
      orderBy: { date: "desc" },
      take: limit,
    });

    return NextResponse.json(prices);
  } catch (error) {
    console.error("Error fetching market prices:", error);
    return NextResponse.json(
      { error: "Failed to fetch market prices" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { marketId, productType, productCategory, price, unit, date } = body;

    if (!marketId || !productType || !price || !unit) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const marketPrice = await db.marketPrice.create({
      data: {
        marketId,
        productType,
        productCategory,
        price: parseFloat(price),
        unit,
        date: date ? new Date(date) : new Date(),
      },
      include: {
        market: {
          select: { id: true, name: true, region: true },
        },
      },
    });

    return NextResponse.json(marketPrice, { status: 201 });
  } catch (error) {
    console.error("Error creating market price:", error);
    return NextResponse.json(
      { error: "Failed to create market price" },
      { status: 500 }
    );
  }
}
