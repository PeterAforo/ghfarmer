import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  calculateCropCapacity,
  calculateLivestockCapacity,
  getCropSpacingInfo,
  getLivestockSpaceInfo,
  getPenTypeMultiplier,
  CROP_SPACING,
  LIVESTOCK_SPACE,
  PEN_TYPE_MULTIPLIERS,
} from "@/lib/capacity-calculator";

// GET /api/plots/capacity - Calculate capacity for crops or livestock
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // "crop" or "livestock"
    const name = searchParams.get("name"); // crop or animal name
    const area = searchParams.get("area"); // area in specified unit
    const unit = searchParams.get("unit") || "HECTARES";

    if (!type || !name) {
      return NextResponse.json(
        { error: "type and name are required" },
        { status: 400 }
      );
    }

    if (type === "crop") {
      const spacingInfo = getCropSpacingInfo(name);
      
      if (area) {
        const result = calculateCropCapacity(name, parseFloat(area), unit);
        return NextResponse.json({
          type: "crop",
          cropName: name,
          area: parseFloat(area),
          unit,
          capacity: result.capacity,
          areaInHectares: result.areaInHectares,
          spacingInfo: result.spacingInfo,
        });
      }

      return NextResponse.json({
        type: "crop",
        cropName: name,
        spacingInfo,
        allCrops: Object.keys(CROP_SPACING),
      });
    }

    if (type === "livestock") {
      const spaceInfo = getLivestockSpaceInfo(name);
      const penType = searchParams.get("penType") || undefined;
      const penTypeInfo = penType ? getPenTypeMultiplier(penType) : null;
      
      if (area) {
        const result = calculateLivestockCapacity(name, parseFloat(area), penType);
        return NextResponse.json({
          type: "livestock",
          animalType: name,
          penArea: parseFloat(area),
          penType: penType || null,
          capacity: result.capacity,
          baseCapacity: result.baseCapacity,
          spaceInfo: result.spaceInfo,
          penTypeMultiplier: result.penTypeMultiplier || null,
        });
      }

      return NextResponse.json({
        type: "livestock",
        animalType: name,
        spaceInfo,
        penTypeInfo,
        allAnimals: Object.keys(LIVESTOCK_SPACE),
        allPenTypes: Object.keys(PEN_TYPE_MULTIPLIERS),
      });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    console.error("Error calculating capacity:", error);
    return NextResponse.json({ error: "Failed to calculate capacity" }, { status: 500 });
  }
}
