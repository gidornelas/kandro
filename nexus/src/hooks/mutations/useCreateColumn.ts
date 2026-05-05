import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as boardsApi from '../../api/boards'

export function useCreateColumn() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ channelId, name, color }: { channelId: string; name: string; color?: string }) =>
      boardsApi.createColumn(channelId, { name, color }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['board', variables.channelId] })
    },
  })
}
