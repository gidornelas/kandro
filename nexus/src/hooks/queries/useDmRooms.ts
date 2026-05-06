import { useQuery } from '@tanstack/react-query'
import * as dmsApi from '../../api/dms'
import { listMockDmRooms } from '../../data/mock-api'
import { useAuthStore } from '../../stores/authStore'

export function useDmRooms() {
  return useQuery({
    queryKey: ['dm-rooms'],
    queryFn: () => {
      const currentUserId = useAuthStore.getState().user?.id ?? 'dev-user-1'
      return useAuthStore.getState().isMockMode
        ? Promise.resolve(listMockDmRooms(currentUserId))
        : dmsApi.listRooms()
    },
    staleTime: 60_000,
  })
}
