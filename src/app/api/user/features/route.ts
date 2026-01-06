// User Features API - Get current user's subscription features and limits
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserFeatures } from "@/lib/feature-gate";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const features = await getUserFeatures(session.user.id);
    
    return NextResponse.json(features);
  } catch (error) {
    console.error("Error fetching user features:", error);
    return NextResponse.json(
      { error: "Failed to fetch user features" },
      { status: 500 }
    );
  }
}
