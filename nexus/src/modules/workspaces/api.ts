import { apiClient } from '../../core/api/client'
import type { Workspace } from '../../shared/types/domain'

export interface WorkspaceMember {
  id: string
  userId: string
  name: string
  email: string
  initials: string
  color: string
  role: string
  status: string
  joinedAt: string
}

export interface WorkspaceMemberCandidate {
  id: string
  name: string
  email: string
  initials: string
  color: string
  status: string
}

export function list() {
  return apiClient.get<Workspace[]>('/api/workspaces')
}

export function create(data: { name: string; initials?: string; color?: string }) {
  return apiClient.post<Workspace>('/api/workspaces', data)
}

export function listMembers(workspaceId: string) {
  return apiClient.get<WorkspaceMember[]>(`/api/workspaces/${workspaceId}/members`)
}

export function searchMemberCandidates(workspaceId: string, query: string) {
  return apiClient.get<WorkspaceMemberCandidate[]>(
    `/api/workspaces/${workspaceId}/member-candidates?q=${encodeURIComponent(query)}`,
  )
}

export function addMember(workspaceId: string, data: { email: string; role: 'member' | 'admin' }) {
  return apiClient.post<WorkspaceMember>(`/api/workspaces/${workspaceId}/members`, data)
}

export function removeMember(workspaceId: string, userId: string) {
  return apiClient.delete<void>(`/api/workspaces/${workspaceId}/members/${userId}`)
}
