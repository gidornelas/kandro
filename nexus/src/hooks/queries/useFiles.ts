import { useQuery } from '@tanstack/react-query'
import * as filesApi from '../../api/files'
import { listMockFiles } from '../../data/mock-api'
import { useAuthStore } from '../../stores/authStore'
import type { FolderItem } from '../../types'

function toFolderItem(n: filesApi.FileNodeResponse): FolderItem {
  return {
    id: n.id,
    name: n.name,
    type: n.type,
    icon: n.icon,
    size: n.size,
    itemCount: n.itemCount,
    teamIds: n.teamIds,
    uploadedBy: n.uploadedBy,
    uploadedAt: n.uploadedAt ? new Date(n.uploadedAt).toLocaleString() : undefined,
    restricted: n.restricted,
    encrypted: n.encrypted,
  }
}

export function useFiles(workspaceId: string | null, parentId?: string | null) {
  return useQuery({
    queryKey: ['files', workspaceId, parentId ?? 'root'],
    queryFn: async () => {
      if (!workspaceId) return null
      const data = useAuthStore.getState().isMockMode
        ? listMockFiles(parentId)
        : await filesApi.listFiles(workspaceId, parentId ?? undefined)
      return data.map(toFolderItem)
    },
    enabled: !!workspaceId,
    staleTime: 120_000,
  })
}
