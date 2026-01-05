// Super Admin - Analytics API
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { allowed: false, error: "Unauthorized", status: 401 };
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (!user || !["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
    return { allowed: false, error: "Admin access required", status: 403 };
  }

  return { allowed: true, userId: session.user.id };
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (!auth.allowed) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30"; // days
    const periodDays = parseInt(period);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    // Get comprehensive analytics
    const [
      totalUsers,
      newUsers,
      activeUsers,
      totalFarms,
      totalCrops,
      totalLivestock,
      subscriptionBreakdown,
      regionBreakdown,
      userGrowth,
      supportStats,
    ] = await Promise.all([
      // Total users
      db.user.count(),
      
      // New users in period
      db.user.count({
        where: { createdAt: { gte: startDate } },
      }),
      
      // Active users (logged in or updated data in period)
      db.user.count({
        where: { updatedAt: { gte: startDate } },
      }),
      
      // Total farms
      db.farm.count(),
      
      // Total crop entries
      db.cropEntry.count(),
      
      // Total livestock entries
      db.livestockEntry.count(),
      
      // Subscription breakdown
      db.user.groupBy({
        by: ["subscription"],
        _count: true,
      }),
      
      // Region breakdown
      db.user.groupBy({
        by: ["region"],
        _count: true,
        orderBy: { _count: { region: "desc" } },
        take: 10,
      }),
      
      // User growth over time (last 12 months)
      db.$queryRaw`
        SELECT 
          DATE_TRUNC('month', "createdAt") as month,
          COUNT(*) as count
        FROM users
        WHERE "createdAt" >= NOW() - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', "createdAt")
        ORDER BY month ASC
      `,
      
      // Support ticket stats
      db.supportTicket.groupBy({
        by: ["status"],
        _count: true,
      }),
    ]);

    // Calculate revenue (based on subscriptions)
    const subscriptionPrices: Record<string, number> = {
      FREE: 0,
      BASIC: 29,
      PROFESSIONAL: 79,
      BUSINESS: 199,
      ENTERPRISE: 499,
    };

    const monthlyRevenue = subscriptionBreakdown.reduce((total, sub) => {
      return total + (subscriptionPrices[sub.subscription] || 0) * sub._count;
    }, 0);

    // Get recent admin actions
    const recentActions = await db.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        user: { select: { name: true, email: true } },
      },
    });

    return NextResponse.json({
      overview: {
        totalUsers,
        newUsers,
        activeUsers,
        totalFarms,
        totalCrops,
        totalLivestock,
        estimatedMonthlyRevenue: monthlyRevenue,
      },
      subscriptions: subscriptionBreakdown.map(s => ({
        tier: s.subscription,
        count: s._count,
        revenue: (subscriptionPrices[s.subscription] || 0) * s._count,
      })),
      regions: regionBreakdown.map(r => ({
        region: r.region || "Unknown",
        count: r._count,
      })),
      userGrowth,
      support: {
        stats: supportStats.reduce((acc, s) => ({ ...acc, [s.status]: s._count }), {}),
        openTickets: supportStats.find(s => s.status === "OPEN")?._count || 0,
      },
      recentActions: recentActions.map(a => ({
        action: a.action,
        entityType: a.entityType,
        entityId: a.entityId,
        admin: a.user.name || a.user.email,
        createdAt: a.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
