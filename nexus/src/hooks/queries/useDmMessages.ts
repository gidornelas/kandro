import { useQuery } from '@tanstack/react-query'
import * as dmsApi from '../../api/dms'

export function useDmMessages(dmId: string | null) {
  return useQuery({
    queryKey: ['dm-messages', dmId],
    queryFn: () => {
      if (!dmId) return Promise.resolve(null)
      return dmsApi.listMessages(dmId)
    },
    enabled: !!dmId,
    staleTime: 30_000,
  })
}
