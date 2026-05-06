import { useQuery } from '@tanstack/react-query'
import * as dmsApi from '../../api/dms'
import { listMockDmMessages } from '../../data/mock-api'
import { useAuthStore } from '../../stores/authStore'

export function useDmMessages(dmId: string | null) {
  return useQuery({
    queryKey: ['dm-messages', dmId],
    queryFn: () => {
      if (!dmId) return Promise.resolve(null)
      return useAuthStore.getState().isMockMode
        ? Promise.resolve(listMockDmMessages(dmId))
        : dmsApi.listMessages(dmId)
    },
    enabled: !!dmId,
    staleTime: 30_000,
  })
}
