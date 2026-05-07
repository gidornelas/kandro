import React from 'react'
import { useAuthStore } from '../auth/store'
import { useAppDataStore } from '../app-data/store'
import { resolveMemberPermission } from './utils'
import type { ResourceType } from '../../shared/types/domain'

export function useResolvedPermissions(resourceId: string | null, resourceType: ResourceType) {
  const teams = useAppDataStore((s) => s.teams)
  const currentUserId = useAuthStore((s) => s.user?.id ?? null)

  return React.useMemo(() => {
    if (!resourceId || !currentUserId) {
      return { actions: [], teamIds: [], restricted: true }
    }
    return resolveMemberPermission(teams, currentUserId, resourceId, resourceType)
  }, [currentUserId, resourceId, resourceType, teams])
}
