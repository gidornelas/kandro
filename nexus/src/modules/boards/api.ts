import { apiClient } from '../../core/api/client'

export interface BoardLabel {
  id: string
  name: string
  color: string
}

export interface BoardAssignee {
  id: string
  userId: string
  user: { id: string; name: string; initials: string; color: string }
}

export interface BoardColumn {
  id: string
  channelId: string
  name: string
  color: string
  position: number
  isTerminal?: boolean
  _count?: { cards: number }
}

export interface BoardCard {
  id: string
  columnId: string
  title: string
  description: string | null
  priority: string
  priorityColor: string
  due: string | null
  dueType: string
  progress: number
  position: number
  createdAt: string
  updatedAt: string
  labels: BoardLabel[]
  assignees: BoardAssignee[]
  commentCount?: number
  threadCount?: number
}

export interface BoardSubtask {
  id: string
  cardId: string
  text: string
  done: boolean
  position: number
}

export interface CardComment {
  id: string
  cardId: string
  userId: string
  user: { id: string; name: string; initials: string; color: string }
  text: string
  createdAt: string
}

export interface BoardCardDetail extends BoardCard {
  column: { id: string; name: string; color: string }
  subtasks: BoardSubtask[]
  comments: CardComment[]
}

export interface ColumnWithCards extends BoardColumn {
  cards: BoardCard[]
}

export interface CreateColumnInput {
  name: string
  color?: string
  position?: number
}

export interface CreateCardInput {
  title: string
  description?: string
  priority?: string
  priorityColor?: string
  due?: string
  labels?: { name: string; color: string }[]
  assignees?: string[]
}

export interface UpdateCardInput {
  title?: string
  description?: string
  priority?: string
  priorityColor?: string
  due?: string
  progress?: number
}

export interface MoveCardInput {
  toColumnId: string
  position?: number
}

export interface CreateCommentInput {
  text: string
}

// ─── API Functions ───────────────────────────────────────

export function listColumns(channelId: string) {
  return apiClient.get<BoardColumn[]>(`/api/channels/${channelId}/columns`)
}

export function createColumn(channelId: string, input: CreateColumnInput) {
  return apiClient.post<BoardColumn>(`/api/channels/${channelId}/columns`, input)
}

export function updateColumn(columnId: string, input: Partial<CreateColumnInput>) {
  return apiClient.patch<BoardColumn>(`/api/columns/${columnId}`, input)
}

export function deleteColumn(columnId: string) {
  return apiClient.delete<void>(`/api/columns/${columnId}`)
}

export function listCards(channelId: string) {
  return apiClient.get<ColumnWithCards[]>(`/api/channels/${channelId}/cards`)
}

export function getCard(cardId: string) {
  return apiClient.get<BoardCardDetail>(`/api/cards/${cardId}`)
}

export function createCard(columnId: string, input: CreateCardInput) {
  return apiClient.post<BoardCard>(`/api/columns/${columnId}/cards`, input)
}

export function updateCard(cardId: string, input: UpdateCardInput) {
  return apiClient.patch<BoardCard>(`/api/cards/${cardId}`, input)
}

export function moveCard(cardId: string, input: MoveCardInput) {
  return apiClient.patch<BoardCardDetail>(`/api/cards/${cardId}/move`, input)
}

export function deleteCard(cardId: string) {
  return apiClient.delete<void>(`/api/cards/${cardId}`)
}

export function listComments(cardId: string) {
  return apiClient.get<CardComment[]>(`/api/cards/${cardId}/comments`)
}

export function createComment(cardId: string, input: CreateCommentInput) {
  return apiClient.post<CardComment>(`/api/cards/${cardId}/comments`, input)
}

export function deleteComment(commentId: string) {
  return apiClient.delete<void>(`/api/comments/${commentId}`)
}
