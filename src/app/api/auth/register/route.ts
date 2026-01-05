import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
  accountType: z.enum([
    "FARMER", "SUPPLIER", "VETERINARIAN", "EXTENSION_OFFICER", "BUYER", "AGGREGATOR", "VENDOR"
  ]).default("FARMER"),
  farmerType: z.enum(["SMALLHOLDER", "COMMERCIAL"]).optional(),
  language: z
    .enum(["ENGLISH", "TWI", "GA", "EWE", "HAUSA", "DAGBANI"])
    .default("ENGLISH"),
  region: z.string().optional(),
  constituency: z.string().optional(),
  district: z.string().optional(),
  // Service provider fields
  businessName: z.string().optional(),
  businessType: z.enum([
    "VETERINARIAN", "EXTENSION_OFFICER", "INPUT_SUPPLIER", "EQUIPMENT_SUPPLIER",
    "FEED_SUPPLIER", "SEED_SUPPLIER", "AGROCHEMICAL_SUPPLIER", "FARM_CONSULTANT",
    "SOIL_TESTING", "IRRIGATION_SERVICES", "TRANSPORT_LOGISTICS", "PROCESSING_SERVICES",
    "STORAGE_SERVICES", "LIVESTOCK_INPUT_SUPPLIER", "POULTRY_EQUIPMENT_SUPPLIER",
    "DAIRY_EQUIPMENT_SUPPLIER", "HATCHERY_SUPPLIER", "BREEDING_SERVICES",
    "ANIMAL_HEALTH_SUPPLIER", "OTHER"
  ]).optional(),
  licenseNumber: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await db.user.findFirst({
      where: {
        OR: [
          { email: validatedData.email },
          ...(validatedData.phone ? [{ phone: validatedData.phone }] : []),
        ],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email or phone already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // Determine if this is a service provider account
    const isServiceProvider = validatedData.accountType !== "FARMER";

    // Create user with transaction to also create service provider if needed
    const result = await db.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          name: validatedData.name,
          email: validatedData.email,
          password: hashedPassword,
          phone: validatedData.phone,
          accountType: validatedData.accountType,
          farmerType: validatedData.accountType === "FARMER" 
            ? (validatedData.farmerType || "SMALLHOLDER") 
            : "SMALLHOLDER",
          language: validatedData.language,
          region: validatedData.region,
          constituency: validatedData.constituency,
          district: validatedData.district,
        },
      });

      // Create service provider profile if not a farmer
      let serviceProvider = null;
      if (isServiceProvider && validatedData.businessName) {
        serviceProvider = await tx.serviceProvider.create({
          data: {
            userId: user.id,
            businessName: validatedData.businessName,
            businessType: validatedData.businessType || "OTHER",
            licenseNumber: validatedData.licenseNumber,
            region: validatedData.region,
            district: validatedData.constituency, // Using constituency as district in provider
            phone: validatedData.phone,
            email: validatedData.email,
          },
        });
      }

      return { user, serviceProvider };
    });

    return NextResponse.json(
      { 
        message: "User created successfully", 
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          phone: result.user.phone,
          accountType: result.user.accountType,
          createdAt: result.user.createdAt,
        },
        serviceProvider: result.serviceProvider ? {
          id: result.serviceProvider.id,
          businessName: result.serviceProvider.businessName,
        } : null,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
