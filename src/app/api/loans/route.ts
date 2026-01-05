import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const providerType = searchParams.get("providerType");

    const loans = await db.loanProduct.findMany({
      where: {
        isActive: true,
        ...(providerType && { providerType }),
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(loans);
  } catch (error) {
    console.error("Error fetching loans:", error);
    return NextResponse.json({ error: "Failed to fetch loans" }, { status: 500 });
  }
}
