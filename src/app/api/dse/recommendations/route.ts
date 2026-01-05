import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { RulesEngine, buildEvaluationContext, ALL_RULES } from "@/lib/dse";

// GET /api/dse/recommendations - Get recommendations for user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const farmId = searchParams.get("farmId") || undefined;
    const category = searchParams.get("category");
    const priority = searchParams.get("priority");
    const includeExpired = searchParams.get("includeExpired") === "true";

    // Check for cached recommendations first
    const cachedRecs = await db.recommendation.findMany({
      where: {
        userId: session.user.id,
        ...(farmId && { farmId }),
        ...(category && { category: category as any }),
        ...(priority && { priority: priority as any }),
        status: "ACTIVE",
        ...(!includeExpired && {
          OR: [
            { validUntil: null },
            { validUntil: { gte: new Date() } },
          ],
        }),
      },
      orderBy: [
        { priority: "asc" },
        { createdAt: "desc" },
      ],
      take: 50,
    });

    // If we have recent recommendations (less than 1 hour old), return them
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const hasRecentRecs = cachedRecs.some((r) => r.createdAt > oneHourAgo);

    if (hasRecentRecs && cachedRecs.length > 0) {
      return NextResponse.json({
        recommendations: cachedRecs,
        source: "cache",
        generatedAt: cachedRecs[0]?.createdAt,
      });
    }

    // Generate fresh recommendations
    const context = await buildEvaluationContext(session.user.id, farmId);
    const engine = new RulesEngine(ALL_RULES);
    const newRecs = engine.evaluate(context);

    // Store new recommendations
    if (newRecs.length > 0) {
      // Mark old recommendations as expired
      await db.recommendation.updateMany({
        where: {
          userId: session.user.id,
          status: "ACTIVE",
        },
        data: {
          status: "EXPIRED",
        },
      });

      // Insert new recommendations
      await db.recommendation.createMany({
        data: newRecs.map((rec) => ({
          userId: session.user.id,
          farmId: rec.farmId,
          category: rec.category as any,
          priority: rec.priority.toUpperCase() as any,
          title: rec.title,
          description: rec.description,
          actionSteps: rec.actionSteps,
          reason: rec.reason,
          impactType: rec.impact?.type,
          impactValue: rec.impact?.value,
          confidence: rec.confidence,
          confidenceLabel: rec.confidenceLabel.toUpperCase() as any,
          evidence: rec.evidence,
          modelVersion: rec.modelVersion,
          validFrom: rec.validFrom,
          validUntil: rec.validUntil,
          entityType: rec.entityType as any,
          entityId: rec.entityId,
          status: "ACTIVE",
        })),
      });
    }

    // Fetch the newly created recommendations
    const freshRecs = await db.recommendation.findMany({
      where: {
        userId: session.user.id,
        status: "ACTIVE",
        ...(category && { category: category as any }),
        ...(priority && { priority: priority as any }),
      },
      orderBy: [
        { priority: "asc" },
        { createdAt: "desc" },
      ],
      take: 50,
    });

    return NextResponse.json({
      recommendations: freshRecs,
      source: "generated",
      generatedAt: new Date(),
      rulesEvaluated: ALL_RULES.length,
      context: {
        cropsCount: context.crops.length,
        livestockCount: context.livestock.length,
        season: context.currentSeason,
      },
    });
  } catch (error) {
    console.error("Error getting recommendations:", error);
    return NextResponse.json(
      { error: "Failed to get recommendations" },
      { status: 500 }
    );
  }
}

// POST /api/dse/recommendations/refresh - Force refresh recommendations
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const farmId = body.farmId;

    // Generate fresh recommendations
    const context = await buildEvaluationContext(session.user.id, farmId);
    const engine = new RulesEngine(ALL_RULES);
    const newRecs = engine.evaluate(context);

    // Mark old recommendations as expired
    await db.recommendation.updateMany({
      where: {
        userId: session.user.id,
        status: "ACTIVE",
      },
      data: {
        status: "EXPIRED",
      },
    });

    // Insert new recommendations
    if (newRecs.length > 0) {
      await db.recommendation.createMany({
        data: newRecs.map((rec) => ({
          userId: session.user.id,
          farmId: rec.farmId,
          category: rec.category as any,
          priority: rec.priority.toUpperCase() as any,
          title: rec.title,
          description: rec.description,
          actionSteps: rec.actionSteps,
          reason: rec.reason,
          impactType: rec.impact?.type,
          impactValue: rec.impact?.value,
          confidence: rec.confidence,
          confidenceLabel: rec.confidenceLabel.toUpperCase() as any,
          evidence: rec.evidence,
          modelVersion: rec.modelVersion,
          validFrom: rec.validFrom,
          validUntil: rec.validUntil,
          entityType: rec.entityType as any,
          entityId: rec.entityId,
          status: "ACTIVE",
        })),
      });
    }

    return NextResponse.json({
      success: true,
      recommendationsGenerated: newRecs.length,
      generatedAt: new Date(),
    });
  } catch (error) {
    console.error("Error refreshing recommendations:", error);
    return NextResponse.json(
      { error: "Failed to refresh recommendations" },
      { status: 500 }
    );
  }
}
