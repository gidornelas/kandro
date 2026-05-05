import type { PrismaClient } from '@prisma/client'
import type { SendThreadMessageDto } from './card-threads.schema.js'
import { parsePagination, paginate } from '../../lib/pagination.js'

export class CardThreadsService {
  constructor(private prisma: PrismaClient) {}

  async listMessages(cardId: string, query?: { cursor?: string; limit?: string }) {
    const { cursor, limit } = parsePagination(query ?? {})

    const messages = await this.prisma.cardThreadMessage.findMany({
      where: { cardId },
      include: {
        user: { select: { id: true, name: true, initials: true, color: true } },
      },
      orderBy: { createdAt: 'asc' },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    })

    const events = await this.prisma.activity.findMany({
      where: { targetId: cardId, targetType: 'card' },
      include: {
        user: { select: { id: true, name: true, initials: true, color: true } },
      },
      orderBy: { createdAt: 'asc' },
    })

    const paginatedMessages = paginate(messages, limit)
    const timelineEvents = events.map((ev) => ({
      id: ev.id,
      type: this.mapActionToType(ev.action),
      userId: ev.userId,
      text: ev.targetName ?? `${ev.user.name} ${ev.action}`,
      timestamp: ev.createdAt.toISOString(),
    }))

    return {
      cardId,
      events: timelineEvents,
      ...paginatedMessages,
    }
  }

  async sendMessage(cardId: string, userId: string, dto: SendThreadMessageDto) {
    return this.prisma.cardThreadMessage.create({
      data: {
        cardId,
        userId,
        text: dto.text,
      },
      include: {
        user: { select: { id: true, name: true, initials: true, color: true } },
      },
    })
  }

  private mapActionToType(action: string): string {
    const map: Record<string, string> = {
      criou: 'created',
      moveu: 'moved',
      atribuiu: 'assigned',
      anexou: 'file',
      comentou: 'commented',
    }
    return map[action] ?? 'created'
  }
}
