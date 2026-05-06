import { apiClient } from '../../core/api/client'

export function getVoiceToken(channelId: string) {
  return apiClient.get<{ token: string; room: string; url: string }>(`/api/channels/${channelId}/voice/token`)
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
