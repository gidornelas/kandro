import { z } from 'zod'

export const createDmSchema = z.object({
  userId: z.string().cuid(),
})

export const sendDmSchema = z.object({
  text: z.string().min(1).max(4000),
})

export type CreateDmDto = z.infer<typeof createDmSchema>
export type SendDmDto = z.infer<typeof sendDmSchema>
