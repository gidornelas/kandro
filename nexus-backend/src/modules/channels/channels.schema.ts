import { z } from "zod";

export const createChannelSchema = z.object({
  name: z.string().min(1, "Nome do canal é obrigatório"),
  type: z.enum(["text", "board", "voice"]).default("text"),
  description: z.string().optional(),
  private: z.boolean().default(false),
});

export const updateChannelSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  private: z.boolean().optional(),
  icon: z.string().optional(),
});

export type CreateChannelInput = z.infer<typeof createChannelSchema>;
export type UpdateChannelInput = z.infer<typeof updateChannelSchema>;
