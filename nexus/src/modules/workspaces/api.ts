import { apiClient } from '../../core/api/client'
import type { Workspace } from '../../shared/types/domain'

export function list() {
  return apiClient.get<Workspace[]>('/api/workspaces')
}
