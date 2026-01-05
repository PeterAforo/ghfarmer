// Usage tracking API
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCurrentUsage, incrementUsage } from "@/lib/subscription";

// GET - Get current usage stats
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const usage = await getCurrentUsage(session.user.id);
    
    // Get historical usage (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const historicalUsage = await db.usageTracking.findMany({
      where: {
        userId: session.user.id,
        periodStart: { gte: sixMonthsAgo },
      },
      orderBy: { periodStart: "asc" },
    });
    
    return NextResponse.json({
      current: usage,
      history: historicalUsage,
    });
  } catch (error) {
    console.error("Error fetching usage:", error);
    return NextResponse.json(
      { error: "Failed to fetch usage data" },
      { status: 500 }
    );
  }
}

// POST - Increment usage (internal use)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const body = await request.json();
    const { usageType, amount = 1 } = body;
    
    const validTypes = [
      "recordsCreated",
      "apiCalls",
      "dseRecommendations",
      "exportsGenerated",
      "priceAlertsCreated",
      "listingsCreated",
    ];
    
    if (!validTypes.includes(usageType)) {
      return NextResponse.json(
        { error: "Invalid usage type" },
        { status: 400 }
      );
    }
    
    await incrementUsage(session.user.id, usageType, amount);
    
    return NextResponse.json({ message: "Usage updated" });
  } catch (error) {
    console.error("Error updating usage:", error);
    return NextResponse.json(
      { error: "Failed to update usage" },
      { status: 500 }
    );
  }
}
