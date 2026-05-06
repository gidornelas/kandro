import { apiClient } from '../../core/api/client'

export interface PaginatedFiles {
  data: FolderNode[]
  nextCursor: string | null
  hasMore: boolean
}

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

export function list(workspaceId: string, parentId?: string | null) {
  const params = new URLSearchParams()
  if (parentId) params.set('parentId', parentId)
  const qs = params.toString()
  return apiClient.get<PaginatedFiles>(`/api/workspaces/${workspaceId}/files${qs ? `?${qs}` : ''}`)
}

export function upload(workspaceId: string, parentId: string | null, file: File) {
  const formData = new FormData()
  formData.append('file', file)
  const params = new URLSearchParams()
  if (parentId) params.set('parentId', parentId)
  const qs = params.toString()
  return apiClient.post<FolderNode>(`/api/workspaces/${workspaceId}/files/upload${qs ? `?${qs}` : ''}`, formData)
}

export function remove(fileId: string) {
  return apiClient.delete<void>(`/api/files/${fileId}`)
}
