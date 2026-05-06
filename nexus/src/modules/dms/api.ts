import { apiClient } from '../../core/api/client'

export interface DmUser {
  id: string
  name: string
  initials: string
  color: string
  status?: string
}

export interface DmRoom {
  id: string
  userAId: string
  userBId: string
  userA: DmUser
  userB: DmUser
  messages?: { id: string; text: string; createdAt: string; userId: string }[]
  unread?: number
}

export interface DmMessage {
  id: string
  roomId: string
  userId: string
  text: string
  createdAt: string
  user?: DmUser
}

export interface PaginatedDmMessages {
  data: DmMessage[]
  nextCursor: string | null
  hasMore: boolean
}

export function listRooms() {
  return apiClient.get<DmRoom[]>('/api/dms/rooms')
}

export function listMessages(roomId: string) {
  return apiClient.get<PaginatedDmMessages>(`/api/dms/rooms/${roomId}/messages`)
}

export function createMessage(roomId: string, text: string) {
  return apiClient.post<DmMessage>(`/api/dms/rooms/${roomId}/messages`, { text })
}
