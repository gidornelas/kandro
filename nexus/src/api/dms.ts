import { apiClient } from './client'

export interface DmUser {
  id: string
  name: string
  initials: string
  color: string
  status: string
}

export interface DmRoom {
  id: string
  userAId: string
  userBId: string
  userA: DmUser
  userB: DmUser
  messages: { id: string; text: string; createdAt: string; userId: string }[]
}

export interface DmMessage {
  id: string
  roomId: string
  userId: string
  text: string
  createdAt: string
  user: { id: string; name: string; initials: string; color: string }
}

export interface PaginatedDmMessages {
  data: DmMessage[]
  nextCursor?: string
  hasMore: boolean
}

export function listRooms() {
  return apiClient.get<DmRoom[]>('/api/dms/rooms')
}

export function getOrCreateRoom(userId: string) {
  return apiClient.post<DmRoom>('/api/dms/rooms', { userId })
}

export function listMessages(roomId: string, cursor?: string, limit?: number) {
  const params = new URLSearchParams()
  if (cursor) params.set('cursor', cursor)
  if (limit) params.set('limit', String(limit))
  const qs = params.toString()
  return apiClient.get<PaginatedDmMessages>(`/api/dms/rooms/${roomId}/messages${qs ? `?${qs}` : ''}`)
}
