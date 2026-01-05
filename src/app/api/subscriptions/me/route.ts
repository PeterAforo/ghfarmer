// Current user's subscription API
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { 
  getUserSubscriptionTier, 
  getPlanLimits, 
  getCurrentUsage,
  getTierFeatures,
  checkPlanLimit 
} from "@/lib/subscription";

// GET - Get current user's subscription details
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    // Get user with subscription info
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        subscription: true,
        subscriptionEndsAt: true,
      },
    });
    
    // Get active subscription
    const subscription = await db.subscription.findFirst({
      where: {
        userId,
        status: { in: ["ACTIVE", "TRIALING"] },
      },
      include: {
        plan: true,
      },
      orderBy: { createdAt: "desc" },
    });
    
    // Get tier and limits
    const tier = await getUserSubscriptionTier(userId);
    const limits = getPlanLimits(tier);
    const features = getTierFeatures(tier);
    const usage = await getCurrentUsage(userId);
    
    // Get current usage vs limits
    const [farmsLimit, plotsLimit, recordsLimit, alertsLimit, dseLimit, exportsLimit, listingsLimit] = 
      await Promise.all([
        checkPlanLimit(userId, "farms"),
        checkPlanLimit(userId, "plots"),
        checkPlanLimit(userId, "records"),
        checkPlanLimit(userId, "priceAlerts"),
        checkPlanLimit(userId, "dseRecommendations"),
        checkPlanLimit(userId, "exports"),
        checkPlanLimit(userId, "listings"),
      ]);
    
    return NextResponse.json({
      tier,
      subscription: subscription ? {
        id: subscription.id,
        status: subscription.status,
        billingCycle: subscription.billingCycle,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        nextPaymentAt: subscription.nextPaymentAt,
        autoRenew: subscription.autoRenew,
        plan: subscription.plan,
      } : null,
      limits: {
        farms: farmsLimit,
        plots: plotsLimit,
        records: recordsLimit,
        priceAlerts: alertsLimit,
        dseRecommendations: dseLimit,
        exports: exportsLimit,
        listings: listingsLimit,
      },
      usage,
      features,
      expiresAt: user?.subscriptionEndsAt,
    });
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription details" },
      { status: 500 }
    );
  }
}

// PATCH - Update subscription (cancel, toggle auto-renew)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const body = await request.json();
    const { action } = body;
    
    const subscription = await db.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: { in: ["ACTIVE", "TRIALING"] },
      },
    });
    
    if (!subscription) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 404 }
      );
    }
    
    switch (action) {
      case "cancel":
        await db.subscription.update({
          where: { id: subscription.id },
          data: {
            status: "CANCELLED",
            cancelledAt: new Date(),
            autoRenew: false,
          },
        });
        
        // Update user - keep current tier until end date
        await db.user.update({
          where: { id: session.user.id },
          data: {
            subscriptionEndsAt: subscription.endDate,
          },
        });
        
        return NextResponse.json({ message: "Subscription cancelled" });
        
      case "toggle-auto-renew":
        const updated = await db.subscription.update({
          where: { id: subscription.id },
          data: {
            autoRenew: !subscription.autoRenew,
          },
        });
        
        return NextResponse.json({ 
          message: `Auto-renewal ${updated.autoRenew ? "enabled" : "disabled"}`,
          autoRenew: updated.autoRenew,
        });
        
      case "resume":
        if (subscription.status !== "CANCELLED") {
          return NextResponse.json(
            { error: "Subscription is not cancelled" },
            { status: 400 }
          );
        }
        
        await db.subscription.update({
          where: { id: subscription.id },
          data: {
            status: "ACTIVE",
            cancelledAt: null,
            autoRenew: true,
          },
        });
        
        return NextResponse.json({ message: "Subscription resumed" });
        
      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error updating subscription:", error);
    return NextResponse.json(
      { error: "Failed to update subscription" },
      { status: 500 }
    );
  }
}
