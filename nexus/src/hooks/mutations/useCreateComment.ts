import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as boardsApi from '../../api/boards'

export function useCreateComment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ cardId, text }: { cardId: string; text: string }) =>
      boardsApi.createComment(cardId, { text }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['card', variables.cardId] })
    },
  })
}
