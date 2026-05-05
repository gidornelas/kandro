import type { FastifyInstance } from 'fastify'
import { authenticate } from '../../middleware/authenticate.js'
import { ForbiddenError } from '../../lib/errors.js'
import { createDmSchema, sendDmSchema } from './dms.schema.js'
import { DmsService } from './dms.service.js'

export async function dmRoutes(fastify: FastifyInstance) {
  const service = new DmsService(fastify.prisma)

  fastify.get('/rooms', { preHandler: [authenticate] }, async (request) => {
    return service.listRooms(request.user.sub)
  })

  fastify.post('/rooms', { preHandler: [authenticate] }, async (request) => {
    const dto = createDmSchema.parse(request.body)

    // Verify both users belong to the same workspace
    const workspaces = await fastify.prisma.workspaceMember.findMany({
      where: { userId: request.user.sub },
      select: { workspaceId: true },
    })
    const otherMemberships = await fastify.prisma.workspaceMember.findMany({
      where: { userId: dto.userId },
      select: { workspaceId: true },
    })
    const otherWorkspaceIds = new Set(otherMemberships.map(m => m.workspaceId))
    const commonWorkspace = workspaces.some(m => otherWorkspaceIds.has(m.workspaceId))
    if (!commonWorkspace) {
      throw new ForbiddenError('Os usuários não pertencem ao mesmo workspace')
    }

    return service.getOrCreateRoom(request.user.sub, dto)
  })

  fastify.get('/rooms/:roomId/messages', { preHandler: [authenticate] }, async (request) => {
    const { roomId } = request.params as { roomId: string }
    const query = request.query as { cursor?: string; limit?: string }

    // Verify user is participant in this DM room
    const room = await fastify.prisma.directMessageRoom.findUnique({
      where: { id: roomId },
    })
    if (!room || (room.userAId !== request.user.sub && room.userBId !== request.user.sub)) {
      throw new ForbiddenError('Você não tem acesso a esta conversa')
    }

    return service.listMessages(roomId, query)
  })

  fastify.post('/rooms/:roomId/messages', { preHandler: [authenticate] }, async (request) => {
    const { roomId } = request.params as { roomId: string }
    const dto = sendDmSchema.parse(request.body)

    // Verify user is participant in this DM room
    const room = await fastify.prisma.directMessageRoom.findUnique({
      where: { id: roomId },
    })
    if (!room || (room.userAId !== request.user.sub && room.userBId !== request.user.sub)) {
      throw new ForbiddenError('Você não tem acesso a esta conversa')
    }

    return service.sendMessage(roomId, request.user.sub, dto)
  })
}
