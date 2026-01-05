// Inventory Item API - Get, Update, Delete
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireFeature } from "@/lib/feature-gate";
import { z } from "zod";

const updateInventorySchema = z.object({
  name: z.string().min(1).optional(),
  category: z.enum([
    "SEEDS", "FERTILIZERS", "PESTICIDES", "HERBICIDES", "FUNGICIDES",
    "ANIMAL_FEED", "VETERINARY_DRUGS", "VACCINES", "EQUIPMENT", "TOOLS",
    "PACKAGING", "FUEL", "OTHER"
  ]).optional(),
  sku: z.string().optional(),
  minQuantity: z.number().min(0).optional(),
  maxQuantity: z.number().min(0).optional(),
  unitCost: z.number().min(0).optional(),
  supplierName: z.string().optional(),
  location: z.string().optional(),
  expiryDate: z.string().optional(),
  batchNumber: z.string().optional(),
});

const movementSchema = z.object({
  movementType: z.enum(["PURCHASE", "USAGE", "SALE", "ADJUSTMENT", "TRANSFER", "RETURN", "EXPIRED", "DAMAGED"]),
  quantity: z.number().positive("Quantity must be positive"),
  notes: z.string().optional(),
  referenceType: z.string().optional(),
  referenceId: z.string().optional(),
});

// GET - Get single inventory item
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const gate = await requireFeature("inventoryManagement");
    if (!gate.allowed) {
      return NextResponse.json(
        { error: gate.error?.message, upgradeRequired: true },
        { status: gate.error?.status || 403 }
      );
    }

    const { id } = await params;
    const userId = gate.userId!;

    const item = await db.inventoryItem.findFirst({
      where: { id, userId },
      include: {
        movements: {
          orderBy: { createdAt: "desc" },
          take: 50,
        },
      },
    });

    if (!item) {
      return NextResponse.json(
        { error: "Inventory item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error("Error fetching inventory item:", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory item" },
      { status: 500 }
    );
  }
}

// PATCH - Update inventory item or add movement
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const gate = await requireFeature("inventoryManagement");
    if (!gate.allowed) {
      return NextResponse.json(
        { error: gate.error?.message, upgradeRequired: true },
        { status: gate.error?.status || 403 }
      );
    }

    const { id } = await params;
    const userId = gate.userId!;
    const body = await request.json();

    // Check if this is a movement or update
    if (body.movementType) {
      // This is a stock movement
      const validatedMovement = movementSchema.parse(body);

      const item = await db.inventoryItem.findFirst({
        where: { id, userId },
      });

      if (!item) {
        return NextResponse.json(
          { error: "Inventory item not found" },
          { status: 404 }
        );
      }

      // Calculate new quantity based on movement type
      let newQuantity = item.quantity;
      const isAddition = ["PURCHASE", "RETURN", "ADJUSTMENT"].includes(validatedMovement.movementType);
      const isSubtraction = ["USAGE", "SALE", "EXPIRED", "DAMAGED", "TRANSFER"].includes(validatedMovement.movementType);

      if (isAddition) {
        newQuantity = item.quantity + validatedMovement.quantity;
      } else if (isSubtraction) {
        newQuantity = item.quantity - validatedMovement.quantity;
        if (newQuantity < 0) {
          return NextResponse.json(
            { error: "Insufficient stock" },
            { status: 400 }
          );
        }
      }

      // Determine new status
      let status: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" = "IN_STOCK";
      if (newQuantity === 0) {
        status = "OUT_OF_STOCK";
      } else if (item.minQuantity && newQuantity <= item.minQuantity) {
        status = "LOW_STOCK";
      }

      // Update item and create movement in transaction
      const result = await db.$transaction(async (tx) => {
        const movement = await tx.inventoryMovement.create({
          data: {
            inventoryItemId: id,
            userId,
            movementType: validatedMovement.movementType,
            quantity: validatedMovement.quantity,
            previousQuantity: item.quantity,
            newQuantity,
            notes: validatedMovement.notes,
            referenceType: validatedMovement.referenceType,
            referenceId: validatedMovement.referenceId,
          },
        });

        const updatedItem = await tx.inventoryItem.update({
          where: { id },
          data: {
            quantity: newQuantity,
            totalValue: item.unitCost ? newQuantity * item.unitCost : null,
            status,
          },
          include: {
            movements: {
              orderBy: { createdAt: "desc" },
              take: 10,
            },
          },
        });

        return { item: updatedItem, movement };
      });

      return NextResponse.json(result);
    } else {
      // This is a regular update
      const validatedData = updateInventorySchema.parse(body);

      const item = await db.inventoryItem.findFirst({
        where: { id, userId },
      });

      if (!item) {
        return NextResponse.json(
          { error: "Inventory item not found" },
          { status: 404 }
        );
      }

      // Recalculate total value if unit cost changed
      let totalValue = item.totalValue;
      if (validatedData.unitCost !== undefined) {
        totalValue = item.quantity * validatedData.unitCost;
      }

      // Recalculate status if minQuantity changed
      let status = item.status;
      if (validatedData.minQuantity !== undefined) {
        if (item.quantity === 0) {
          status = "OUT_OF_STOCK";
        } else if (item.quantity <= validatedData.minQuantity) {
          status = "LOW_STOCK";
        } else {
          status = "IN_STOCK";
        }
      }

      const updatedItem = await db.inventoryItem.update({
        where: { id },
        data: {
          ...validatedData,
          expiryDate: validatedData.expiryDate ? new Date(validatedData.expiryDate) : undefined,
          totalValue,
          status,
        },
      });

      return NextResponse.json(updatedItem);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating inventory item:", error);
    return NextResponse.json(
      { error: "Failed to update inventory item" },
      { status: 500 }
    );
  }
}

// DELETE - Delete inventory item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const gate = await requireFeature("inventoryManagement");
    if (!gate.allowed) {
      return NextResponse.json(
        { error: gate.error?.message, upgradeRequired: true },
        { status: gate.error?.status || 403 }
      );
    }

    const { id } = await params;
    const userId = gate.userId!;

    const item = await db.inventoryItem.findFirst({
      where: { id, userId },
    });

    if (!item) {
      return NextResponse.json(
        { error: "Inventory item not found" },
        { status: 404 }
      );
    }

    await db.inventoryItem.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Inventory item deleted" });
  } catch (error) {
    console.error("Error deleting inventory item:", error);
    return NextResponse.json(
      { error: "Failed to delete inventory item" },
      { status: 500 }
    );
  }
}
