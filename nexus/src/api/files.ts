import { apiClient, ApiError } from './client'
import { useAuthStore } from '../stores/authStore'
import { API_URL } from '../lib/env'

export interface FileNodeResponse {
  id: string
  name: string
  type: 'folder' | 'file'
  icon: string
  size?: string
  mimeType?: string
  teamIds: string[]
  teams?: { id: string; name: string; color: string }[]
  uploadedBy?: string
  uploadedByName?: string
  uploadedAt?: string
  restricted: boolean
  encrypted: boolean
  itemCount?: number
  downloadUrl?: string
}

export function listFiles(workspaceId: string, parentId?: string) {
  const params = parentId ? `?parentId=${encodeURIComponent(parentId)}` : ''
  return apiClient.get<FileNodeResponse[]>(`/api/workspaces/${workspaceId}/files${params}`)
}

export function createFolder(workspaceId: string, name: string, parentId?: string) {
  return apiClient.post<FileNodeResponse>(`/api/workspaces/${workspaceId}/files/folder`, {
    name,
    parentId: parentId ?? null,
  })
}

export async function uploadFile(workspaceId: string, file: File, parentId?: string) {
  const formData = new FormData()
  formData.append('file', file)
  if (parentId) formData.append('parentId', parentId)

  const token = useAuthStore.getState().accessToken
  const url = `${API_URL}/api/workspaces/${workspaceId}/files/upload${parentId ? `?parentId=${encodeURIComponent(parentId)}` : ''}`

  const response = await fetch(url, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new ApiError(response.status, body.message || 'Upload failed', body.error, body.details)
  }

  return response.json() as Promise<FileNodeResponse>
}

export function getDownloadUrl(fileId: string) {
  return apiClient.get<{ downloadUrl: string } & FileNodeResponse>(`/api/files/${fileId}`)
}
