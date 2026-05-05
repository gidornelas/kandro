import { apiClient } from './client'

export interface ThreadMessage {
  id: string
  cardId: string
  userId: string
  user: { id: string; name: string; initials: string; color: string }
  text: string
  createdAt: string
}

export interface ThreadEvent {
  id: string
  type: string
  userId: string
  text: string
  timestamp: string
}

export interface ThreadResponse {
  cardId: string
  events: ThreadEvent[]
  messages: ThreadMessage[]
}

export function listThreadMessages(cardId: string) {
  return apiClient.get<ThreadResponse>(`/api/boards/cards/${cardId}/thread`)
}

export function sendThreadMessage(cardId: string, text: string) {
  return apiClient.post<ThreadMessage>(`/api/boards/cards/${cardId}/thread`, { text })
}
