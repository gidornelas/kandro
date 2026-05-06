import { useQuery } from '@tanstack/react-query'
import * as boardsApi from '../../api/boards'
import { listMockBoardCards, listMockBoardColumns } from '../../data/mock-api'
import { transformBoardCard } from '../../stores/dataStore'
import { useAuthStore } from '../../stores/authStore'
import type { KanbanCard } from '../../types'

export function useBoardData(channelId: string | null) {
  return useQuery({
    queryKey: ['board', channelId],
    queryFn: async () => {
      if (!channelId) return null
      const mockMode = useAuthStore.getState().isMockMode
      const [columns, cardsData] = await Promise.all([
        mockMode ? Promise.resolve(listMockBoardColumns(channelId)) : boardsApi.listColumns(channelId),
        mockMode ? Promise.resolve(listMockBoardCards(channelId)) : boardsApi.listCards(channelId),
      ])
      const cols = cardsData.length > 0
        ? cardsData.map(c => ({ id: c.id, name: c.name, color: c.color, isTerminal: c.isTerminal }))
        : columns.map(c => ({ id: c.id, name: c.name, color: c.color, isTerminal: c.isTerminal }))
      const cards: KanbanCard[] = []
      for (const col of cardsData) {
        for (const card of col.cards ?? []) {
          cards.push(transformBoardCard(card))
        }
      }
      return { columns, cardsData, cols, cards }
    },
    enabled: !!channelId,
    staleTime: 60_000,
  })
}
