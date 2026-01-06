// Purchases Management API
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const purchaseItemSchema = z.object({
  productType: z.string().min(1),
  productName: z.string().min(1),
  quantity: z.number().positive(),
  unit: z.string().min(1),
  unitPrice: z.number().min(0),
  inventoryItemId: z.string().optional(),
});

const createPurchaseSchema = z.object({
  purchaseDate: z.string().optional(),
  supplierId: z.string().optional(),
  supplierName: z.string().optional(),
  supplierPhone: z.string().optional(),
  tax: z.number().min(0).default(0),
  shippingCost: z.number().min(0).default(0),
  paymentMethod: z.enum(["CASH", "MOBILE_MONEY", "BANK_TRANSFER", "CREDIT", "OTHER"]).optional(),
  paymentStatus: z.enum(["PENDING", "PARTIAL", "PAID"]).default("PENDING"),
  paidAmount: z.number().min(0).default(0),
  expectedDelivery: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(purchaseItemSchema).min(1, "At least one item is required"),
});

// Generate purchase number
async function generatePurchaseNumber(userId: string): Promise<string> {
  const count = await db.purchase.count({ where: { userId } });
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  return `PO${year}${month}-${(count + 1).toString().padStart(4, "0")}`;
}

// GET - List purchases
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where: any = { userId: session.user.id };

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.purchaseDate = {};
      if (startDate) where.purchaseDate.gte = new Date(startDate);
      if (endDate) where.purchaseDate.lte = new Date(endDate);
    }

    const [purchases, total] = await Promise.all([
      db.purchase.findMany({
        where,
        include: {
          items: true,
          supplier: {
            select: { id: true, name: true, phone: true },
          },
        },
        orderBy: { purchaseDate: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.purchase.count({ where }),
    ]);

    // Calculate summary
    const summary = await db.purchase.aggregate({
      where: { userId: session.user.id },
      _sum: { totalAmount: true, paidAmount: true },
      _count: true,
    });

    return NextResponse.json({
      purchases,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      summary: {
        totalPurchases: summary._count,
        totalSpent: summary._sum.totalAmount || 0,
        totalPaid: summary._sum.paidAmount || 0,
        pendingPayment: (summary._sum.totalAmount || 0) - (summary._sum.paidAmount || 0),
      },
    });
  } catch (error) {
    console.error("Error fetching purchases:", error);
    return NextResponse.json(
      { error: "Failed to fetch purchases" },
      { status: 500 }
    );
  }
}

// POST - Create purchase
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createPurchaseSchema.parse(body);

    // Calculate totals
    const subtotal = validatedData.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
    const totalAmount = subtotal + validatedData.tax + validatedData.shippingCost;

    // Generate purchase number
    const purchaseNumber = await generatePurchaseNumber(session.user.id);

    // Determine payment status
    let paymentStatus = validatedData.paymentStatus;
    if (validatedData.paidAmount >= totalAmount) {
      paymentStatus = "PAID";
    } else if (validatedData.paidAmount > 0) {
      paymentStatus = "PARTIAL";
    }

    // Create purchase with items
    const purchase = await db.purchase.create({
      data: {
        userId: session.user.id,
        purchaseNumber,
        purchaseDate: validatedData.purchaseDate ? new Date(validatedData.purchaseDate) : new Date(),
        supplierId: validatedData.supplierId,
        supplierName: validatedData.supplierName,
        supplierPhone: validatedData.supplierPhone,
        subtotal,
        tax: validatedData.tax,
        shippingCost: validatedData.shippingCost,
        totalAmount,
        paymentMethod: validatedData.paymentMethod,
        paymentStatus,
        paidAmount: validatedData.paidAmount,
        paidAt: paymentStatus === "PAID" ? new Date() : null,
        expectedDelivery: validatedData.expectedDelivery ? new Date(validatedData.expectedDelivery) : null,
        status: "ORDERED",
        notes: validatedData.notes,
        items: {
          create: validatedData.items.map((item) => ({
            productType: item.productType,
            productName: item.productName,
            quantity: item.quantity,
            unit: item.unit,
            unitPrice: item.unitPrice,
            totalPrice: item.quantity * item.unitPrice,
            inventoryItemId: item.inventoryItemId,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    // Create expense record
    await db.expense.create({
      data: {
        userId: session.user.id,
        category: "OTHER",
        amount: totalAmount,
        date: validatedData.purchaseDate ? new Date(validatedData.purchaseDate) : new Date(),
        description: `Purchase #${purchaseNumber} - ${validatedData.items.map(i => i.productName).join(", ")}`,
        paymentMethod: validatedData.paymentMethod,
      },
    });

    return NextResponse.json(purchase, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating purchase:", error);
    return NextResponse.json(
      { error: "Failed to create purchase" },
      { status: 500 }
    );
  }
}
