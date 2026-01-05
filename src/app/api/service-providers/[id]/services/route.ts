import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const createServiceSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  category: z.enum([
    "VETERINARY_CONSULTATION", "VETERINARY_SURGERY", "VACCINATION_SERVICE",
    "DEWORMING_SERVICE", "ARTIFICIAL_INSEMINATION", "FARM_ADVISORY",
    "SOIL_TESTING", "CROP_ADVISORY", "PEST_MANAGEMENT", "DISEASE_DIAGNOSIS",
    "TRAINING_WORKSHOP", "EQUIPMENT_RENTAL", "TRANSPORT", "STORAGE",
    "PROCESSING", "OTHER"
  ]),
  priceType: z.enum(["FIXED", "NEGOTIABLE", "QUOTE_BASED", "HOURLY", "PER_UNIT"]).default("FIXED"),
  price: z.number().nonnegative().optional(),
  priceUnit: z.string().optional(),
  serviceLocation: z.enum(["ON_SITE", "AT_FACILITY", "BOTH", "REMOTE"]).default("BOTH"),
  travelRadius: z.number().int().nonnegative().optional(),
  availableDays: z.array(z.string()).optional(),
  leadTime: z.number().int().nonnegative().optional(),
  images: z.array(z.string()).optional(),
});

// GET - Get services for a provider
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: providerId } = await params;

    const services = await db.serviceListing.findMany({
      where: {
        providerId,
        status: "ACTIVE",
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      { error: "Failed to fetch services" },
      { status: 500 }
    );
  }
}

// POST - Create a new service listing
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
    const validatedData = createServiceSchema.parse(body);

    const service = await db.serviceListing.create({
      data: {
        providerId,
        title: validatedData.title,
        description: validatedData.description,
        category: validatedData.category,
        priceType: validatedData.priceType,
        price: validatedData.price,
        priceUnit: validatedData.priceUnit,
        serviceLocation: validatedData.serviceLocation,
        travelRadius: validatedData.travelRadius,
        availableDays: validatedData.availableDays,
        leadTime: validatedData.leadTime,
        images: validatedData.images,
      },
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating service:", error);
    return NextResponse.json(
      { error: "Failed to create service" },
      { status: 500 }
    );
  }
}
