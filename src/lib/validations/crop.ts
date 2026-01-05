import { z } from "zod";

export const cropEntrySchema = z.object({
  farmId: z.string().min(1, "Farm is required"),
  cropId: z.string().min(1, "Crop type is required"),
  varietyId: z.string().optional(),
  plotName: z.string().optional(),
  landArea: z.number().positive("Land area must be positive").optional(),
  landAreaUnit: z.enum(["HECTARES", "ACRES", "SQUARE_METERS"]).default("HECTARES"),
  plantingDate: z.string().optional(),
  expectedHarvestDate: z.string().optional(),
  seedQuantity: z.number().positive().optional(),
  seedUnit: z.string().optional(),
  seedCostPerUnit: z.number().nonnegative().optional(),
  totalSeedCost: z.number().nonnegative().optional(),
  calculatedCapacity: z.number().nonnegative().optional(),
  expectedPricePerUnit: z.number().nonnegative().optional(),
  status: z
    .enum(["PLANNED", "PLANTED", "GROWING", "HARVESTING", "COMPLETED", "FAILED"])
    .default("PLANNED"),
  notes: z.string().optional(),
});

export const cropActivitySchema = z.object({
  cropEntryId: z.string().min(1, "Crop entry is required"),
  type: z.enum([
    "LAND_PREPARATION",
    "PLANTING",
    "FERTILIZER_APPLICATION",
    "PEST_TREATMENT",
    "DISEASE_TREATMENT",
    "IRRIGATION",
    "WEEDING",
    "PRUNING",
    "HARVESTING",
    "POST_HARVEST",
    "OTHER",
  ]),
  date: z.string(),
  details: z.record(z.string(), z.any()).optional(),
  cost: z.number().nonnegative().optional(),
  notes: z.string().optional(),
});

export type CropEntryInput = z.infer<typeof cropEntrySchema>;
export type CropActivityInput = z.infer<typeof cropActivitySchema>;
