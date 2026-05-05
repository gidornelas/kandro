import { apiClient } from './client'
import type { Workspace } from '../types'

export function list() {
  return apiClient.get<Workspace[]>('/api/workspaces')
}
