import { useQuery } from '@tanstack/react-query'
import * as workspacesApi from '../../api/workspaces'
import { listMockWorkspaces } from '../../data/mock-api'
import { useAuthStore } from '../../stores/authStore'

export function useWorkspaces() {
  return useQuery({
    queryKey: ['workspaces'],
    queryFn: () => useAuthStore.getState().isMockMode
      ? Promise.resolve(listMockWorkspaces())
      : workspacesApi.list(),
    staleTime: 300_000,
  })
}
