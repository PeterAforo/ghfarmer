import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const createProductSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  category: z.enum([
    "SEEDS", "FERTILIZERS", "PESTICIDES", "HERBICIDES", "FUNGICIDES",
    "ANIMAL_FEED", "VETERINARY_DRUGS", "FARM_EQUIPMENT", "IRRIGATION_EQUIPMENT",
    "PACKAGING_MATERIALS", "FARM_TOOLS", "PROTECTIVE_GEAR", "OTHER"
  ]),
  brand: z.string().optional(),
  sku: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  unit: z.string().min(1, "Unit is required"),
  minOrder: z.number().positive().optional(),
  stockQuantity: z.number().nonnegative().optional(),
  specifications: z.record(z.string(), z.string()).optional(),
  images: z.array(z.string()).optional(),
});

// GET - Get products for a provider
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: providerId } = await params;

    const products = await db.productListing.findMany({
      where: {
        providerId,
        status: "ACTIVE",
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST - Create a new product listing
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: providerId } = await params;

    // Verify the provider belongs to the user
    const provider = await db.serviceProvider.findFirst({
      where: {
        id: providerId,
        userId: session.user.id,
      },
    });

    if (!provider) {
      return NextResponse.json(
        { error: "Service provider not found or access denied" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = createProductSchema.parse(body);

    const product = await db.productListing.create({
      data: {
        providerId,
        name: validatedData.name,
        description: validatedData.description,
        category: validatedData.category,
        brand: validatedData.brand,
        sku: validatedData.sku,
        price: validatedData.price,
        unit: validatedData.unit,
        minOrder: validatedData.minOrder,
        stockQuantity: validatedData.stockQuantity,
        specifications: validatedData.specifications,
        images: validatedData.images,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
