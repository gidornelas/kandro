import { apiClient } from '../../core/api/client'
import type { Project } from '../../shared/types/domain'

export function list(workspaceId: string) {
  return apiClient.get<Project[]>(`/api/projects?workspaceId=${encodeURIComponent(workspaceId)}`)
}

export function create(workspaceId: string, data: { name: string; status?: string; dateRange?: string }) {
  return apiClient.post<Project>(`/api/projects?workspaceId=${encodeURIComponent(workspaceId)}`, data)
}

export function update(projectId: string, data: { name?: string; status?: string; dateRange?: string }) {
  return apiClient.patch<Project>(`/api/projects/${projectId}`, data)
}

export function remove(projectId: string) {
  return apiClient.delete<void>(`/api/projects/${projectId}`)
}
