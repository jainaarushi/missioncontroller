import { z } from "zod";

export const updateAgentSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  system_prompt: z.string().min(1).max(10000).optional(),
});

export type UpdateAgentInput = z.infer<typeof updateAgentSchema>;
