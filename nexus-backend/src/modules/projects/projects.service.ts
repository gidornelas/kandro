import type { PrismaClient } from '@prisma/client'
import type { CreateProjectDto, UpdateProjectDto, AddMemberDto } from './projects.schema.js'
import { NotFoundError } from '../../lib/errors.js'

export class ProjectsService {
  constructor(private prisma: PrismaClient) {}

  async list(workspaceId: string) {
    return this.prisma.project.findMany({
      where: { workspaceId },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, initials: true, color: true } } },
        },
        _count: { select: { members: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async getById(projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, initials: true, color: true } } },
        },
      },
    })
    if (!project) throw new NotFoundError('Projeto não encontrado')
    return project
  }

  async create(workspaceId: string, dto: CreateProjectDto, creatorId: string) {
    return this.prisma.$transaction(async (tx) => {
      const project = await tx.project.create({
        data: {
          workspaceId,
          name: dto.name,
          status: dto.status ?? 'Em andamento',
          dateRange: dto.dateRange,
        },
      })

      const memberIds = dto.memberIds ?? []
      if (!memberIds.includes(creatorId)) memberIds.push(creatorId)

      await tx.projectMember.createMany({
        data: memberIds.map((userId) => ({
          projectId: project.id,
          userId,
          role: userId === creatorId ? 'owner' : 'member',
        })),
      })

      return this.getById(project.id)
    })
  }

  async update(projectId: string, dto: UpdateProjectDto) {
    return this.prisma.project.update({
      where: { id: projectId },
      data: {
        name: dto.name,
        status: dto.status,
        dateRange: dto.dateRange,
      },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, initials: true, color: true } } },
        },
      },
    })
  }

  async delete(projectId: string) {
    await this.prisma.project.delete({ where: { id: projectId } })
  }

  async addMember(projectId: string, dto: AddMemberDto) {
    return this.prisma.projectMember.create({
      data: {
        projectId,
        userId: dto.userId,
        role: dto.role ?? 'member',
      },
      include: {
        user: { select: { id: true, name: true, initials: true, color: true } },
      },
    })
  }

  async removeMember(projectId: string, userId: string) {
    await this.prisma.projectMember.delete({
      where: { projectId_userId: { projectId, userId } },
    })
  }
}
