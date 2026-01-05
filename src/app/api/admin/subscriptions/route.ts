// Admin Subscriptions API
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET - List all subscriptions with stats (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const plan = searchParams.get("plan");
    const limit = parseInt(searchParams.get("limit") || "100");

    // Build where clause
    const where: any = {};
    if (status) where.status = status;
    if (plan) where.plan = { slug: plan };

    // Get subscriptions
    const subscriptions = await db.subscription.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        plan: {
          select: {
            id: true,
            name: true,
            slug: true,
            priceMonthly: true,
            priceYearly: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    // Calculate stats
    const allSubscriptions = await db.subscription.findMany({
      include: {
        plan: true,
      },
    });

    const stats = {
      totalSubscriptions: allSubscriptions.length,
      activeSubscriptions: allSubscriptions.filter(s => s.status === "ACTIVE" || s.status === "TRIALING").length,
      monthlyRevenue: allSubscriptions
        .filter(s => s.status === "ACTIVE" && s.billingCycle === "MONTHLY")
        .reduce((sum, s) => sum + (s.plan?.priceMonthly || 0), 0),
      yearlyRevenue: allSubscriptions
        .filter(s => s.status === "ACTIVE" && s.billingCycle === "YEARLY")
        .reduce((sum, s) => sum + (s.plan?.priceYearly || 0), 0),
      byPlan: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
    };

    allSubscriptions.forEach(sub => {
      const planName = sub.plan?.slug?.toUpperCase() || "UNKNOWN";
      stats.byPlan[planName] = (stats.byPlan[planName] || 0) + 1;
      stats.byStatus[sub.status] = (stats.byStatus[sub.status] || 0) + 1;
    });

    return NextResponse.json({ subscriptions, stats });
  } catch (error) {
    console.error("Error fetching admin subscriptions:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscriptions" },
      { status: 500 }
    );
  }
}

// PATCH - Update subscription (admin action)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const { subscriptionId, action, newPlanId, newEndDate } = body;

    if (!subscriptionId) {
      return NextResponse.json(
        { error: "Subscription ID required" },
        { status: 400 }
      );
    }

    const subscription = await db.subscription.findUnique({
      where: { id: subscriptionId },
      include: { plan: true },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    let updateData: any = {};

    switch (action) {
      case "cancel":
        updateData = {
          status: "CANCELLED",
          cancelledAt: new Date(),
        };
        break;
      case "activate":
        updateData = {
          status: "ACTIVE",
          cancelledAt: null,
        };
        break;
      case "extend":
        if (!newEndDate) {
          return NextResponse.json(
            { error: "New end date required for extension" },
            { status: 400 }
          );
        }
        updateData = {
          endDate: new Date(newEndDate),
          nextPaymentAt: new Date(newEndDate),
        };
        break;
      case "change_plan":
        if (!newPlanId) {
          return NextResponse.json(
            { error: "New plan ID required" },
            { status: 400 }
          );
        }
        updateData = {
          planId: newPlanId,
        };
        // Also update user's subscription tier
        const newPlan = await db.subscriptionPlan.findUnique({
          where: { id: newPlanId },
        });
        if (newPlan) {
          await db.user.update({
            where: { id: subscription.userId },
            data: { subscription: newPlan.slug.toUpperCase() as any },
          });
        }
        break;
      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }

    const updated = await db.subscription.update({
      where: { id: subscriptionId },
      data: updateData,
      include: {
        user: { select: { id: true, name: true, email: true } },
        plan: true,
      },
    });

    return NextResponse.json({
      message: `Subscription ${action} successful`,
      subscription: updated,
    });
  } catch (error) {
    console.error("Error updating subscription:", error);
    return NextResponse.json(
      { error: "Failed to update subscription" },
      { status: 500 }
    );
  }
}
