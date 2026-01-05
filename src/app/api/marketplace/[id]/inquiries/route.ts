import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const inquirySchema = z.object({
  message: z.string().min(1).max(1000),
  quantity: z.number().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: listingId } = await params;

    // Get listing to verify ownership
    const listing = await db.marketListing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    // Only listing owner can see all inquiries
    const inquiries = await db.listingInquiry.findMany({
      where: listing.userId === session.user.id
        ? { listingId }
        : { listingId, userId: session.user.id },
      include: {
        user: { select: { id: true, name: true, phone: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(inquiries);
  } catch (error) {
    console.error("Error fetching inquiries:", error);
    return NextResponse.json({ error: "Failed to fetch inquiries" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: listingId } = await params;
    const body = await request.json();
    const data = inquirySchema.parse(body);

    // Verify listing exists
    const listing = await db.marketListing.findUnique({
      where: { id: listingId },
      include: { user: true },
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    // Can't inquire on own listing
    if (listing.userId === session.user.id) {
      return NextResponse.json(
        { error: "Cannot inquire on your own listing" },
        { status: 400 }
      );
    }

    const inquiry = await db.listingInquiry.create({
      data: {
        listingId,
        userId: session.user.id,
        message: data.quantity ? `${data.message} (Quantity: ${data.quantity})` : data.message,
      },
      include: {
        user: { select: { id: true, name: true, phone: true } },
      },
    });

    // Create notification for listing owner
    await db.notification.create({
      data: {
        userId: listing.userId,
        type: "MESSAGE",
        title: "New Inquiry",
        message: `Someone is interested in your ${listing.title} listing`,
        data: { listingId, inquiryId: inquiry.id },
      },
    });

    return NextResponse.json(inquiry, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error("Error creating inquiry:", error);
    return NextResponse.json({ error: "Failed to create inquiry" }, { status: 500 });
  }
}
