import { useQuery } from '@tanstack/react-query'
import * as dmsApi from '../../api/dms'

export function useDmRooms() {
  return useQuery({
    queryKey: ['dm-rooms'],
    queryFn: () => dmsApi.listRooms(),
    staleTime: 60_000,
  })
}
