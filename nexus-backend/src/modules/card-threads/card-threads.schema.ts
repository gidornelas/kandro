import { z } from 'zod'

export const sendThreadMessageSchema = z.object({
  text: z.string().min(1).max(4000),
})

export type SendThreadMessageDto = z.infer<typeof sendThreadMessageSchema>
