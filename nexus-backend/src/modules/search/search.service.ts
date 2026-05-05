import type { PrismaClient } from '@prisma/client'
import type { SearchQuery, SearchResult } from './search.schema.js'

const LIMIT_PER_TYPE = 20
const MIN_SIMILARITY = 0.1 // threshold for trigram similarity

/**
 * Build a trigram similarity search clause for a field.
 * Returns raw SQL condition for use with $queryRaw or modifies the Prisma where.
 */
function trigramSearch(field: string, term: string) {
  // Prisma doesn't natively support pg_trgm, so we use $queryRaw for the search
  return { contains: term, mode: 'insensitive' as const }
}

export function createSearchService(prisma: PrismaClient) {
  async function search(query: SearchQuery): Promise<SearchResult[]> {
    const results: SearchResult[] = []
    const workspaceId = query.workspaceId

    // Search messages using raw SQL with pg_trgm for better performance and ranking
    if (!query.type || query.type === 'message') {
      const messages = await prisma.$queryRaw<
        Array<{
          id: string
          text: string
          channel_id: string
          channel_name: string
          user_id: string
          user_name: string
          created_at: Date
          similarity: number
        }>
      >`
        SELECT
          m.id,
          m.text,
          m.channel_id,
          ch.name AS channel_name,
          m.user_id,
          u.name AS user_name,
          m.created_at,
          similarity(m.text, ${query.q}) AS similarity
        FROM messages m
        JOIN channels ch ON ch.id = m.channel_id
        JOIN users u ON u.id = m.user_id
        WHERE ch.workspace_id = ${workspaceId}::text
          AND m.text % ${query.q}
          AND similarity(m.text, ${query.q}) >= ${MIN_SIMILARITY}
        ORDER BY similarity DESC, m.created_at DESC
        LIMIT ${LIMIT_PER_TYPE}
      `

      results.push(...messages.map(m => ({
        id: m.id,
        type: 'message' as const,
        title: m.channel_name,
        description: m.text.slice(0, 200),
        url: `/channel/${m.channel_id}`,
        channelId: m.channel_id,
        workspaceId,
        createdAt: m.created_at.toISOString(),
        user: { id: m.user_id, name: m.user_name },
        score: m.similarity,
      })))
    }

    // Search cards
    if (!query.type || query.type === 'card') {
      const cards = await prisma.$queryRaw<
        Array<{
          id: string
          title: string
          description: string | null
          channel_id: string
          channel_name: string
          created_at: Date
          similarity: number
        }>
      >`
        SELECT
          kc.id,
          kc.title,
          kc.description,
          ch.id AS channel_id,
          ch.name AS channel_name,
          kc.created_at,
          GREATEST(
            similarity(kc.title, ${query.q}),
            COALESCE(similarity(kc.description, ${query.q}), 0)
          ) AS similarity
        FROM kanban_cards kc
        JOIN kanban_columns kcol ON kcol.id = kc.column_id
        JOIN channels ch ON ch.id = kcol.channel_id
        WHERE ch.workspace_id = ${workspaceId}::text
          AND (kc.title % ${query.q} OR kc.description % ${query.q})
          AND GREATEST(
            similarity(kc.title, ${query.q}),
            COALESCE(similarity(kc.description, ${query.q}), 0)
          ) >= ${MIN_SIMILARITY}
        ORDER BY similarity DESC, kc.created_at DESC
        LIMIT ${LIMIT_PER_TYPE}
      `

      results.push(...cards.map(c => ({
        id: c.id,
        type: 'card' as const,
        title: c.title,
        description: c.description ?? '',
        url: `/project/${c.channel_id}`,
        channelId: c.channel_id,
        workspaceId,
        createdAt: c.created_at.toISOString(),
        score: c.similarity,
      })))
    }

    // Search files
    if (!query.type || query.type === 'file') {
      const files = await prisma.$queryRaw<
        Array<{
          id: string
          name: string
          created_at: Date
          similarity: number
        }>
      >`
        SELECT
          fn.id,
          fn.name,
          fn.created_at,
          similarity(fn.name, ${query.q}) AS similarity
        FROM file_nodes fn
        WHERE fn.workspace_id = ${workspaceId}::text
          AND fn.type = 'file'
          AND fn.name % ${query.q}
          AND similarity(fn.name, ${query.q}) >= ${MIN_SIMILARITY}
        ORDER BY similarity DESC, fn.created_at DESC
        LIMIT ${LIMIT_PER_TYPE}
      `

      results.push(...files.map(f => ({
        id: f.id,
        type: 'file' as const,
        title: f.name,
        description: '',
        url: `/files/${f.id}`,
        workspaceId,
        createdAt: f.created_at.toISOString(),
        score: f.similarity,
      })))
    }

    return results
  }

  return { search }
}
