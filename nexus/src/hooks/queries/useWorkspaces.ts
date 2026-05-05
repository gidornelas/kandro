import { useQuery } from '@tanstack/react-query'
import * as workspacesApi from '../../api/workspaces'

export function useWorkspaces() {
  return useQuery({
    queryKey: ['workspaces'],
    queryFn: () => workspacesApi.list(),
    staleTime: 300_000,
  })
}
