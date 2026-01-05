import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { expenseSchema } from "@/lib/validations/finance";
import { z } from "zod";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const farmId = searchParams.get("farmId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const expenses = await db.expense.findMany({
      where: {
        userId: session.user.id,
        ...(startDate && endDate && {
          date: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        }),
      },
      include: {
        cropEntry: {
          include: { crop: { select: { englishName: true } } },
        },
        livestockEntry: {
          include: { livestock: { select: { englishName: true } } },
        },
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(expenses);
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return NextResponse.json(
      { error: "Failed to fetch expenses" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = expenseSchema.parse(body);

    // Get farmId from crop or livestock entry if provided
    let farmId: string | undefined;
    
    if (validatedData.cropEntryId) {
      const cropEntry = await db.cropEntry.findFirst({
        where: { id: validatedData.cropEntryId, userId: session.user.id },
      });
      if (cropEntry) farmId = cropEntry.farmId;
    } else if (validatedData.livestockEntryId) {
      const livestockEntry = await db.livestockEntry.findFirst({
        where: { id: validatedData.livestockEntryId, userId: session.user.id },
      });
      if (livestockEntry) farmId = livestockEntry.farmId;
    }

    const expense = await db.expense.create({
      data: {
        userId: session.user.id,
        cropEntryId: validatedData.cropEntryId,
        livestockEntryId: validatedData.livestockEntryId,
        category: validatedData.category,
        amount: validatedData.amount,
        currency: validatedData.currency,
        date: new Date(validatedData.date),
        description: validatedData.description,
        paymentMethod: validatedData.paymentMethod,
      },
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error creating expense:", error);
    return NextResponse.json(
      { error: "Failed to create expense" },
      { status: 500 }
    );
  }
}
