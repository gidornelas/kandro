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

export function list() {
  return apiClient.get<Workspace[]>('/api/workspaces')
}

export function listMembers(workspaceId: string) {
  return apiClient.get<WorkspaceMember[]>(`/api/workspaces/${workspaceId}/members`)
}
