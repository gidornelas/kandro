import { apiClient } from '../../core/api/client'

export interface FolderNode {
  id: string
  name: string
  type: 'folder' | 'file'
  icon: string
  size?: string
  itemCount?: number
  teamIds: string[]
  uploadedBy?: string
  uploadedAt?: string
  restricted: boolean
  encrypted: boolean
}

export function list(workspaceId: string) {
  return apiClient.get<FolderNode[]>(`/api/workspaces/${workspaceId}/files`)
}

export function upload(workspaceId: string, parentId: string | null, file: File) {
  const formData = new FormData()
  formData.append('file', file)
  if (parentId) formData.append('parentId', parentId)
  return apiClient.post<{ id: string; url: string }>(`/api/workspaces/${workspaceId}/files`, formData)
}
