import type { FastifyInstance } from 'fastify'
import { authenticate } from '../../middleware/authenticate.js'
import { searchQuerySchema } from './search.schema.js'
import { createSearchService } from './search.service.js'

export async function searchRoutes(fastify: FastifyInstance) {
  const searchService = createSearchService(fastify.prisma)

  fastify.get('/api/search', { preHandler: [authenticate] }, async (request) => {
    const query = searchQuerySchema.parse(request.query)
    return searchService.search(query)
  })
}
