import { apiClient } from '../../core/api/client'
import type { Team } from '../../shared/types/domain'

export function list() {
  return apiClient.get<Team[]>('/api/teams')
}

export function create(data: { name: string; color: string }) {
  return apiClient.post<Team>('/api/teams', data)
}

export function update(teamId: string, data: { name?: string; color?: string }) {
  return apiClient.patch<Team>(`/api/teams/${teamId}`, data)
}

export function remove(teamId: string) {
  return apiClient.delete<void>(`/api/teams/${teamId}`)
}

export function addMember(teamId: string, userId: string) {
  return apiClient.post<void>(`/api/teams/${teamId}/members`, { userId })
}

export function removeMember(teamId: string, userId: string) {
  return apiClient.delete<void>(`/api/teams/${teamId}/members/${userId}`)
}
