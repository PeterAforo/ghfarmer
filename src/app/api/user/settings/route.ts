import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// Default unit prices in GHS
export const DEFAULT_UNIT_PRICES = {
  // Livestock - Eggs
  eggs: 1.5,              // per egg
  
  // Livestock - Milk
  cowMilk: 8,             // per liter
  goatMilk: 12,           // per liter
  
  // Livestock - Meat (live weight per kg)
  chickenMeat: 35,
  broilerMeat: 35,
  turkeyMeat: 40,
  duckMeat: 35,
  guineaFowlMeat: 45,
  goatMeat: 50,
  sheepMeat: 50,
  cattleMeat: 45,
  pigMeat: 25,
  rabbitMeat: 50,
  
  // Aquaculture
  tilapia: 40,            // per kg
  catfish: 45,            // per kg
  
  // Crops (per kg unless specified)
  maize: 5,
  rice: 8,
  cassava: 2,
  yam: 6,
  plantain: 4,
  tomato: 8,
  pepper: 15,
  onion: 10,
  cabbage: 5,
  lettuce: 8,
  cocoa: 25,
  cashew: 20,
  palm: 3,                // per kg of fruit
  coconut: 5,             // per nut
};

// GET user settings including unit prices
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        currency: true,
        units: true,
        unitPrices: true,
      },
    });

    // Merge user prices with defaults
    const unitPrices = {
      ...DEFAULT_UNIT_PRICES,
      ...(user?.unitPrices as Record<string, number> || {}),
    };

    return NextResponse.json({
      currency: user?.currency || "GHS",
      units: user?.units || "METRIC",
      unitPrices,
      defaultPrices: DEFAULT_UNIT_PRICES,
    });
  } catch (error) {
    console.error("Error fetching user settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// PATCH update user settings
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { currency, units, unitPrices } = body;

    const updateData: Record<string, unknown> = {};
    
    if (currency) updateData.currency = currency;
    if (units) updateData.units = units;
    if (unitPrices) {
      // Merge with existing prices
      const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: { unitPrices: true },
      });
      
      updateData.unitPrices = {
        ...(user?.unitPrices as Record<string, number> || {}),
        ...unitPrices,
      };
    }

    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        currency: true,
        units: true,
        unitPrices: true,
      },
    });

    return NextResponse.json({
      ...updatedUser,
      unitPrices: {
        ...DEFAULT_UNIT_PRICES,
        ...(updatedUser.unitPrices as Record<string, number> || {}),
      },
    });
  } catch (error) {
    console.error("Error updating user settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
