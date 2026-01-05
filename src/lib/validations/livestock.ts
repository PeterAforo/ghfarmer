import { z } from "zod";

export const livestockEntrySchema = z.object({
  farmId: z.string().min(1, "Farm is required"),
  livestockId: z.string().min(1, "Livestock type is required"),
  breedId: z.string().optional(),
  tagNumber: z.string().optional(),
  name: z.string().optional(),
  batchId: z.string().optional(),
  quantity: z.number().int().positive().default(1),
  gender: z.enum(["MALE", "FEMALE", "UNKNOWN"]).optional(),
  birthDate: z.string().optional(),
  acquiredDate: z.string().optional(),
  source: z.enum(["PURCHASED", "BORN_ON_FARM", "GIFTED", "OTHER"]).optional(),
  costPerAnimal: z.number().nonnegative().optional(),
  expectedSellingPrice: z.number().nonnegative().optional(),
  status: z.enum(["ACTIVE", "SOLD", "DECEASED", "TRANSFERRED"]).default("ACTIVE"),
  location: z.string().optional(),
  notes: z.string().optional(),
});

export const healthRecordSchema = z.object({
  livestockEntryId: z.string().min(1, "Livestock entry is required"),
  type: z.enum([
    "VACCINATION",
    "DEWORMING",
    "DISEASE",
    "TREATMENT",
    "VETERINARY_VISIT",
    "MORTALITY",
  ]),
  date: z.string(),
  vaccineName: z.string().optional(),
  nextDueDate: z.string().optional(),
  diagnosis: z.string().optional(),
  symptoms: z.array(z.string()).optional(),
  treatment: z.string().optional(),
  medication: z.string().optional(),
  dosage: z.string().optional(),
  veterinarian: z.string().optional(),
  cost: z.number().nonnegative().optional(),
  notes: z.string().optional(),
});

export const productionRecordSchema = z.object({
  livestockEntryId: z.string().min(1, "Livestock entry is required"),
  date: z.string(),
  type: z.enum(["EGGS", "MILK", "WEIGHT", "OTHER"]),
  eggCount: z.number().int().nonnegative().optional(),
  eggGrade: z.string().optional(),
  milkVolume: z.number().nonnegative().optional(),
  milkUnit: z.string().optional(),
  weight: z.number().nonnegative().optional(),
  weightUnit: z.string().optional(),
  notes: z.string().optional(),
});

export type LivestockEntryInput = z.infer<typeof livestockEntrySchema>;
export type HealthRecordInput = z.infer<typeof healthRecordSchema>;
export type ProductionRecordInput = z.infer<typeof productionRecordSchema>;
