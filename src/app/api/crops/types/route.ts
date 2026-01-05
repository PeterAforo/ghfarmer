import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const crops = await db.crop.findMany({
      where: category ? { category: category as any } : undefined,
      include: {
        varieties: {
          select: { id: true, name: true },
        },
      },
      orderBy: { englishName: "asc" },
    });

    // Map englishName to name for frontend compatibility
    const mappedCrops = crops.map((crop) => {
      // Extract maturity days from cropCycle JSON if available
      let maturityDays: number | null = null;
      if (crop.cropCycle && typeof crop.cropCycle === 'object') {
        const cycle = crop.cropCycle as any;
        // Handle both number and object formats
        if (typeof cycle.daysToMaturity === 'number') {
          maturityDays = cycle.daysToMaturity;
        } else if (typeof cycle.daysToMaturity === 'object' && cycle.daysToMaturity?.min) {
          // Use average of min and max
          maturityDays = Math.round((cycle.daysToMaturity.min + (cycle.daysToMaturity.max || cycle.daysToMaturity.min)) / 2);
        } else if (cycle.maturityDays) {
          maturityDays = typeof cycle.maturityDays === 'number' ? cycle.maturityDays : cycle.maturityDays.min;
        } else if (cycle.harvestDays) {
          maturityDays = typeof cycle.harvestDays === 'number' ? cycle.harvestDays : cycle.harvestDays.min;
        }
      }
      
      return {
        id: crop.id,
        name: crop.englishName,
        category: crop.category,
        varieties: crop.varieties,
        maturityDays,
      };
    });

    return NextResponse.json(mappedCrops);
  } catch (error) {
    console.error("Error fetching crops:", error);
    return NextResponse.json(
      { error: "Failed to fetch crops" },
      { status: 500 }
    );
  }
}
