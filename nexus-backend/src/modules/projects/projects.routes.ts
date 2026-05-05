import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { authenticate } from '../../middleware/authenticate.js'
import { requireWorkspaceRole } from '../../middleware/authorize.js'
import { ForbiddenError, NotFoundError } from '../../lib/errors.js'
import { createProjectSchema, updateProjectSchema, addMemberSchema } from './projects.schema.js'
import { ProjectsService } from './projects.service.js'

async function requireProjectAccess(request: FastifyRequest, _reply: FastifyReply) {
  const { projectId } = request.params as { projectId: string }
  if (!projectId) return

  const prisma = request.server.prisma
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  })
  if (!project) throw new NotFoundError('Projeto')

  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId: project.workspaceId,
        userId: request.user.sub,
      },
    },
  })
  if (!member) {
    throw new ForbiddenError('Você não tem acesso a este projeto')
  }
}

export async function projectRoutes(fastify: FastifyInstance) {
  const service = new ProjectsService(fastify.prisma)

  fastify.get('/', { preHandler: [authenticate, requireWorkspaceRole('member')] }, async (request) => {
    const { workspaceId } = request.query as { workspaceId: string }
    return service.list(workspaceId)
  })

  fastify.get('/:projectId', { preHandler: [authenticate, requireProjectAccess] }, async (request) => {
    const { projectId } = request.params as { projectId: string }
    return service.getById(projectId)
  })

  fastify.post('/', { preHandler: [authenticate, requireWorkspaceRole('member')] }, async (request) => {
    const { workspaceId } = request.query as { workspaceId: string }
    const dto = createProjectSchema.parse(request.body)
    return service.create(workspaceId, dto, request.user.sub)
  })

  fastify.patch('/:projectId', { preHandler: [authenticate, requireProjectAccess] }, async (request) => {
    const { projectId } = request.params as { projectId: string }
    const dto = updateProjectSchema.parse(request.body)
    return service.update(projectId, dto)
  })

  fastify.delete('/:projectId', { preHandler: [authenticate, requireProjectAccess] }, async (request) => {
    const { projectId } = request.params as { projectId: string }
    await service.delete(projectId)
    return { success: true }
  })

  fastify.post('/:projectId/members', { preHandler: [authenticate, requireProjectAccess] }, async (request) => {
    const { projectId } = request.params as { projectId: string }
    const dto = addMemberSchema.parse(request.body)
    return service.addMember(projectId, dto)
  })

  fastify.delete('/:projectId/members/:userId', { preHandler: [authenticate, requireProjectAccess] }, async (request) => {
    const { projectId, userId } = request.params as { projectId: string; userId: string }
    await service.removeMember(projectId, userId)
    return { success: true }
  })
}
