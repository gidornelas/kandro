import type { BoardCard, BoardColumn, ColumnWithCards } from '../api/boards'
import type { DmMessage, DmRoom, PaginatedDmMessages } from '../api/dms'
import type { FileNodeResponse } from '../api/files'
import type { MessageResponse, PaginatedMessages } from '../api/messages'
import {
  CHANNEL_MESSAGES,
  DMS,
  FILES,
  KANBAN_CARDS,
  KANBAN_COLUMNS,
  PROJECTS,
  USERS,
} from './mock'
import type { Workspace } from '../types'

const MOCK_WORKSPACE: Workspace = {
  id: 'mock-workspace',
  name: 'NEXUS',
  initials: 'NX',
  color: '#2f5fd6',
}

const MOCK_YEAR = new Date().getFullYear()

const MOCK_MONTHS: Record<string, string> = {
  Abr: '04',
  Mai: '05',
  Jun: '06',
}

function toIsoDate(value: string) {
  const [day, month] = value.split(' ')
  const mappedMonth = month ? MOCK_MONTHS[month] : null

  if (!day || !mappedMonth) return null

  return `${MOCK_YEAR}-${mappedMonth}-${day.padStart(2, '0')}T12:00:00.000Z`
}

function toBoardCard(card: typeof KANBAN_CARDS[number]): BoardCard {
  return {
    id: card.id,
    columnId: card.col,
    title: card.title,
    description: null,
    priority: card.priority,
    priorityColor: card.priorityColor,
    due: toIsoDate(card.due),
    dueType: card.dueType,
    progress: card.progress,
    position: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    labels: card.labels.map((label, index) => ({
      id: `${card.id}-label-${index}`,
      name: label,
      color: '#2f5fd6',
    })),
    assignees: card.assignees
      .map((userId, index) => USERS[userId] ? ({
        id: `${card.id}-assignee-${index}`,
        userId,
        user: {
          id: userId,
          name: USERS[userId].name,
          initials: USERS[userId].initials,
          color: USERS[userId].color,
        },
      }) : null)
      .filter((value): value is NonNullable<typeof value> => value !== null),
    subtaskCount: 0,
    commentCount: card.comments,
    threadCount: card.threadCount,
  }
}

function toBoardColumn(column: typeof KANBAN_COLUMNS[number], channelId: string): BoardColumn {
  return {
    id: column.id,
    channelId,
    name: column.name,
    color: column.color,
    position: 0,
    isTerminal: column.isTerminal,
    _count: { cards: KANBAN_CARDS.filter((card) => card.col === column.id).length },
  }
}

function toMessageResponse(message: typeof CHANNEL_MESSAGES[number]): MessageResponse {
  const user = USERS[message.userId]

  return {
    id: message.id,
    channelId: message.channel,
    userId: message.userId,
    text: message.text,
    createdAt: message.createdAt,
    updatedAt: message.createdAt,
    user: {
      id: message.userId,
      name: user?.name ?? message.user,
      initials: user?.initials ?? message.user.slice(0, 2).toUpperCase(),
      color: user?.color ?? '#2f5fd6',
    },
    reactions: message.reactions.map((reaction, index) => ({
      id: `${message.id}-reaction-${index}`,
      messageId: message.id,
      userId: reaction.me ? message.userId : 'teammate',
      emoji: reaction.emoji,
      createdAt: message.createdAt,
      user: { id: reaction.me ? message.userId : 'teammate' },
    })),
    attachment: message.attachment ? {
      name: message.attachment.name,
      size: Number.parseInt(message.attachment.size, 10) || 0,
      icon: message.attachment.icon,
      encrypted: message.attachment.encrypted,
    } : null,
    taskCard: message.taskRef ? {
      label: message.taskRef.label,
      labelColor: message.taskRef.labelColor,
      title: message.taskRef.title,
      due: message.taskRef.due,
      priority: message.taskRef.priority,
      priorityColor: message.taskRef.priorityColor,
    } : null,
  }
}

function toDmUser(userId: string) {
  const user = USERS[userId]

  return {
    id: userId,
    name: user?.name ?? userId,
    initials: user?.initials ?? userId.slice(0, 2).toUpperCase(),
    color: user?.color ?? '#2f5fd6',
    status: user?.status ?? 'online',
  }
}

function toDmMessage(roomId: string, message: typeof DMS[number]['messages'][number]): DmMessage {
  const user = USERS[message.userId]

  return {
    id: message.id,
    roomId,
    userId: message.userId,
    text: message.text,
    createdAt: message.createdAt,
    user: {
      id: message.userId,
      name: user?.name ?? message.user,
      initials: user?.initials ?? message.user.slice(0, 2).toUpperCase(),
      color: user?.color ?? '#2f5fd6',
    },
  }
}

export function listMockWorkspaces() {
  return [MOCK_WORKSPACE]
}

export function listMockBoardColumns(channelId: string) {
  return KANBAN_COLUMNS.map((column) => toBoardColumn(column, channelId))
}

export function listMockBoardCards(channelId: string): ColumnWithCards[] {
  return listMockBoardColumns(channelId).map((column) => ({
    ...column,
    cards: KANBAN_CARDS
      .filter((card) => card.col === column.id)
      .map(toBoardCard),
  }))
}

export function listMockMessages(channelId: string): PaginatedMessages {
  return {
    data: CHANNEL_MESSAGES
      .filter((message) => message.channel === channelId)
      .map(toMessageResponse),
    nextCursor: null,
    hasMore: false,
  }
}

export function listMockDmRooms(currentUserId: string): DmRoom[] {
  return DMS.map((room) => ({
    id: room.id,
    userAId: currentUserId,
    userBId: room.userId,
    userA: toDmUser(currentUserId),
    userB: toDmUser(room.userId),
    messages: room.messages.map((message) => ({
      id: message.id,
      text: message.text,
      createdAt: message.createdAt,
      userId: message.userId,
    })),
  }))
}

export function listMockDmMessages(roomId: string): PaginatedDmMessages {
  const room = DMS.find((entry) => entry.id === roomId)

  return {
    data: room
      ? [...room.messages].reverse().map((message) => toDmMessage(roomId, message))
      : [],
    hasMore: false,
  }
}

export function listMockFiles(parentId?: string | null): FileNodeResponse[] {
  if (parentId) return []

  return FILES.map((item) => ({
    id: item.id,
    name: item.name,
    type: item.type,
    icon: item.icon,
    size: item.size,
    teamIds: item.teamIds,
    uploadedBy: item.uploadedBy,
    uploadedByName: item.uploadedBy ? USERS[item.uploadedBy]?.name : undefined,
    uploadedAt: item.uploadedAt ? new Date().toISOString() : undefined,
    restricted: item.restricted,
    encrypted: item.encrypted,
    itemCount: item.itemCount,
  }))
}

export function listMockProjects() {
  return PROJECTS
}
