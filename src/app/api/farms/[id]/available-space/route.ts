import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// Get available space on a farm by calculating total farm size minus used space
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: farmId } = await params;

    // Get farm with its size
    const farm = await db.farm.findFirst({
      where: { id: farmId, userId: session.user.id },
    });

    if (!farm) {
      return NextResponse.json({ error: "Farm not found" }, { status: 404 });
    }

    // Get all active crop entries on this farm
    const cropEntries = await db.cropEntry.findMany({
      where: {
        farmId,
        status: { notIn: ["COMPLETED", "FAILED"] },
      },
      select: {
        id: true,
        plotName: true,
        landArea: true,
        landAreaUnit: true,
        crop: { select: { englishName: true } },
      },
    });

    // Convert all areas to hectares for consistent calculation
    const convertToHectares = (area: number | null, unit: string | null): number => {
      if (!area) return 0;
      switch (unit) {
        case "HECTARES": return area;
        case "ACRES": return area * 0.404686;
        case "SQUARE_METERS": return area / 10000;
        case "SQUARE_FEET": return area / 107639;
        default: return area;
      }
    };

    const farmSizeHectares = convertToHectares(farm.size, farm.sizeUnit);
    
    let usedSpaceHectares = 0;
    const plotUsage: Array<{
      id: string;
      plotName: string | null;
      cropName: string;
      area: number;
      areaUnit: string;
      areaHectares: number;
    }> = [];

    for (const entry of cropEntries) {
      const areaHectares = convertToHectares(entry.landArea, entry.landAreaUnit);
      usedSpaceHectares += areaHectares;
      plotUsage.push({
        id: entry.id,
        plotName: entry.plotName,
        cropName: entry.crop?.englishName || "Unknown",
        area: entry.landArea || 0,
        areaUnit: entry.landAreaUnit || "HECTARES",
        areaHectares,
      });
    }

    const availableSpaceHectares = Math.max(0, farmSizeHectares - usedSpaceHectares);
    const usagePercentage = farmSizeHectares > 0 
      ? Math.round((usedSpaceHectares / farmSizeHectares) * 100) 
      : 0;

    // Convert back to farm's original unit for display
    const convertFromHectares = (hectares: number, unit: string | null): number => {
      switch (unit) {
        case "HECTARES": return hectares;
        case "ACRES": return hectares / 0.404686;
        case "SQUARE_METERS": return hectares * 10000;
        case "SQUARE_FEET": return hectares * 107639;
        default: return hectares;
      }
    };

    return NextResponse.json({
      farmId,
      farmName: farm.name,
      totalSize: farm.size || 0,
      sizeUnit: farm.sizeUnit || "HECTARES",
      usedSpace: convertFromHectares(usedSpaceHectares, farm.sizeUnit),
      availableSpace: convertFromHectares(availableSpaceHectares, farm.sizeUnit),
      usagePercentage,
      plotUsage,
    });
  } catch (error) {
    console.error("Error calculating available space:", error);
    return NextResponse.json(
      { error: "Failed to calculate available space" },
      { status: 500 }
    );
  }
}
