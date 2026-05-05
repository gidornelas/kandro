import { z } from 'zod'

export const searchQuerySchema = z.object({
  q: z.string().min(1).max(200),
  type: z.enum(['message', 'card', 'file']).optional(),
  workspaceId: z.string().min(1),
})

export type SearchQuery = z.infer<typeof searchQuerySchema>

export interface SearchResult {
  id: string
  type: 'message' | 'card' | 'file'
  title: string
  description: string
  url: string
  channelId?: string
  workspaceId: string
  createdAt: string
  user?: { id: string; name: string }
  score?: number
}
