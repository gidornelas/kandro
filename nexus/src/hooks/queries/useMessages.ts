import { useQuery } from '@tanstack/react-query'
import { listMockMessages } from '../../data/mock-api'
import { transformMessage } from '../../stores/dataStore'
import { useAuthStore } from '../../stores/authStore'
import * as messagesApi from '../../api/messages'


export function useMessages(channelId: string | null) {
  return useQuery({
    queryKey: ['messages', channelId],
    queryFn: async () => {
      if (!channelId) return null
      const res = useAuthStore.getState().isMockMode
        ? listMockMessages(channelId)
        : await messagesApi.listByChannel(channelId)
      const currentUserId = useAuthStore.getState().user?.id ?? ''
      return res.data.map(m => transformMessage(m, currentUserId))
    },
    enabled: !!channelId,
    staleTime: 30_000,
  })
}
