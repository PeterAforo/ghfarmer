import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const region = searchParams.get("region");

    const markets = await db.market.findMany({
      where: {
        isActive: true,
        ...(region && { region }),
      },
      include: {
        prices: {
          orderBy: { date: "desc" },
          take: 5,
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(markets);
  } catch (error) {
    console.error("Error fetching markets:", error);
    return NextResponse.json(
      { error: "Failed to fetch markets" },
      { status: 500 }
    );
  }
}
