import { apiClient } from './client'

export interface VoiceTokenResponse {
  token: string
  room: string
  url: string
}

export function getVoiceToken(channelId: string) {
  return apiClient.post<VoiceTokenResponse>(`/api/channels/${channelId}/voice/token`)
}

export function joinVoice(channelId: string) {
  return apiClient.post<{ ok: boolean }>(`/api/channels/${channelId}/voice/join`)
}

export function leaveVoice(channelId: string) {
  return apiClient.post<{ ok: boolean }>(`/api/channels/${channelId}/voice/leave`)
}

export function updateParticipant(
  channelId: string,
  data: { muted?: boolean; cameraOn?: boolean; sharing?: boolean }
) {
  return apiClient.patch(`/api/channels/${channelId}/voice/participant`, data)
}
