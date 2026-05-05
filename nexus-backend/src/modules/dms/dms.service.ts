import type { PrismaClient } from '@prisma/client'
import type { CreateDmDto, SendDmDto } from './dms.schema.js'
import { NotFoundError, ConflictError } from '../../lib/errors.js'
import { parsePagination, paginate } from '../../lib/pagination.js'

export class DmsService {
  constructor(private prisma: PrismaClient) {}

  async listRooms(userId: string) {
    return this.prisma.directMessageRoom.findMany({
      where: {
        OR: [{ userAId: userId }, { userBId: userId }],
      },
      include: {
        userA: { select: { id: true, name: true, initials: true, color: true, status: true } },
        userB: { select: { id: true, name: true, initials: true, color: true, status: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { id: true, text: true, createdAt: true, userId: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async getOrCreateRoom(userId: string, dto: CreateDmDto) {
    if (userId === dto.userId) throw new ConflictError('Não pode criar DM consigo mesmo')

    const existing = await this.prisma.directMessageRoom.findFirst({
      where: {
        OR: [
          { userAId: userId, userBId: dto.userId },
          { userAId: dto.userId, userBId: userId },
        ],
      },
      include: {
        userA: { select: { id: true, name: true, initials: true, color: true, status: true } },
        userB: { select: { id: true, name: true, initials: true, color: true, status: true } },
      },
    })

    if (existing) return existing

    return this.prisma.directMessageRoom.create({
      data: {
        userAId: userId,
        userBId: dto.userId,
      },
      include: {
        userA: { select: { id: true, name: true, initials: true, color: true, status: true } },
        userB: { select: { id: true, name: true, initials: true, color: true, status: true } },
      },
    })
  }

  async listMessages(roomId: string, query?: { cursor?: string; limit?: string }) {
    const { cursor, limit } = parsePagination(query ?? {})

    const messages = await this.prisma.directMessage.findMany({
      where: { roomId },
      include: {
        user: { select: { id: true, name: true, initials: true, color: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    })

    return paginate(messages, limit)
  }

  async sendMessage(roomId: string, userId: string, dto: SendDmDto) {
    return this.prisma.directMessage.create({
      data: {
        roomId,
        userId,
        text: dto.text,
      },
      include: {
        user: { select: { id: true, name: true, initials: true, color: true } },
      },
    })
  }
}
