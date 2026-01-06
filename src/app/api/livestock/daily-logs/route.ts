// Daily Production Logs API (Eggs, Milk)
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const eggLogSchema = z.object({
  livestockEntryId: z.string().min(1),
  farmId: z.string().optional(),
  date: z.string(),
  totalEggs: z.number().int().min(0),
  brokenEggs: z.number().int().min(0).default(0),
  gradeA: z.number().int().min(0).optional(),
  gradeB: z.number().int().min(0).optional(),
  gradeC: z.number().int().min(0).optional(),
  unitPrice: z.number().min(0).optional(),
  expectedEggs: z.number().int().min(0).optional(),
  varianceReason: z.string().optional(),
  notes: z.string().optional(),
});

const milkLogSchema = z.object({
  livestockEntryId: z.string().min(1),
  farmId: z.string().optional(),
  date: z.string(),
  morningVolume: z.number().min(0).optional(),
  eveningVolume: z.number().min(0).optional(),
  totalVolume: z.number().min(0),
  unit: z.string().default("liters"),
  fatContent: z.number().min(0).max(100).optional(),
  temperature: z.number().optional(),
  quality: z.enum(["GOOD", "FAIR", "POOR"]).optional(),
  unitPrice: z.number().min(0).optional(),
  expectedVolume: z.number().min(0).optional(),
  varianceReason: z.string().optional(),
  notes: z.string().optional(),
});

const feedLogSchema = z.object({
  livestockEntryId: z.string().min(1),
  farmId: z.string().optional(),
  date: z.string(),
  feedType: z.string().min(1),
  feedId: z.string().optional(),
  inventoryItemId: z.string().optional(),
  quantity: z.number().positive(),
  unit: z.string().default("kg"),
  unitCost: z.number().min(0).optional(),
  notes: z.string().optional(),
});

// GET - Get daily logs
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "eggs"; // eggs, milk, feed
    const livestockEntryId = searchParams.get("livestockEntryId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const limit = parseInt(searchParams.get("limit") || "30");

    const where: any = { userId: session.user.id };
    
    if (livestockEntryId) {
      where.livestockEntryId = livestockEntryId;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    let logs;
    let summary;

    if (type === "eggs") {
      logs = await db.dailyEggLog.findMany({
        where,
        orderBy: { date: "desc" },
        take: limit,
        include: {
          livestockEntry: {
            select: { 
              id: true, 
              name: true, 
              batchId: true,
              quantity: true,
              livestock: { select: { englishName: true } },
            },
          },
        },
      });

      const agg = await db.dailyEggLog.aggregate({
        where,
        _sum: { totalEggs: true, goodEggs: true, brokenEggs: true, totalValue: true },
        _avg: { totalEggs: true },
        _count: true,
      });

      summary = {
        totalLogs: agg._count,
        totalEggs: agg._sum.totalEggs || 0,
        goodEggs: agg._sum.goodEggs || 0,
        brokenEggs: agg._sum.brokenEggs || 0,
        totalValue: agg._sum.totalValue || 0,
        avgDailyEggs: Math.round(agg._avg.totalEggs || 0),
      };
    } else if (type === "milk") {
      logs = await db.dailyMilkLog.findMany({
        where,
        orderBy: { date: "desc" },
        take: limit,
        include: {
          livestockEntry: {
            select: { 
              id: true, 
              name: true,
              tagNumber: true,
              livestock: { select: { englishName: true } },
            },
          },
        },
      });

      const agg = await db.dailyMilkLog.aggregate({
        where,
        _sum: { totalVolume: true, totalValue: true },
        _avg: { totalVolume: true },
        _count: true,
      });

      summary = {
        totalLogs: agg._count,
        totalVolume: agg._sum.totalVolume || 0,
        totalValue: agg._sum.totalValue || 0,
        avgDailyVolume: Math.round((agg._avg.totalVolume || 0) * 10) / 10,
      };
    } else {
      logs = await db.dailyFeedLog.findMany({
        where,
        orderBy: { date: "desc" },
        take: limit,
        include: {
          livestockEntry: {
            select: { 
              id: true, 
              name: true,
              batchId: true,
              quantity: true,
              livestock: { select: { englishName: true } },
            },
          },
          inventoryItem: {
            select: { id: true, name: true, quantity: true },
          },
        },
      });

      const agg = await db.dailyFeedLog.aggregate({
        where,
        _sum: { quantity: true, totalCost: true },
        _avg: { quantity: true },
        _count: true,
      });

      summary = {
        totalLogs: agg._count,
        totalFeedUsed: agg._sum.quantity || 0,
        totalCost: agg._sum.totalCost || 0,
        avgDailyFeed: Math.round((agg._avg.quantity || 0) * 10) / 10,
      };
    }

    return NextResponse.json({ logs, summary, type });
  } catch (error) {
    console.error("Error fetching daily logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch daily logs" },
      { status: 500 }
    );
  }
}

