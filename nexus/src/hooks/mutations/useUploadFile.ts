import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as filesApi from '../../api/files'

export function useUploadFile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      workspaceId,
      file,
      parentId,
    }: {
      workspaceId: string
      file: File
      parentId?: string | null
    }) => filesApi.uploadFile(workspaceId, file, parentId ?? undefined),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['files', variables.workspaceId, variables.parentId ?? 'root'] })
    },
  })
}
