import { z } from 'zod'

export const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  status: z.string().max(50).optional(),
  dateRange: z.string().max(100).optional(),
  memberIds: z.array(z.string().cuid()).optional(),
})

export const updateProjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  status: z.string().max(50).optional(),
  dateRange: z.string().max(100).optional(),
})

export const addMemberSchema = z.object({
  userId: z.string().cuid(),
  role: z.string().max(50).optional(),
})

export type CreateProjectDto = z.infer<typeof createProjectSchema>
export type UpdateProjectDto = z.infer<typeof updateProjectSchema>
export type AddMemberDto = z.infer<typeof addMemberSchema>
