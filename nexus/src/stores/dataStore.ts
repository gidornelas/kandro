import type { Message, KanbanCard, KanbanColumn } from '../types'
import type { MessageResponse, MessageReaction } from '../api/messages'
import type { BoardCard, BoardColumn } from '../api/boards'

export function transformReactions(reactions: MessageReaction[], currentUserId: string): Message['reactions'] {
  const grouped = new Map<string, { count: number; me: boolean }>()
  for (const r of reactions) {
    const existing = grouped.get(r.emoji) ?? { count: 0, me: false }
    existing.count++
    if (r.userId === currentUserId) existing.me = true
    grouped.set(r.emoji, existing)
  }
  return Array.from(grouped.entries()).map(([emoji, { count, me }]) => ({ emoji, count, me }))
}

export function transformMessage(msg: MessageResponse, currentUserId: string): Message {
  return {
    id: msg.id,
    channel: msg.channelId,
    user: msg.user.id,
    userId: msg.userId,
    time: new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    createdAt: msg.createdAt,
    text: msg.text,
    reactions: transformReactions(msg.reactions, currentUserId),
    ...(msg.attachment ? { attachment: { name: msg.attachment.name, size: String(msg.attachment.size), icon: msg.attachment.icon, encrypted: msg.attachment.encrypted } } : {}),
    ...(msg.taskCard ? { taskCard: { ...msg.taskCard, due: msg.taskCard.due ?? 'Sem data' } } : {}),
  }
}

export function transformBoardCard(card: BoardCard): KanbanCard {
  return {
    id: card.id,
    col: card.columnId,
    title: card.title,
    labels: (card.labels ?? []).map(l => l.name),
    priority: card.priority,
    priorityColor: card.priorityColor,
    assignees: (card.assignees ?? []).map(a => a.userId),
    due: card.due ? new Date(card.due).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : '—',
    dueType: (card.dueType as KanbanCard['dueType']) || 'normal',
    comments: card.commentCount ?? 0,
    attachments: 0,
    progress: card.progress,
    threadCount: card.threadCount ?? 0,
  }
}

export function transformBoardColumn(col: BoardColumn, cards: KanbanCard[]): KanbanColumn & { cards: KanbanCard[] } {
  return {
    id: col.id,
    name: col.name,
    color: col.color,
    isTerminal: col.isTerminal,
    cards,
  }
}
