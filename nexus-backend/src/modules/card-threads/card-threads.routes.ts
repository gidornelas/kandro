import type { FastifyInstance } from 'fastify'
import { authenticate } from '../../middleware/authenticate.js'
import { requireCardAccess } from '../../middleware/authorize.js'
import { sendThreadMessageSchema } from './card-threads.schema.js'
import { CardThreadsService } from './card-threads.service.js'

export async function cardThreadRoutes(fastify: FastifyInstance) {
  const service = new CardThreadsService(fastify.prisma)

  fastify.get('/cards/:cardId/thread', { preHandler: [authenticate, requireCardAccess] }, async (request) => {
    const { cardId } = request.params as { cardId: string }
    const query = request.query as { cursor?: string; limit?: string }
    return service.listMessages(cardId, query)
  })

  fastify.post('/cards/:cardId/thread', { preHandler: [authenticate, requireCardAccess] }, async (request) => {
    const { cardId } = request.params as { cardId: string }
    const dto = sendThreadMessageSchema.parse(request.body)
    return service.sendMessage(cardId, request.user.sub, dto)
  })
}
