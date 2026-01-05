import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateProductionRecordsForAllLivestock } from "@/lib/production-record-generator";

// Generate production records for all existing livestock entries
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await generateProductionRecordsForAllLivestock(session.user.id);

    return NextResponse.json({
      success: true,
      message: `Generated ${result.recordsGenerated} production records for ${result.entriesProcessed} livestock entries`,
      ...result,
    });
  } catch (error) {
    console.error("Error generating production records:", error);
    return NextResponse.json(
      { error: "Failed to generate production records" },
      { status: 500 }
    );
  }
}
