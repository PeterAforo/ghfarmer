import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const feedbackSchema = z.object({
  recommendationId: z.string(),
  feedbackType: z.enum(["HELPFUL", "NOT_HELPFUL", "COMPLETED", "DISMISSED", "INCORRECT"]),
  rating: z.number().min(1).max(5).optional(),
  comment: z.string().optional(),
  actionTaken: z.boolean().optional(),
  outcomeNotes: z.string().optional(),
});

// POST /api/dse/feedback - Submit feedback on a recommendation
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = feedbackSchema.parse(body);

    // Verify recommendation belongs to user
    const recommendation = await db.recommendation.findFirst({
      where: {
        id: data.recommendationId,
        userId: session.user.id,
      },
    });

    if (!recommendation) {
      return NextResponse.json({ error: "Recommendation not found" }, { status: 404 });
    }

    // Create feedback
    const feedback = await db.recommendationFeedback.create({
      data: {
        recommendationId: data.recommendationId,
        userId: session.user.id,
        feedbackType: data.feedbackType,
        rating: data.rating,
        comment: data.comment,
        actionTaken: data.actionTaken,
        outcomeNotes: data.outcomeNotes,
      },
    });

    // Update recommendation status based on feedback
    if (data.feedbackType === "COMPLETED") {
      await db.recommendation.update({
        where: { id: data.recommendationId },
        data: { status: "COMPLETED", completedAt: new Date() },
      });
    } else if (data.feedbackType === "DISMISSED" || data.feedbackType === "NOT_HELPFUL") {
      await db.recommendation.update({
        where: { id: data.recommendationId },
        data: { status: "DISMISSED", dismissedAt: new Date() },
      });
    }

    return NextResponse.json(feedback, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error("Error submitting feedback:", error);
    return NextResponse.json({ error: "Failed to submit feedback" }, { status: 500 });
  }
}

// GET /api/dse/feedback - Get feedback history
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const recommendationId = searchParams.get("recommendationId");

    const feedback = await db.recommendationFeedback.findMany({
      where: {
        userId: session.user.id,
        ...(recommendationId && { recommendationId }),
      },
      include: {
        recommendation: {
          select: {
            id: true,
            title: true,
            category: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json(feedback);
  } catch (error) {
    console.error("Error getting feedback:", error);
    return NextResponse.json({ error: "Failed to get feedback" }, { status: 500 });
  }
}
