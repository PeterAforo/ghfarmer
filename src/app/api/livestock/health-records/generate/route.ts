import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateHealthRecordsForAllLivestock } from "@/lib/health-record-generator";

// Generate health records for all existing livestock entries
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await generateHealthRecordsForAllLivestock(session.user.id);

    return NextResponse.json({
      success: true,
      message: `Generated ${result.recordsGenerated} health records for ${result.entriesProcessed} livestock entries`,
      ...result,
    });
  } catch (error) {
    console.error("Error generating health records:", error);
    return NextResponse.json(
      { error: "Failed to generate health records" },
      { status: 500 }
    );
  }
}
