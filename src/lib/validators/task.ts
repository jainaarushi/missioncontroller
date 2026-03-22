import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(500),
  description: z.string().max(50000).optional(),
  section: z.enum(["today", "week", "later"]).default("today"),
  priority: z.enum(["urgent", "high", "normal", "low"]).default("normal"),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().max(50000).nullable().optional(),
  status: z.enum(["todo", "working", "review", "done", "failed"]).optional(),
  progress: z.number().min(0).max(100).optional(),
  current_step: z.string().nullable().optional(),
  output: z.string().nullable().optional(),
  agent_id: z.string().uuid().nullable().optional(),
  section: z.enum(["today", "week", "later"]).optional(),
  sort_order: z.number().optional(),
  priority: z.enum(["urgent", "high", "normal", "low"]).optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
