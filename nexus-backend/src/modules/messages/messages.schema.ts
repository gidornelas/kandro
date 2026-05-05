import { z } from "zod";

export const createMessageSchema = z.object({
  text: z.string().min(1, "Texto da mensagem é obrigatório"),
  attachment: z
    .object({
      name: z.string(),
      size: z.number().int(),
      icon: z.string(),
      encrypted: z.boolean().default(false),
    })
    .optional(),
  taskCard: z
    .object({
      label: z.string(),
      labelColor: z.string(),
      title: z.string(),
      due: z.string().datetime().optional(),
      priority: z.string(),
      priorityColor: z.string(),
    })
    .optional(),
});

export const updateMessageSchema = z.object({
  text: z.string().min(1),
});

export const toggleReactionSchema = z.object({
  emoji: z.string().min(1),
});

export type CreateMessageInput = z.infer<typeof createMessageSchema>;
export type UpdateMessageInput = z.infer<typeof updateMessageSchema>;
