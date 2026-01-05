import { z } from "zod";

export const farmSchema = z.object({
  name: z.string().min(1, "Farm name is required"),
  size: z.number().positive("Size must be positive").optional(),
  sizeUnit: z.enum(["HECTARES", "ACRES", "SQUARE_METERS"]).default("HECTARES"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  address: z.string().optional(),
  region: z.string().optional(),
  constituency: z.string().optional(),
  district: z.string().optional(),
  image: z.string().optional(),
});

export type FarmInput = z.infer<typeof farmSchema>;
