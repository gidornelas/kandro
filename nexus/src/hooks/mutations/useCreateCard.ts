import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as boardsApi from '../../api/boards'

export function useCreateCard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      columnId,
      input,
    }: {
      columnId: string
      input: boardsApi.CreateCardInput
    }) => boardsApi.createCard(columnId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board'] })
      queryClient.invalidateQueries({ queryKey: ['card'] })
    },
  })
}
