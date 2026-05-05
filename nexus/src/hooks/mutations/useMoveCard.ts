import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as boardsApi from '../../api/boards'

export function useMoveCard(channelId: string | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ cardId, toColumnId }: { cardId: string; toColumnId: string }) =>
      boardsApi.moveCard(cardId, { toColumnId }),
    onMutate: async ({ cardId, toColumnId }) => {
      await queryClient.cancelQueries({ queryKey: ['board', channelId] })
      const previousData = queryClient.getQueryData<{ cols?: Array<{ id: string; isTerminal?: boolean }>; cards?: Array<{ id: string; col: string; progress?: number }> }>(['board', channelId])
      const targetCol = previousData?.cols?.find(c => c.id === toColumnId)
      const isTerminal = targetCol?.isTerminal ?? false
      queryClient.setQueryData(['board', channelId], (old: { cards: { id: string; col: string; progress?: number }[] } | null) => {
        if (!old) return old
        return {
          ...old,
          cards: old.cards.map(c =>
            c.id === cardId
              ? { ...c, col: toColumnId, progress: isTerminal ? 100 : c.progress }
              : c
          ),
        }
      })
      return { previousData }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['board', channelId], context.previousData)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['board', channelId] })
    },
  })
}
