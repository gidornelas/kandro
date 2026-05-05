import { apiClient } from './client'

export interface MessageUser {
  id: string
  name: string
  initials: string
  color: string
}

export interface ReactionUser {
  id: string
}

export interface MessageReaction {
  id: string
  messageId: string
  userId: string
  emoji: string
  createdAt: string
  user: ReactionUser
}

export interface MessageAttachment {
  name: string
  size: number
  icon: string
  encrypted: boolean
}

export interface MessageTaskCard {
  label: string
  labelColor: string
  title: string
  due?: string
  priority: string
  priorityColor: string
}

export interface MessageResponse {
  id: string
  channelId: string
  userId: string
  text: string
  createdAt: string
  updatedAt: string
  user: MessageUser
  reactions: MessageReaction[]
  attachment: MessageAttachment | null
  taskCard: MessageTaskCard | null
}

export interface PaginatedMessages {
  data: MessageResponse[]
  nextCursor: string | null
  hasMore: boolean
}

export interface ReactionsResponse {
  reactions: MessageReaction[]
}

export function listByChannel(channelId: string, cursor?: string, limit?: number) {
  const params = new URLSearchParams()
  if (cursor) params.set('cursor', cursor)
  if (limit) params.set('limit', String(limit))
  const qs = params.toString()
  return apiClient.get<PaginatedMessages>(`/api/channels/${channelId}/messages${qs ? `?${qs}` : ''}`)
}

export function create(channelId: string, text: string, attachment?: MessageAttachment, taskCard?: MessageTaskCard) {
  return apiClient.post<MessageResponse>(`/api/channels/${channelId}/messages`, { text, attachment, taskCard })
}

export function update(messageId: string, text: string) {
  return apiClient.patch<MessageResponse>(`/api/messages/${messageId}`, { text })
}

export function remove(messageId: string) {
  return apiClient.delete<void>(`/api/messages/${messageId}`)
}

export function toggleReaction(messageId: string, emoji: string) {
  return apiClient.post<ReactionsResponse>(`/api/messages/${messageId}/reactions`, { emoji })
}
