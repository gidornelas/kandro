import type { PermissionAction, ResourceType, Team } from '../../shared/types/domain'

const ACTION_ORDER: PermissionAction[] = ['view', 'post', 'comment', 'edit', 'manage', 'admin']

const IMPLIED_ACTIONS: Record<PermissionAction, PermissionAction[]> = {
  view: ['view'],
  post: ['view', 'post'],
  comment: ['view', 'comment'],
  edit: ['view', 'post', 'comment', 'edit'],
  manage: ['view', 'post', 'comment', 'edit', 'manage'],
  admin: ['view', 'post', 'comment', 'edit', 'manage', 'admin'],
}

const DEFAULT_OPEN_ACTIONS: Record<ResourceType, PermissionAction[]> = {
  channel: ['view', 'post', 'comment'],
  board: ['view', 'post', 'comment', 'edit'],
  folder: ['view', 'post', 'comment', 'edit'],
  doc: ['view', 'post', 'comment', 'edit'],
  voice_room: ['view', 'post'],
  settings: ['view'],
  member_list: ['view'],
  integration: ['view'],
  announcement: ['view', 'post'],
}

export interface ResolvedPermission {
  actions: PermissionAction[]
  teamIds: string[]
  restricted: boolean
}

function sortActions(actions: PermissionAction[]) {
  return [...new Set(actions)].sort((a, b) => ACTION_ORDER.indexOf(a) - ACTION_ORDER.indexOf(b))
}

function expandActions(actions: PermissionAction[]) {
  return sortActions(actions.flatMap((action) => IMPLIED_ACTIONS[action]))
}

export function hasExplicitPermissionConfig(teams: Team[], resourceId: string, resourceType: ResourceType) {
  return teams.some((team) =>
    team.permissions.some((permission) => permission.resourceId === resourceId && permission.resourceType === resourceType),
  )
}

export function resolveMemberPermission(teams: Team[], memberId: string, resourceId: string, resourceType: ResourceType): ResolvedPermission {
  const restricted = hasExplicitPermissionConfig(teams, resourceId, resourceType)
  const matchingTeams = teams.filter((team) => team.memberIds.includes(memberId))
  const teamPermissions = matchingTeams.flatMap((team) =>
    team.permissions
      .filter((permission) => permission.resourceId === resourceId && permission.resourceType === resourceType)
      .map((permission) => ({ teamId: team.id, actions: permission.actions })),
  )

  if (!restricted) {
    return {
      actions: sortActions(DEFAULT_OPEN_ACTIONS[resourceType]),
      teamIds: matchingTeams.map((team) => team.id),
      restricted: false,
    }
  }

  return {
    actions: sortActions(teamPermissions.flatMap((permission) => expandActions(permission.actions))),
    teamIds: [...new Set(teamPermissions.map((permission) => permission.teamId))],
    restricted: true,
  }
}

export function hasPermissionAction(actions: PermissionAction[], action: PermissionAction) {
  return actions.includes(action)
}
