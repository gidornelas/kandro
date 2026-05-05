import { create } from 'zustand'
import type { Team, PermissionLevel, ResourceType } from '../types'
import { TEAMS as INIT_TEAMS } from '../data/mock'

// Cores disponíveis para o color picker
export const TEAM_COLORS = [
  '#7c6af7', '#f97316', '#4ade80', '#f87171',
  '#fbbf24', '#60a5fa', '#f472b6', '#34d399',
]

interface TeamsState {
  teams:              Team[]
  selectedTeamId:     string | null
  settingsOpen:       boolean
  permModalResource:  { id: string; name: string; type: ResourceType } | null

  // Selectors
  getUserTeams:       (userId: string) => Team[]
  resolvePermission:  (userId: string, resourceId: string) => PermissionLevel
  getResourceTeams:   (resourceId: string) => Team[]

  // Mutations
  selectTeam:         (id: string | null) => void
  openSettings:       () => void
  closeSettings:      () => void
  openPermModal:      (resource: { id: string; name: string; type: ResourceType }) => void
  closePermModal:     () => void
  createTeam:         (name: string, color: string) => void
  deleteTeam:         (id: string) => void
  renameTeam:         (id: string, name: string) => void
  setTeamColor:       (id: string, color: string) => void
  addMember:          (teamId: string, userId: string) => void
  removeMember:       (teamId: string, userId: string) => void
  setPermission:      (teamId: string, resourceId: string, resourceType: ResourceType, level: PermissionLevel) => void
}

const LEVEL_ORDER: Record<PermissionLevel, number> = { none: 0, view: 1, edit: 2 }

let nextTeamId = 10

export const useTeamsStore = create<TeamsState>((set, get) => ({
  teams:             [...INIT_TEAMS],
  selectedTeamId:    null,
  settingsOpen:      false,
  permModalResource: null,

  getUserTeams: (userId) =>
    get().teams.filter(t => t.memberIds.includes(userId)),

  resolvePermission: (userId, resourceId) => {
    const userTeams = get().getUserTeams(userId)
    let best: PermissionLevel = 'none'
    for (const team of userTeams) {
      const perm = team.permissions.find(p => p.resourceId === resourceId)
      if (perm && LEVEL_ORDER[perm.level] > LEVEL_ORDER[best]) {
        best = perm.level
      }
    }
    return best
  },

  getResourceTeams: (resourceId) =>
    get().teams.filter(t =>
      t.permissions.some(p => p.resourceId === resourceId && p.level !== 'none')
    ),

  selectTeam:    (id) => set({ selectedTeamId: id }),
  openSettings:  ()  => set({ settingsOpen: true }),
  closeSettings: ()  => set({ settingsOpen: false }),
  openPermModal:  (resource) => set({ permModalResource: resource }),
  closePermModal: ()         => set({ permModalResource: null }),

  createTeam: (name, color) => set(s => ({
    teams: [...s.teams, {
      id: 'team' + nextTeamId++,
      name, color,
      memberIds: [],
      permissions: [],
    }],
  })),

  deleteTeam: (id) => set(s => ({
    teams: s.teams.filter(t => t.id !== id),
    selectedTeamId: s.selectedTeamId === id ? null : s.selectedTeamId,
  })),

  renameTeam: (id, name) => set(s => ({
    teams: s.teams.map(t => t.id === id ? { ...t, name } : t),
  })),

  setTeamColor: (id, color) => set(s => ({
    teams: s.teams.map(t => t.id === id ? { ...t, color } : t),
  })),

  addMember: (teamId, userId) => set(s => ({
    teams: s.teams.map(t =>
      t.id === teamId && !t.memberIds.includes(userId)
        ? { ...t, memberIds: [...t.memberIds, userId] }
        : t
    ),
  })),

  removeMember: (teamId, userId) => set(s => ({
    teams: s.teams.map(t =>
      t.id === teamId
        ? { ...t, memberIds: t.memberIds.filter(id => id !== userId) }
        : t
    ),
  })),

  setPermission: (teamId, resourceId, resourceType, level) => set(s => ({
    teams: s.teams.map(t => {
      if (t.id !== teamId) return t
      const exists = t.permissions.find(p => p.resourceId === resourceId)
      const permissions = exists
        ? t.permissions.map(p =>
            p.resourceId === resourceId ? { ...p, level } : p
          )
        : [...t.permissions, { resourceId, resourceType, level }]
      return { ...t, permissions }
    }),
  })),
}))