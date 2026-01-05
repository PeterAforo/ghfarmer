import { z } from "zod";

export const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().optional(),
  dueDate: z.string().min(1, "Due date is required"),
  category: z.enum([
    "PLANTING",
    "FERTILIZING",
    "WATERING",
    "PEST_CONTROL",
    "HARVESTING",
    "FEEDING",
    "VACCINATION",
    "BREEDING",
    "MAINTENANCE",
    "OTHER",
  ]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  relatedType: z.string().optional(),
  relatedId: z.string().optional(),
});

export const updateTaskSchema = taskSchema.partial().extend({
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional(),
});

export type TaskInput = z.infer<typeof taskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
