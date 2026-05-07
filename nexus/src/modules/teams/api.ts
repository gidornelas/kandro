import { apiClient } from '../../core/api/client'
import type { Team, TeamPermission } from '../../shared/types/domain'

export interface TeamResponse extends Omit<Team, 'memberIds' | 'permissions'> {
  members?: { userId: string; user?: { id: string } }[]
  permissions: TeamPermission[]
}

export function list(workspaceId: string) {
  return apiClient.get<TeamResponse[]>(`/api/workspaces/${workspaceId}/teams`)
}

export function create(workspaceId: string, data: { name: string; color: string }) {
  return apiClient.post<TeamResponse>(`/api/workspaces/${workspaceId}/teams`, data)
}

export function update(teamId: string, data: { name?: string; color?: string }) {
  return apiClient.patch<TeamResponse>(`/api/teams/${teamId}`, data)
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

export function setPermission(teamId: string, data: TeamPermission) {
  return apiClient.post<TeamPermission | null>(`/api/teams/${teamId}/permissions`, data)
}
