// Inventory Management API - Business tier feature
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireFeature } from "@/lib/feature-gate";
import { z } from "zod";

const createInventorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.enum([
    "SEEDS", "FERTILIZERS", "PESTICIDES", "HERBICIDES", "FUNGICIDES",
    "ANIMAL_FEED", "VETERINARY_DRUGS", "VACCINES", "EQUIPMENT", "TOOLS",
    "PACKAGING", "FUEL", "OTHER"
  ]),
  sku: z.string().optional(),
  quantity: z.number().min(0).default(0),
  unit: z.string().min(1, "Unit is required"),
  minQuantity: z.number().min(0).optional(),
  maxQuantity: z.number().min(0).optional(),
  unitCost: z.number().min(0).optional(),
  supplierId: z.string().optional(),
  supplierName: z.string().optional(),
  location: z.string().optional(),
  expiryDate: z.string().optional(),
  batchNumber: z.string().optional(),
  farmId: z.string().optional(),
});

// GET - List inventory items
export async function GET(request: NextRequest) {
  try {
    const gate = await requireFeature("inventoryManagement");
    if (!gate.allowed) {
      return NextResponse.json(
        { error: gate.error?.message, upgradeRequired: true },
        { status: gate.error?.status || 403 }
      );
    }

    const userId = gate.userId!;
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const lowStock = searchParams.get("lowStock") === "true";

    const where: any = { userId };
    if (category) where.category = category;
    if (status) where.status = status;

    let items = await db.inventoryItem.findMany({
      where,
      orderBy: { name: "asc" },
      include: {
        movements: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    // Filter low stock items
    if (lowStock) {
      items = items.filter(item => 
        item.minQuantity && item.quantity <= item.minQuantity
      );
    }

    // Calculate summary
    const summary = {
      totalItems: items.length,
      totalValue: items.reduce((sum, i) => sum + (i.totalValue || 0), 0),
      lowStockCount: items.filter(i => i.minQuantity && i.quantity <= i.minQuantity).length,
      outOfStockCount: items.filter(i => i.quantity === 0).length,
      byCategory: {} as Record<string, number>,
    };

    items.forEach(item => {
      summary.byCategory[item.category] = (summary.byCategory[item.category] || 0) + 1;
    });

    return NextResponse.json({ items, summary });
  } catch (error) {
    console.error("Error fetching inventory:", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory" },
      { status: 500 }
    );
  }
}

// POST - Create inventory item
export async function POST(request: NextRequest) {
  try {
    const gate = await requireFeature("inventoryManagement");
    if (!gate.allowed) {
      return NextResponse.json(
        { error: gate.error?.message, upgradeRequired: true },
        { status: gate.error?.status || 403 }
      );
    }

    const userId = gate.userId!;
    const body = await request.json();
    const validatedData = createInventorySchema.parse(body);

    const totalValue = validatedData.unitCost 
      ? validatedData.quantity * validatedData.unitCost 
      : null;

    // Determine status based on quantity
    let status: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" = "IN_STOCK";
    if (validatedData.quantity === 0) {
      status = "OUT_OF_STOCK";
    } else if (validatedData.minQuantity && validatedData.quantity <= validatedData.minQuantity) {
      status = "LOW_STOCK";
    }

    const item = await db.inventoryItem.create({
      data: {
        userId,
        name: validatedData.name,
        category: validatedData.category,
        sku: validatedData.sku,
        quantity: validatedData.quantity,
        unit: validatedData.unit,
        minQuantity: validatedData.minQuantity,
        maxQuantity: validatedData.maxQuantity,
        unitCost: validatedData.unitCost,
        totalValue,
        supplierId: validatedData.supplierId,
        supplierName: validatedData.supplierName,
        location: validatedData.location,
        expiryDate: validatedData.expiryDate ? new Date(validatedData.expiryDate) : null,
        batchNumber: validatedData.batchNumber,
        farmId: validatedData.farmId,
        status,
      },
    });

    // Create initial movement if quantity > 0
    if (validatedData.quantity > 0) {
      await db.inventoryMovement.create({
        data: {
          inventoryItemId: item.id,
          userId,
          movementType: "PURCHASE",
          quantity: validatedData.quantity,
          previousQuantity: 0,
          newQuantity: validatedData.quantity,
          notes: "Initial stock",
        },
      });
    }

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating inventory item:", error);
    return NextResponse.json(
      { error: "Failed to create inventory item" },
      { status: 500 }
    );
  }
}
