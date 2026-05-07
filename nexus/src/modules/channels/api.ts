import { apiClient } from '../../core/api/client'
import type { Channel } from '../../shared/types/domain'

export function listByWorkspace(workspaceId: string) {
  return apiClient.get<Channel[]>(`/api/workspaces/${workspaceId}/channels`)
}

export function create(workspaceId: string, data: { name: string; type: 'text' | 'board' | 'voice'; description?: string; private?: boolean }) {
  return apiClient.post<Channel>(`/api/workspaces/${workspaceId}/channels`, data)
}
