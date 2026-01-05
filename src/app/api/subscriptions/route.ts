// Subscription API - List plans and manage subscriptions
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

// GET - List all subscription plans
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const audience = searchParams.get("audience"); // FARMER, SERVICE_PROVIDER, BOTH
    
    const where: any = { isActive: true };
    if (audience) {
      where.targetAudience = { in: [audience, "BOTH"] };
    }
    
    const plans = await db.subscriptionPlan.findMany({
      where,
      orderBy: { displayOrder: "asc" },
    });
    
    return NextResponse.json(plans);
  } catch (error) {
    console.error("Error fetching plans:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription plans" },
      { status: 500 }
    );
  }
}

// POST - Create a new subscription (upgrade/subscribe)
const subscribeSchema = z.object({
  planId: z.string(),
  billingCycle: z.enum(["MONTHLY", "YEARLY"]).default("MONTHLY"),
  paymentMethod: z.string().optional(),
  paymentReference: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const body = await request.json();
    const validatedData = subscribeSchema.parse(body);
    
    // Get the plan
    const plan = await db.subscriptionPlan.findUnique({
      where: { id: validatedData.planId },
    });
    
    if (!plan || !plan.isActive) {
      return NextResponse.json(
        { error: "Invalid or inactive plan" },
        { status: 400 }
      );
    }
    
    // Check for existing active subscription
    const existingSubscription = await db.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: { in: ["ACTIVE", "TRIALING"] },
      },
    });
    
    // Calculate dates
    const startDate = new Date();
    const endDate = new Date();
    if (validatedData.billingCycle === "MONTHLY") {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }
    
    // Calculate price
    const price = validatedData.billingCycle === "MONTHLY" 
      ? plan.priceMonthly 
      : plan.priceYearly;
    
    // Use transaction to create subscription and update user
    const result = await db.$transaction(async (tx) => {
      // Cancel existing subscription if any
      if (existingSubscription) {
        await tx.subscription.update({
          where: { id: existingSubscription.id },
          data: {
            status: "CANCELLED",
            cancelledAt: new Date(),
          },
        });
      }
      
      // Create new subscription
      const subscription = await tx.subscription.create({
        data: {
          userId: session.user.id,
          planId: plan.id,
          status: price === 0 ? "ACTIVE" : "ACTIVE", // Would be PENDING if payment required
          billingCycle: validatedData.billingCycle,
          startDate,
          endDate,
          nextPaymentAt: endDate,
          paymentMethod: validatedData.paymentMethod,
          paymentReference: validatedData.paymentReference,
        },
        include: { plan: true },
      });
      
      // Update user's subscription tier
      await tx.user.update({
        where: { id: session.user.id },
        data: {
          subscription: plan.slug.toUpperCase() as any,
          subscriptionEndsAt: endDate,
        },
      });
      
      // Create payment record if price > 0
      if (price > 0) {
        await tx.payment.create({
          data: {
            subscriptionId: subscription.id,
            userId: session.user.id,
            amount: price,
            currency: plan.currency,
            paymentType: "SUBSCRIPTION",
            paymentMethod: validatedData.paymentMethod,
            reference: validatedData.paymentReference,
            status: "PAID", // Would be PENDING in real payment flow
            paidAt: new Date(),
            description: `${plan.name} - ${validatedData.billingCycle} subscription`,
          },
        });
      }
      
      return subscription;
    });
    
    return NextResponse.json({
      message: "Subscription created successfully",
      subscription: result,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating subscription:", error);
    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 }
    );
  }
}
