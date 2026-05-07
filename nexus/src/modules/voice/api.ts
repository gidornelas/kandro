import { apiClient } from '../../core/api/client'

export interface VoiceSessionResponse {
  sessionId: string
  roomName: string
  active: boolean
  startedBy?: string
  participants: {
    userId: string
    name: string
    initials: string
    color: string
    muted: boolean
    cameraOn: boolean
    sharing: boolean
    joinedAt?: string
  }[]
}

export function getVoiceSession(channelId: string) {
  return apiClient.get<VoiceSessionResponse | { active: false; participants: [] }>(`/api/channels/${channelId}/voice/session`)
}

export function getVoiceToken(channelId: string) {
  return apiClient.post<{ token: string; room: string; url: string }>(`/api/channels/${channelId}/voice/token`, {})
}

export function joinVoice(channelId: string) {
  return apiClient.post<void>(`/api/channels/${channelId}/voice/join`, {})
}

export function leaveVoice(channelId: string) {
  return apiClient.post<void>(`/api/channels/${channelId}/voice/leave`, {})
}

export function updateParticipant(channelId: string, data: { muted?: boolean; cameraOn?: boolean; sharing?: boolean }) {
  return apiClient.patch<void>(`/api/channels/${channelId}/voice/participant`, data)
}
