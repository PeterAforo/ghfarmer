import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { ALL_RULES } from "@/lib/dse";

// GET /api/dse/explain?recommendationId=xxx - Explain why a recommendation was generated
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const recommendationId = searchParams.get("recommendationId");

    if (!recommendationId) {
      return NextResponse.json({ error: "recommendationId is required" }, { status: 400 });
    }

    const recommendation = await db.recommendation.findFirst({
      where: {
        id: recommendationId,
        userId: session.user.id,
      },
    });

    if (!recommendation) {
      return NextResponse.json({ error: "Recommendation not found" }, { status: 404 });
    }

    // Get the rule that generated this recommendation
    const evidence = recommendation.evidence as any;
    const ruleCode = evidence?.rulesFired?.[0];
    const rule = ALL_RULES.find((r) => r.code === ruleCode);

    // Build explanation
    const explanation = {
      recommendation: {
        id: recommendation.id,
        title: recommendation.title,
        category: recommendation.category,
        priority: recommendation.priority,
        confidence: recommendation.confidence,
        confidenceLabel: recommendation.confidenceLabel,
      },
      reasoning: {
        summary: `This recommendation was generated because ${(recommendation.reason as string[])?.[0] || "conditions were met"}.`,
        factors: (recommendation.reason as string[]) || [],
        dataUsed: evidence?.features || [],
      },
      rule: rule
        ? {
            code: rule.code,
            name: rule.name,
            description: rule.description,
            category: rule.category,
            version: rule.version,
          }
        : null,
      confidence: {
        score: recommendation.confidence,
        label: recommendation.confidenceLabel,
        explanation: getConfidenceExplanation(recommendation.confidence),
      },
      impact: recommendation.impactType
        ? {
            type: recommendation.impactType,
            value: recommendation.impactValue,
            explanation: getImpactExplanation(recommendation.impactType, recommendation.impactValue),
          }
        : null,
      actions: {
        recommended: recommendation.actionSteps,
        alternatives: getAlternativeActions(recommendation.category),
      },
      learnMore: {
        url: rule?.actions?.[0]?.explainMoreUrl || `/knowledge/${recommendation.category.toLowerCase()}`,
        topics: getRelatedTopics(recommendation.category),
      },
      generatedAt: recommendation.createdAt,
      modelVersion: recommendation.modelVersion,
    };

    return NextResponse.json(explanation);
  } catch (error) {
    console.error("Error explaining recommendation:", error);
    return NextResponse.json({ error: "Failed to explain recommendation" }, { status: 500 });
  }
}

function getConfidenceExplanation(confidence: number): string {
  if (confidence >= 0.8) {
    return "High confidence: Based on strong evidence and well-established agricultural practices.";
  } else if (confidence >= 0.5) {
    return "Medium confidence: Based on available data, but some factors may vary. Consider local conditions.";
  } else {
    return "Low confidence: Limited data available. Consult with extension officer for confirmation.";
  }
}

function getImpactExplanation(type: string, value: number | null): string {
  const percentage = value ? Math.round(value * 100) : 0;
  
  switch (type) {
    case "yield_increase":
      return `Following this recommendation could increase yield by approximately ${percentage}%.`;
    case "yield_protection":
      return `This helps protect your yield from potential ${percentage}% loss.`;
    case "loss_prevention":
      return `This could prevent up to ${percentage}% loss of your harvest.`;
    case "mortality_prevention":
      return `This could reduce mortality risk by approximately ${percentage}%.`;
    case "cost_saving":
      return `This could save approximately ${percentage}% on related costs.`;
    case "productivity_improvement":
      return `This could improve productivity by approximately ${percentage}%.`;
    default:
      return `Expected positive impact on farm performance.`;
  }
}

function getAlternativeActions(category: string): string[] {
  switch (category) {
    case "CROP":
      return [
        "Consult with local extension officer",
        "Check with neighboring farmers",
        "Review crop calendar for your region",
      ];
    case "LIVESTOCK":
      return [
        "Contact veterinary officer",
        "Check with local agro-vet shop",
        "Review vaccination schedule",
      ];
    case "WEATHER":
      return [
        "Monitor weather updates",
        "Prepare protective measures",
        "Adjust farm activities accordingly",
      ];
    case "FINANCE":
      return [
        "Review expense records",
        "Consult with farm advisor",
        "Compare with similar farms",
      ];
    default:
      return [
        "Consult with agricultural expert",
        "Review best practices",
      ];
  }
}

function getRelatedTopics(category: string): string[] {
  switch (category) {
    case "CROP":
      return ["Fertilizer application", "Pest management", "Harvest timing", "Post-harvest handling"];
    case "LIVESTOCK":
      return ["Vaccination schedules", "Feed management", "Disease prevention", "Housing"];
    case "WEATHER":
      return ["Seasonal planning", "Irrigation", "Crop protection", "Storage"];
    case "FINANCE":
      return ["Cost tracking", "Budgeting", "Market timing", "Input sourcing"];
    default:
      return ["Farm management", "Best practices"];
  }
}
