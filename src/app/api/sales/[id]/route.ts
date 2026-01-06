// Sales Detail API
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const updateSaleSchema = z.object({
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  customerEmail: z.string().email().optional().or(z.literal("")),
  customerAddress: z.string().optional(),
  paymentStatus: z.enum(["PENDING", "PARTIAL", "PAID", "CANCELLED", "REFUNDED"]).optional(),
  paymentMethod: z.enum(["CASH", "MOBILE_MONEY", "BANK_TRANSFER", "CREDIT", "OTHER"]).optional(),
  paidAmount: z.number().min(0).optional(),
  notes: z.string().optional(),
});

// GET - Get sale details
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

    const sale = await db.sale.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        items: {
          include: {
            cropEntry: {
              select: { id: true, crop: { select: { englishName: true } } },
            },
            livestockEntry: {
              select: { id: true, livestock: { select: { englishName: true } } },
            },
            inventoryItem: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    if (!sale) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 });
    }

    return NextResponse.json(sale);
  } catch (error) {
    console.error("Error fetching sale:", error);
    return NextResponse.json(
      { error: "Failed to fetch sale" },
      { status: 500 }
    );
  }
}

// PATCH - Update sale
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
    const validatedData = updateSaleSchema.parse(body);

    const existingSale = await db.sale.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existingSale) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 });
    }

    // Determine payment status
    let paymentStatus = validatedData.paymentStatus || existingSale.paymentStatus;
    const paidAmount = validatedData.paidAmount ?? existingSale.paidAmount;

    if (paidAmount >= existingSale.totalAmount) {
      paymentStatus = "PAID";
    } else if (paidAmount > 0 && paymentStatus !== "CANCELLED" && paymentStatus !== "REFUNDED") {
      paymentStatus = "PARTIAL";
    }

    const sale = await db.sale.update({
      where: { id },
      data: {
        customerName: validatedData.customerName,
        customerPhone: validatedData.customerPhone,
        customerEmail: validatedData.customerEmail || null,
        customerAddress: validatedData.customerAddress,
        paymentStatus,
        paymentMethod: validatedData.paymentMethod,
        paidAmount,
        paidAt: paymentStatus === "PAID" && !existingSale.paidAt ? new Date() : existingSale.paidAt,
        notes: validatedData.notes,
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json(sale);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating sale:", error);
    return NextResponse.json(
      { error: "Failed to update sale" },
      { status: 500 }
    );
  }
}

// DELETE - Delete sale
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

    const sale = await db.sale.findFirst({
      where: { id, userId: session.user.id },
      include: { items: true },
    });

    if (!sale) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 });
    }

    // Restore inventory quantities
    for (const item of sale.items) {
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
              status: newQuantity > 0 ? 
                (inventoryItem.minQuantity && newQuantity <= inventoryItem.minQuantity) ? "LOW_STOCK" : "IN_STOCK"
                : "OUT_OF_STOCK",
            },
          });

          await db.inventoryMovement.create({
            data: {
              inventoryItemId: item.inventoryItemId,
              userId: session.user.id,
              movementType: "RETURN",
              quantity: item.quantity,
              previousQuantity: inventoryItem.quantity,
              newQuantity,
              referenceType: "sale_deleted",
              referenceId: sale.id,
              notes: `Restored from deleted sale ${sale.saleNumber}`,
            },
          });
        }
      }

      // Restore livestock status if applicable
      if (item.livestockEntryId && item.productType === "LIVESTOCK") {
        await db.livestockEntry.update({
          where: { id: item.livestockEntryId },
          data: {
            status: "ACTIVE",
            exitDate: null,
            exitReason: null,
          },
        });
      }
    }

    await db.sale.delete({ where: { id } });

    return NextResponse.json({ message: "Sale deleted successfully" });
  } catch (error) {
    console.error("Error deleting sale:", error);
    return NextResponse.json(
      { error: "Failed to delete sale" },
      { status: 500 }
    );
  }
}
