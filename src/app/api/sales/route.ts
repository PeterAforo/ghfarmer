// Sales Management API
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const saleItemSchema = z.object({
  productType: z.enum(["CROP", "LIVESTOCK", "EGGS", "MILK", "FISH", "PRODUCE", "OTHER"]),
  productName: z.string().min(1),
  quantity: z.number().positive(),
  unit: z.string().min(1),
  unitPrice: z.number().min(0),
  cropEntryId: z.string().optional(),
  livestockEntryId: z.string().optional(),
  inventoryItemId: z.string().optional(),
});

const createSaleSchema = z.object({
  saleDate: z.string().optional(),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  customerEmail: z.string().email().optional().or(z.literal("")),
  customerAddress: z.string().optional(),
  discount: z.number().min(0).default(0),
  tax: z.number().min(0).default(0),
  paymentMethod: z.enum(["CASH", "MOBILE_MONEY", "BANK_TRANSFER", "CREDIT", "OTHER"]).optional(),
  paymentStatus: z.enum(["PENDING", "PARTIAL", "PAID"]).default("PENDING"),
  paidAmount: z.number().min(0).default(0),
  notes: z.string().optional(),
  items: z.array(saleItemSchema).min(1, "At least one item is required"),
});

// Generate sale number
async function generateSaleNumber(userId: string): Promise<string> {
  const count = await db.sale.count({ where: { userId } });
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  return `SL${year}${month}-${(count + 1).toString().padStart(4, "0")}`;
}

// GET - List sales
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
    const search = searchParams.get("search");

    const where: any = { userId: session.user.id };

    if (status) {
      where.paymentStatus = status;
    }

    if (startDate || endDate) {
      where.saleDate = {};
      if (startDate) where.saleDate.gte = new Date(startDate);
      if (endDate) where.saleDate.lte = new Date(endDate);
    }

    if (search) {
      where.OR = [
        { saleNumber: { contains: search, mode: "insensitive" } },
        { customerName: { contains: search, mode: "insensitive" } },
        { customerPhone: { contains: search } },
      ];
    }

    const [sales, total] = await Promise.all([
      db.sale.findMany({
        where,
        include: {
          items: true,
        },
        orderBy: { saleDate: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.sale.count({ where }),
    ]);

    // Calculate summary
    const summary = await db.sale.aggregate({
      where: { userId: session.user.id },
      _sum: { totalAmount: true, paidAmount: true },
      _count: true,
    });

    const pendingAmount = (summary._sum.totalAmount || 0) - (summary._sum.paidAmount || 0);

    return NextResponse.json({
      sales,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      summary: {
        totalSales: summary._count,
        totalRevenue: summary._sum.totalAmount || 0,
        totalReceived: summary._sum.paidAmount || 0,
        pendingAmount,
      },
    });
  } catch (error) {
    console.error("Error fetching sales:", error);
    return NextResponse.json(
      { error: "Failed to fetch sales" },
      { status: 500 }
    );
  }
}

// POST - Create sale
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createSaleSchema.parse(body);

    // Calculate totals
    const subtotal = validatedData.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
    const totalAmount = subtotal - validatedData.discount + validatedData.tax;

    // Generate sale number
    const saleNumber = await generateSaleNumber(session.user.id);

    // Determine payment status based on paid amount
    let paymentStatus = validatedData.paymentStatus;
    if (validatedData.paidAmount >= totalAmount) {
      paymentStatus = "PAID";
    } else if (validatedData.paidAmount > 0) {
      paymentStatus = "PARTIAL";
    }

    // Create sale with items
    const sale = await db.sale.create({
      data: {
        userId: session.user.id,
        saleNumber,
        saleDate: validatedData.saleDate ? new Date(validatedData.saleDate) : new Date(),
        customerName: validatedData.customerName,
        customerPhone: validatedData.customerPhone,
        customerEmail: validatedData.customerEmail || null,
        customerAddress: validatedData.customerAddress,
        subtotal,
        discount: validatedData.discount,
        tax: validatedData.tax,
        totalAmount,
        paymentMethod: validatedData.paymentMethod,
        paymentStatus,
        paidAmount: validatedData.paidAmount,
        paidAt: paymentStatus === "PAID" ? new Date() : null,
        notes: validatedData.notes,
        items: {
          create: validatedData.items.map((item) => ({
            productType: item.productType,
            productName: item.productName,
            quantity: item.quantity,
            unit: item.unit,
            unitPrice: item.unitPrice,
            totalPrice: item.quantity * item.unitPrice,
            cropEntryId: item.cropEntryId,
            livestockEntryId: item.livestockEntryId,
            inventoryItemId: item.inventoryItemId,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    // Update inventory for each item (deduct stock)
    for (const item of validatedData.items) {
      if (item.inventoryItemId) {
        const inventoryItem = await db.inventoryItem.findUnique({
          where: { id: item.inventoryItemId },
        });

        if (inventoryItem) {
          const newQuantity = Math.max(0, inventoryItem.quantity - item.quantity);
          
          await db.inventoryItem.update({
            where: { id: item.inventoryItemId },
            data: {
              quantity: newQuantity,
              status: newQuantity === 0 ? "OUT_OF_STOCK" : 
                      (inventoryItem.minQuantity && newQuantity <= inventoryItem.minQuantity) ? "LOW_STOCK" : "IN_STOCK",
            },
          });

          // Record inventory movement
          await db.inventoryMovement.create({
            data: {
              inventoryItemId: item.inventoryItemId,
              userId: session.user.id,
              movementType: "SALE",
              quantity: -item.quantity,
              previousQuantity: inventoryItem.quantity,
              newQuantity,
              referenceType: "sale",
              referenceId: sale.id,
              notes: `Sold in ${saleNumber}`,
            },
          });
        }
      }

      // Update livestock status if sold
      if (item.livestockEntryId && item.productType === "LIVESTOCK") {
        await db.livestockEntry.update({
          where: { id: item.livestockEntryId },
          data: {
            status: "SOLD",
            exitDate: new Date(),
            exitReason: `Sold - ${saleNumber}`,
          },
        });
      }
    }

    // Create income record
    await db.income.create({
      data: {
        userId: session.user.id,
        productType: validatedData.items.length === 1 
          ? validatedData.items[0].productName 
          : `Multiple items (${validatedData.items.length})`,
        quantity: validatedData.items.reduce((sum, i) => sum + i.quantity, 0),
        quantityUnit: validatedData.items[0].unit,
        pricePerUnit: validatedData.items[0].unitPrice,
        totalAmount,
        date: validatedData.saleDate ? new Date(validatedData.saleDate) : new Date(),
        buyerName: validatedData.customerName,
        buyerContact: validatedData.customerPhone,
        paymentMethod: validatedData.paymentMethod,
        notes: `Sale #${saleNumber}`,
      },
    });

    return NextResponse.json(sale, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating sale:", error);
    return NextResponse.json(
      { error: "Failed to create sale" },
      { status: 500 }
    );
  }
}
