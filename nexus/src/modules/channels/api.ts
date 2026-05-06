import { apiClient } from '../../core/api/client'
import type { Channel } from '../../shared/types/domain'

export function listByWorkspace(workspaceId: string) {
  return apiClient.get<Channel[]>(`/api/workspaces/${workspaceId}/channels`)
}
