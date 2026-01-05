import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const createListingSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().optional(),
  category: z.enum(["CROPS", "LIVESTOCK", "PRODUCE", "EQUIPMENT", "SERVICES"]),
  productType: z.string().min(1, "Product type is required"),
  quantity: z.number().positive("Quantity must be positive"),
  quantityUnit: z.string().min(1, "Unit is required"),
  pricePerUnit: z.number().positive("Price must be positive"),
  location: z.string().optional(),
  region: z.string().optional(),
  availableFrom: z.string().optional(),
  availableUntil: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const region = searchParams.get("region");
    const search = searchParams.get("search");
    const myListings = searchParams.get("my") === "true";

    const session = await getServerSession(authOptions);

    const where: any = { status: "ACTIVE" };
    if (category) where.category = category;
    if (region) where.region = region;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { productType: { contains: search, mode: "insensitive" } },
      ];
    }
    if (myListings && session) {
      where.userId = session.user.id;
      delete where.status; // Show all statuses for own listings
    }

    const listings = await db.marketListing.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, phone: true } },
        _count: { select: { inquiries: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(listings);
  } catch (error) {
    console.error("Error fetching listings:", error);
    return NextResponse.json({ error: "Failed to fetch listings" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = createListingSchema.parse(body);

    const listing = await db.marketListing.create({
      data: {
        userId: session.user.id,
        title: data.title,
        description: data.description,
        category: data.category,
        productType: data.productType,
        quantity: data.quantity,
        quantityUnit: data.quantityUnit,
        pricePerUnit: data.pricePerUnit,
        location: data.location,
        region: data.region,
        availableFrom: data.availableFrom ? new Date(data.availableFrom) : undefined,
        availableUntil: data.availableUntil ? new Date(data.availableUntil) : undefined,
      },
    });

    return NextResponse.json(listing, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error("Error creating listing:", error);
    return NextResponse.json({ error: "Failed to create listing" }, { status: 500 });
  }
}
