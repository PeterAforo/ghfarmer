import { z } from "zod";

export const expenseSchema = z.object({
  cropEntryId: z.string().optional(),
  livestockEntryId: z.string().optional(),
  category: z.enum([
    "SEEDS",
    "FERTILIZERS",
    "PESTICIDES",
    "VETERINARY",
    "FEED",
    "LABOR",
    "EQUIPMENT",
    "TRANSPORTATION",
    "UTILITIES",
    "OTHER",
  ]),
  amount: z.number().positive("Amount must be positive"),
  currency: z.string().default("GHS"),
  date: z.string(),
  description: z.string().optional(),
  paymentMethod: z
    .enum(["CASH", "MOBILE_MONEY", "BANK_TRANSFER", "CREDIT", "OTHER"])
    .optional(),
});

export const incomeSchema = z.object({
  cropEntryId: z.string().optional(),
  livestockEntryId: z.string().optional(),
  productType: z.string().min(1, "Product type is required"),
  quantity: z.number().positive().optional(),
  quantityUnit: z.string().optional(),
  pricePerUnit: z.number().positive().optional(),
  totalAmount: z.number().positive("Total amount must be positive"),
  currency: z.string().default("GHS"),
  date: z.string(),
  buyerName: z.string().optional(),
  buyerContact: z.string().optional(),
  paymentMethod: z
    .enum(["CASH", "MOBILE_MONEY", "BANK_TRANSFER", "CREDIT", "OTHER"])
    .optional(),
  notes: z.string().optional(),
});

export type ExpenseInput = z.infer<typeof expenseSchema>;
export type IncomeInput = z.infer<typeof incomeSchema>;
