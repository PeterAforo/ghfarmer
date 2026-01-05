import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const region = searchParams.get("region");
    const search = searchParams.get("search");

    const where: any = { isActive: true };
    if (type) where.type = type;
    if (region) where.region = region;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const suppliers = await db.inputSupplier.findMany({
      where,
      orderBy: [{ isVerified: "desc" }, { rating: "desc" }, { name: "asc" }],
    });

    return NextResponse.json(suppliers);
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return NextResponse.json({ error: "Failed to fetch suppliers" }, { status: 500 });
  }
}
