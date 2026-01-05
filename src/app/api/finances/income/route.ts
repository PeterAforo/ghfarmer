import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { incomeSchema } from "@/lib/validations/finance";
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

    const incomes = await db.income.findMany({
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

    return NextResponse.json(incomes);
  } catch (error) {
    console.error("Error fetching income:", error);
    return NextResponse.json(
      { error: "Failed to fetch income" },
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
    const validatedData = incomeSchema.parse(body);

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

    const income = await db.income.create({
      data: {
        userId: session.user.id,
        cropEntryId: validatedData.cropEntryId,
        livestockEntryId: validatedData.livestockEntryId,
        productType: validatedData.productType,
        quantity: validatedData.quantity,
        quantityUnit: validatedData.quantityUnit,
        pricePerUnit: validatedData.pricePerUnit,
        totalAmount: validatedData.totalAmount,
        currency: validatedData.currency,
        date: new Date(validatedData.date),
        buyerName: validatedData.buyerName,
        buyerContact: validatedData.buyerContact,
        paymentMethod: validatedData.paymentMethod,
        notes: validatedData.notes,
      },
    });

    return NextResponse.json(income, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error creating income:", error);
    return NextResponse.json(
      { error: "Failed to create income" },
      { status: 500 }
    );
  }
}
