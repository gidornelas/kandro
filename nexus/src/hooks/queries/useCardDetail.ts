import { useQuery } from '@tanstack/react-query'
import * as boardsApi from '../../api/boards'

export function useCardDetail(cardId: string | null) {
  return useQuery({
    queryKey: ['card', cardId],
    queryFn: () => {
      if (!cardId) return Promise.resolve(null)
      return boardsApi.getCard(cardId)
    },
    enabled: !!cardId,
    staleTime: 60_000,
  })
}
