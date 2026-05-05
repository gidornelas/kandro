import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as filesApi from '../../api/files'

export function useCreateFolder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      workspaceId,
      name,
      parentId,
    }: {
      workspaceId: string
      name: string
      parentId?: string | null
    }) => filesApi.createFolder(workspaceId, name, parentId ?? undefined),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['files', variables.workspaceId, variables.parentId ?? 'root'] })
    },
  })
}
