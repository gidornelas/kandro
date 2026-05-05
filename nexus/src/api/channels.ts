import { apiClient } from './client'
import type { Channel } from '../types'

export function listByWorkspace(workspaceId: string) {
  return apiClient.get<Channel[]>(`/api/workspaces/${workspaceId}/channels`)
}