// POST - Create daily log
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type, ...data } = body;

    if (type === "eggs") {
      const validatedData = eggLogSchema.parse(data);
      const goodEggs = validatedData.totalEggs - validatedData.brokenEggs;
      const totalValue = validatedData.unitPrice ? goodEggs * validatedData.unitPrice : null;
      
      // Calculate variance if expected is provided
      let variance = null;
      if (validatedData.expectedEggs && validatedData.expectedEggs > 0) {
        variance = ((validatedData.totalEggs - validatedData.expectedEggs) / validatedData.expectedEggs) * 100;
      }

      const log = await db.dailyEggLog.upsert({
        where: {
          livestockEntryId_date: {
            livestockEntryId: validatedData.livestockEntryId,
            date: new Date(validatedData.date),
          },
        },
        create: {
          userId: session.user.id,
          livestockEntryId: validatedData.livestockEntryId,
          farmId: validatedData.farmId,
          date: new Date(validatedData.date),
          totalEggs: validatedData.totalEggs,
          brokenEggs: validatedData.brokenEggs,
          goodEggs,
          gradeA: validatedData.gradeA,
          gradeB: validatedData.gradeB,
          gradeC: validatedData.gradeC,
          unitPrice: validatedData.unitPrice,
          totalValue,
          expectedEggs: validatedData.expectedEggs,
          variance,
          varianceReason: validatedData.varianceReason,
          notes: validatedData.notes,
        },
        update: {
          totalEggs: validatedData.totalEggs,
          brokenEggs: validatedData.brokenEggs,
          goodEggs,
          gradeA: validatedData.gradeA,
          gradeB: validatedData.gradeB,
          gradeC: validatedData.gradeC,
          unitPrice: validatedData.unitPrice,
          totalValue,
          expectedEggs: validatedData.expectedEggs,
          variance,
          varianceReason: validatedData.varianceReason,
          notes: validatedData.notes,
        },
      });

      return NextResponse.json(log, { status: 201 });
    } else if (type === "milk") {
      const validatedData = milkLogSchema.parse(data);
      const totalValue = validatedData.unitPrice ? validatedData.totalVolume * validatedData.unitPrice : null;
      
      let variance = null;
      if (validatedData.expectedVolume && validatedData.expectedVolume > 0) {
        variance = ((validatedData.totalVolume - validatedData.expectedVolume) / validatedData.expectedVolume) * 100;
      }

      const log = await db.dailyMilkLog.upsert({
        where: {
          livestockEntryId_date: {
            livestockEntryId: validatedData.livestockEntryId,
            date: new Date(validatedData.date),
          },
        },
        create: {
          userId: session.user.id,
          livestockEntryId: validatedData.livestockEntryId,
          farmId: validatedData.farmId,
          date: new Date(validatedData.date),
          morningVolume: validatedData.morningVolume,
          eveningVolume: validatedData.eveningVolume,
          totalVolume: validatedData.totalVolume,
          unit: validatedData.unit,
          fatContent: validatedData.fatContent,
          temperature: validatedData.temperature,
          quality: validatedData.quality,
          unitPrice: validatedData.unitPrice,
          totalValue,
          expectedVolume: validatedData.expectedVolume,
          variance,
          varianceReason: validatedData.varianceReason,
          notes: validatedData.notes,
        },
        update: {
          morningVolume: validatedData.morningVolume,
          eveningVolume: validatedData.eveningVolume,
          totalVolume: validatedData.totalVolume,
          unit: validatedData.unit,
          fatContent: validatedData.fatContent,
          temperature: validatedData.temperature,
          quality: validatedData.quality,
          unitPrice: validatedData.unitPrice,
          totalValue,
          expectedVolume: validatedData.expectedVolume,
          variance,
          varianceReason: validatedData.varianceReason,
          notes: validatedData.notes,
        },
      });

      return NextResponse.json(log, { status: 201 });
    } else if (type === "feed") {
      const validatedData = feedLogSchema.parse(data);
      const totalCost = validatedData.unitCost ? validatedData.quantity * validatedData.unitCost : null;

      const log = await db.dailyFeedLog.create({
        data: {
          userId: session.user.id,
          livestockEntryId: validatedData.livestockEntryId,
          farmId: validatedData.farmId,
          date: new Date(validatedData.date),
          feedType: validatedData.feedType,
          feedId: validatedData.feedId,
          inventoryItemId: validatedData.inventoryItemId,
          quantity: validatedData.quantity,
          unit: validatedData.unit,
          unitCost: validatedData.unitCost,
          totalCost,
          notes: validatedData.notes,
        },
      });

      // Deduct from inventory if linked
      if (validatedData.inventoryItemId) {
        const inventoryItem = await db.inventoryItem.findUnique({
          where: { id: validatedData.inventoryItemId },
        });

        if (inventoryItem) {
          const newQuantity = Math.max(0, inventoryItem.quantity - validatedData.quantity);

          await db.inventoryItem.update({
            where: { id: validatedData.inventoryItemId },
            data: {
              quantity: newQuantity,
              status: newQuantity === 0 ? "OUT_OF_STOCK" :
                (inventoryItem.minQuantity && newQuantity <= inventoryItem.minQuantity) ? "LOW_STOCK" : "IN_STOCK",
            },
          });

          await db.inventoryMovement.create({
            data: {
              inventoryItemId: validatedData.inventoryItemId,
              userId: session.user.id,
              movementType: "USAGE",
              quantity: -validatedData.quantity,
              previousQuantity: inventoryItem.quantity,
              newQuantity,
              referenceType: "feed_log",
              referenceId: log.id,
              notes: `Feed consumption for livestock`,
            },
          });

          // Mark as deducted
          await db.dailyFeedLog.update({
            where: { id: log.id },
            data: { inventoryDeducted: true },
          });
        }
      }

      return NextResponse.json(log, { status: 201 });
    }

    return NextResponse.json({ error: "Invalid log type" }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating daily log:", error);
    return NextResponse.json(
      { error: "Failed to create daily log" },
      { status: 500 }
    );
  }
}
