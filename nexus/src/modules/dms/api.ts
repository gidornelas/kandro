import { apiClient } from '../../core/api/client'

export interface DmRoom {
  id: string
  userId: string
  unread: number
}

export interface DmMessage {
  id: string
  roomId: string
  userId: string
  text: string
  createdAt: string
}

export function listRooms() {
  return apiClient.get<DmRoom[]>('/api/dms/rooms')
}

export function listMessages(roomId: string) {
  return apiClient.get<DmMessage[]>(`/api/dms/rooms/${roomId}/messages`)
}

export function createMessage(roomId: string, text: string) {
  return apiClient.post<DmMessage>(`/api/dms/rooms/${roomId}/messages`, { text })
}
