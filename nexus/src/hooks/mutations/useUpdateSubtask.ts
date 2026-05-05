import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as boardsApi from '../../api/boards'

export function useUpdateSubtask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ subtaskId, input }: { subtaskId: string; input: boardsApi.UpdateSubtaskInput }) =>
      boardsApi.updateSubtask(subtaskId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['card'] })
    },
  })
}
