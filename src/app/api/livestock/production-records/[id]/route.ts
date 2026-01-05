import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// Update production record with actual values
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const {
      actualEggCount,
      actualMilkVolume,
      actualWeight,
      actualRevenue,
      unitPrice,
      mortalityCount,
      setbackType,
      setbackNotes,
      varianceReason,
      notes,
    } = body;

    // Verify the production record belongs to user's livestock
    const productionRecord = await db.productionRecord.findFirst({
      where: {
        id,
        livestockEntry: {
          userId: session.user.id,
        },
      },
    });

    if (!productionRecord) {
      return NextResponse.json({ error: "Production record not found" }, { status: 404 });
    }

    // Calculate variance if we have both expected and actual values
    let variance: number | null = null;
    let status: "EXPECTED" | "RECORDED" | "MISSED" | "BELOW_TARGET" | "ON_TARGET" = "RECORDED";

    // Determine which expected/actual pair to use for variance
    let expectedValue: number | null = null;
    let actualValue: number | null = null;

    if (productionRecord.type === "EGGS") {
      expectedValue = productionRecord.expectedEggCount;
      actualValue = actualEggCount ?? productionRecord.actualEggCount;
    } else if (productionRecord.type === "MILK") {
      expectedValue = productionRecord.expectedMilkVolume;
      actualValue = actualMilkVolume ?? productionRecord.actualMilkVolume;
    } else if (productionRecord.type === "WEIGHT") {
      expectedValue = productionRecord.expectedWeight;
      actualValue = actualWeight ?? productionRecord.actualWeight;
    }

    if (expectedValue && actualValue) {
      variance = ((actualValue - expectedValue) / expectedValue) * 100;
      status = variance >= 0 ? "ON_TARGET" : "BELOW_TARGET";
    }

    // Calculate actual revenue if we have actual values and unit price
    let calculatedActualRevenue = actualRevenue;
    const priceToUse = unitPrice ?? productionRecord.unitPrice;

    if (!calculatedActualRevenue && priceToUse) {
      if (actualEggCount !== undefined) {
        calculatedActualRevenue = actualEggCount * priceToUse;
      } else if (actualMilkVolume !== undefined) {
        calculatedActualRevenue = actualMilkVolume * priceToUse;
      } else if (actualWeight !== undefined) {
        // For weight, we need to consider quantity - get from livestock entry
        const entry = await db.livestockEntry.findUnique({
          where: { id: productionRecord.livestockEntryId },
          select: { quantity: true },
        });
        calculatedActualRevenue = actualWeight * (entry?.quantity || 1) * priceToUse;
      }
    }

    // Update the production record
    const updatedRecord = await db.productionRecord.update({
      where: { id },
      data: {
        ...(actualEggCount !== undefined && { actualEggCount }),
        ...(actualMilkVolume !== undefined && { actualMilkVolume }),
        ...(actualWeight !== undefined && { actualWeight }),
        ...(calculatedActualRevenue !== undefined && { actualRevenue: calculatedActualRevenue }),
        ...(unitPrice !== undefined && { unitPrice }),
        ...(mortalityCount !== undefined && { mortalityCount }),
        ...(setbackType !== undefined && { setbackType }),
        ...(setbackNotes !== undefined && { setbackNotes }),
        ...(varianceReason !== undefined && { varianceReason }),
        ...(notes !== undefined && { notes }),
        ...(variance !== null && { variance }),
        status,
      },
    });

    return NextResponse.json(updatedRecord);
  } catch (error) {
    console.error("Error updating production record:", error);
    return NextResponse.json(
      { error: "Failed to update production record" },
      { status: 500 }
    );
  }
}

// Delete production record
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify the production record belongs to user's livestock
    const productionRecord = await db.productionRecord.findFirst({
      where: {
        id,
        livestockEntry: {
          userId: session.user.id,
        },
      },
    });

    if (!productionRecord) {
      return NextResponse.json({ error: "Production record not found" }, { status: 404 });
    }

    await db.productionRecord.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting production record:", error);
    return NextResponse.json(
      { error: "Failed to delete production record" },
      { status: 500 }
    );
  }
}
