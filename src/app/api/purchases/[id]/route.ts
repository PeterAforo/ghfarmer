// Purchase Detail API
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const updatePurchaseSchema = z.object({
  supplierName: z.string().optional(),
  supplierPhone: z.string().optional(),
  paymentStatus: z.enum(["PENDING", "PARTIAL", "PAID", "CANCELLED"]).optional(),
  paymentMethod: z.enum(["CASH", "MOBILE_MONEY", "BANK_TRANSFER", "CREDIT", "OTHER"]).optional(),
  paidAmount: z.number().min(0).optional(),
  status: z.enum(["ORDERED", "SHIPPED", "PARTIAL_RECEIVED", "RECEIVED", "CANCELLED"]).optional(),
  notes: z.string().optional(),
});

// GET - Get purchase details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const purchase = await db.purchase.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        items: {
          include: {
            inventoryItem: {
              select: { id: true, name: true, quantity: true },
            },
          },
        },
        supplier: true,
      },
    });

    if (!purchase) {
      return NextResponse.json({ error: "Purchase not found" }, { status: 404 });
    }

    return NextResponse.json(purchase);
  } catch (error) {
    console.error("Error fetching purchase:", error);
    return NextResponse.json(
      { error: "Failed to fetch purchase" },
      { status: 500 }
    );
  }
}

// PATCH - Update purchase (including receiving items)
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
    const validatedData = updatePurchaseSchema.parse(body);

    const existingPurchase = await db.purchase.findFirst({
      where: { id, userId: session.user.id },
      include: { items: true },
    });

    if (!existingPurchase) {
      return NextResponse.json({ error: "Purchase not found" }, { status: 404 });
    }

    // Handle receiving items - add to inventory
    if (validatedData.status === "RECEIVED" && existingPurchase.status !== "RECEIVED") {
      for (const item of existingPurchase.items) {
        if (item.inventoryItemId) {
          const inventoryItem = await db.inventoryItem.findUnique({
            where: { id: item.inventoryItemId },
          });

          if (inventoryItem) {
            const newQuantity = inventoryItem.quantity + item.quantity;

            await db.inventoryItem.update({
              where: { id: item.inventoryItemId },
              data: {
                quantity: newQuantity,
                status: newQuantity > 0 ? "IN_STOCK" : "OUT_OF_STOCK",
                unitCost: item.unitPrice,
                totalValue: newQuantity * item.unitPrice,
              },
            });

            await db.inventoryMovement.create({
              data: {
                inventoryItemId: item.inventoryItemId,
                userId: session.user.id,
                movementType: "PURCHASE",
                quantity: item.quantity,
                previousQuantity: inventoryItem.quantity,
                newQuantity,
                referenceType: "purchase",
                referenceId: existingPurchase.id,
                notes: `Received from ${existingPurchase.purchaseNumber}`,
              },
            });
          }
        }

        // Update received quantity
        await db.purchaseItem.update({
          where: { id: item.id },
          data: { receivedQuantity: item.quantity },
        });
      }
    }

    // Determine payment status
    let paymentStatus = validatedData.paymentStatus || existingPurchase.paymentStatus;
    const paidAmount = validatedData.paidAmount ?? existingPurchase.paidAmount;

    if (paidAmount >= existingPurchase.totalAmount) {
      paymentStatus = "PAID";
    } else if (paidAmount > 0 && paymentStatus !== "CANCELLED") {
      paymentStatus = "PARTIAL";
    }

    const purchase = await db.purchase.update({
      where: { id },
      data: {
        supplierName: validatedData.supplierName,
        supplierPhone: validatedData.supplierPhone,
        paymentStatus,
        paymentMethod: validatedData.paymentMethod,
        paidAmount,
        paidAt: paymentStatus === "PAID" && !existingPurchase.paidAt ? new Date() : existingPurchase.paidAt,
        status: validatedData.status,
        receivedAt: validatedData.status === "RECEIVED" ? new Date() : existingPurchase.receivedAt,
        notes: validatedData.notes,
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json(purchase);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating purchase:", error);
    return NextResponse.json(
      { error: "Failed to update purchase" },
      { status: 500 }
    );
  }
}

// DELETE - Delete purchase
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

    const purchase = await db.purchase.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!purchase) {
      return NextResponse.json({ error: "Purchase not found" }, { status: 404 });
    }

    await db.purchase.delete({ where: { id } });

    return NextResponse.json({ message: "Purchase deleted successfully" });
  } catch (error) {
    console.error("Error deleting purchase:", error);
    return NextResponse.json(
      { error: "Failed to delete purchase" },
      { status: 500 }
    );
  }
}
