import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const livestock = await db.livestock.findMany({
      where: category ? { category: category as any } : undefined,
      include: {
        breeds: {
          select: { id: true, name: true },
        },
      },
      orderBy: { englishName: "asc" },
    });

    // Map englishName to name for frontend compatibility
    const mappedLivestock = livestock.map((animal) => ({
      id: animal.id,
      name: animal.englishName,
      category: animal.category,
      breeds: animal.breeds,
    }));

    return NextResponse.json(mappedLivestock);
  } catch (error) {
    console.error("Error fetching livestock types:", error);
    return NextResponse.json(
      { error: "Failed to fetch livestock types" },
      { status: 500 }
    );
  }
}
