import { create } from 'zustand'
import * as ChannelsApi from '../channels/api'
import * as DmsApi from '../dms/api'
import * as ProjectsApi from '../projects/api'
import * as TeamsApi from '../teams/api'
import * as WorkspacesApi from '../workspaces/api'
import { useAuthStore } from '../auth/store'
import { useUIStore } from '../ui/store'
import type { Channel, DirectMessage, Project, Team, TeamPermission, User, Workspace } from '../../shared/types/domain'
import { CHANNELS, DMS, PROJECTS, TEAMS, USERS } from '../../shared/mocks'

const mockWorkspace: Workspace = {
  id: 'mock-workspace',
  name: 'NEXUS',
  initials: 'N',
  color: '#2f80ed',
}

interface ChannelResponse extends Omit<Channel, 'desc'> {
  desc?: string
  description?: string | null
}

interface ProjectResponse extends Omit<Project, 'channelId' | 'memberIds'> {
  members?: { userId: string; user?: User }[]
  _count?: { members: number }
}

interface AppDataState {
  workspaces: Workspace[]
  activeWorkspaceId: string | null
  workspaceMembers: WorkspacesApi.WorkspaceMember[]
  channels: Channel[]
  projects: Project[]
  teams: Team[]
  users: Record<string, User>
  dms: DirectMessage[]
  isLoading: boolean
  error: string | null
  initialize: () => Promise<void>
  setActiveWorkspace: (workspaceId: string) => Promise<void>
  createChannel: (data: { name: string; type: 'text' | 'board' | 'voice'; description?: string; private?: boolean }) => Promise<Channel | null>
  createProject: (data: { name: string; description?: string; private?: boolean }) => Promise<Channel | null>
  addWorkspaceMember: (data: { email: string; role: 'member' | 'admin' }) => Promise<WorkspacesApi.WorkspaceMember | null>
  removeWorkspaceMember: (userId: string) => Promise<void>
  createTeam: (data: { name: string; color: string }) => Promise<void>
  updateTeam: (teamId: string, updates: { name?: string; color?: string }) => Promise<void>
  removeTeam: (teamId: string) => Promise<void>
  updateTeamPermission: (teamId: string, permission: TeamPermission) => Promise<void>
}

function toChannel(channel: ChannelResponse): Channel {
  return {
    ...channel,
    desc: channel.description ?? channel.desc,
  }
}

function toProject(project: ProjectResponse): Project {
  return {
    id: project.id,
    name: project.name,
    channelId: project.id,
    status: project.status,
    dateRange: project.dateRange ?? '',
    memberIds: project.members?.map((member) => member.userId) ?? [],
  }
}

function toTeam(team: TeamsApi.TeamResponse): Team {
  return {
    id: team.id,
    name: team.name,
    color: team.color,
    memberIds: team.members?.map((member) => member.userId ?? member.user?.id).filter((id): id is string => Boolean(id)) ?? [],
    permissions: team.permissions ?? [],
  }
}

function toDm(room: DmsApi.DmRoom, currentUserId: string): DirectMessage {
  const otherUser = room.userAId === currentUserId ? room.userB : room.userA
  return {
    id: room.id,
    userId: otherUser.id,
    unread: room.unread ?? 0,
    messages: [],
  }
}

function toUser(member: WorkspacesApi.WorkspaceMember): User {
  return {
    id: member.userId,
    name: member.name,
    initials: member.initials,
    color: member.color,
    role: member.role,
    status: member.status as User['status'],
  }
}

function sortPermissionActions(actions: TeamPermission['actions']) {
  const order: Record<TeamPermission['actions'][number], number> = {
    view: 0,
    post: 1,
    comment: 2,
    edit: 3,
    manage: 4,
    admin: 5,
  }
  return [...new Set(actions)].sort((a, b) => order[a] - order[b])
}

function mergeTeamPermission(permissions: TeamPermission[], nextPermission: TeamPermission) {
  const normalizedPermission = {
    ...nextPermission,
    actions: sortPermissionActions(nextPermission.actions),
  }
  const filteredPermissions = permissions.filter((permission) =>
    !(permission.resourceId === normalizedPermission.resourceId && permission.resourceType === normalizedPermission.resourceType),
  )
  if (normalizedPermission.actions.length === 0) return filteredPermissions
  return [...filteredPermissions, normalizedPermission]
}

function syncInitialSelection(channels: Channel[], dms: DirectMessage[]) {
  const ui = useUIStore.getState()
  const boardChannels = channels.filter((channel) => channel.type === 'board')
  const textChannels = channels.filter((channel) => channel.type === 'text')

  if (ui.mainMode === 'project' && !channels.some((channel) => channel.id === ui.activeProjectId)) {
    useUIStore.setState({ activeProjectId: boardChannels[0]?.id ?? null })
  }
  if (ui.mainMode === 'channel' && !channels.some((channel) => channel.id === ui.activeChannelId)) {
    useUIStore.setState({ activeChannelId: textChannels[0]?.id ?? null })
  }
  if (ui.mainMode === 'dm' && !dms.some((dm) => dm.id === ui.activeDmId)) {
    useUIStore.setState({ activeDmId: dms[0]?.id ?? null })
  }
}

function createLocalTeam(data: { name: string; color: string }): Team {
  return {
    id: `team-${Date.now()}`,
    name: data.name,
    color: data.color,
    memberIds: [],
    permissions: [],
  }
}

function createLocalChannel(data: { name: string; type: 'text' | 'board' | 'voice'; description?: string; private?: boolean }): Channel {
  return {
    id: `channel-${Date.now()}`,
    name: data.name,
    type: data.type,
    icon: data.type === 'text' ? '#' : data.type === 'board' ? '⊞' : '🔊',
    private: data.private,
    desc: data.description,
  }
}

function toDerivedProject(channel: Channel): Project {
  return {
    id: channel.id,
    name: channel.name,
    channelId: channel.id,
    status: 'Em andamento',
    dateRange: '',
    memberIds: [],
  }
}

function normalizeProjects(projects: Project[], channels: Channel[]) {
  const projectIds = new Set(projects.map((project) => project.id))
  const derivedProjects = channels
    .filter((channel) => channel.type === 'board' && !projectIds.has(channel.id))
    .map((channel) => toDerivedProject(channel))
  return [...projects, ...derivedProjects]
}

function applyMockAppData() {
  const dms = DMS.map((dm) => ({ ...dm, messages: [] }))
  syncInitialSelection(CHANNELS, dms)
  return {
    workspaces: [mockWorkspace],
    activeWorkspaceId: mockWorkspace.id,
    workspaceMembers: [],
    channels: CHANNELS,
    projects: normalizeProjects(PROJECTS, CHANNELS),
    teams: TEAMS,
    users: USERS,
    dms,
    isLoading: false,
    error: null,
  }
}

function createLocalWorkspace(user: User | null): Workspace {
  const firstName = user?.name.trim().split(' ')[0] || 'Meu'
  return {
    id: `workspace-${Date.now()}`,
    name: `Workspace de ${firstName}`,
    initials: user?.initials || firstName.slice(0, 2).toUpperCase(),
    color: user?.color || '#2f80ed',
  }
}

export const useAppDataStore = create<AppDataState>((set, get) => ({
  workspaces: [],
  activeWorkspaceId: null,
  workspaceMembers: [],
  channels: [],
  projects: [],
  teams: [],
  users: {},
  dms: [],
  isLoading: false,
  error: null,

  initialize: async () => {
    if (get().isLoading) return
    set({ isLoading: true, error: null })
    try {
      const workspaces = await WorkspacesApi.list()
      const activeWorkspaceId = get().activeWorkspaceId ?? workspaces[0]?.id ?? null
      if (!activeWorkspaceId) {
        set({ workspaces, isLoading: false })
        return
      }
      set({ workspaces, activeWorkspaceId })
      await get().setActiveWorkspace(activeWorkspaceId)
    } catch (err) {
      if (useAuthStore.getState().isMockMode) {
        set(applyMockAppData())
        return
      }
      const message = err instanceof Error ? err.message : 'Erro ao carregar workspace'
      set({ error: message, isLoading: false })
    }
  },

  setActiveWorkspace: async (workspaceId) => {
    set({ isLoading: true, error: null, activeWorkspaceId: workspaceId })
    try {
      const [channels, members, projects, teams, dms] = await Promise.all([
        ChannelsApi.listByWorkspace(workspaceId),
        WorkspacesApi.listMembers(workspaceId),
        ProjectsApi.list(workspaceId),
        TeamsApi.list(workspaceId),
        DmsApi.listRooms(),
      ])
      const users = Object.fromEntries(
        members.map((member) => [member.userId, toUser(member)]),
      )
      for (const room of dms) {
        users[room.userA.id] = {
          id: room.userA.id,
          name: room.userA.name,
          initials: room.userA.initials,
          color: room.userA.color,
          role: users[room.userA.id]?.role ?? '',
          status: (room.userA.status as User['status']) ?? users[room.userA.id]?.status ?? 'offline',
        }
        users[room.userB.id] = {
          id: room.userB.id,
          name: room.userB.name,
          initials: room.userB.initials,
          color: room.userB.color,
          role: users[room.userB.id]?.role ?? '',
          status: (room.userB.status as User['status']) ?? users[room.userB.id]?.status ?? 'offline',
        }
      }
      const currentUser = useAuthStore.getState().user
      if (currentUser) {
        users[currentUser.id] = {
          id: currentUser.id,
          name: currentUser.name,
          initials: currentUser.initials,
          color: currentUser.color,
          role: currentUser.role,
          status: currentUser.status,
        }
      }
      const mappedChannels = channels.map((channel) => toChannel(channel as ChannelResponse))
      const mappedDms = dms.map((dm) => toDm(dm, useAuthStore.getState().user?.id ?? ''))
      const mappedProjects = normalizeProjects(
        projects.map((project) => toProject(project as ProjectResponse)),
        mappedChannels,
      )
      set({
        channels: mappedChannels,
        workspaceMembers: members,
        projects: mappedProjects,
        teams: teams.map(toTeam),
        users,
        dms: mappedDms,
        isLoading: false,
      })
      syncInitialSelection(mappedChannels, mappedDms)
    } catch (err) {
      if (useAuthStore.getState().isMockMode) {
        set(applyMockAppData())
        return
      }
      const message = err instanceof Error ? err.message : 'Erro ao carregar dados do workspace'
      set({ error: message, isLoading: false })
    }
  },

  createChannel: async (data) => {
    let workspaceId = get().activeWorkspaceId ?? get().workspaces[0]?.id ?? null
    if (!workspaceId) {
      const currentUser = useAuthStore.getState().user
      if (useAuthStore.getState().isMockMode) {
        const createdWorkspace = createLocalWorkspace(currentUser)
        set({
          workspaces: [...get().workspaces, createdWorkspace],
          activeWorkspaceId: createdWorkspace.id,
          workspaceMembers: [],
          error: null,
        })
        workspaceId = createdWorkspace.id
      } else {
        try {
          const firstName = currentUser?.name.trim().split(' ')[0] || 'Meu'
          const createdWorkspace = await WorkspacesApi.create({
            name: `Workspace de ${firstName}`,
            initials: currentUser?.initials || firstName.slice(0, 2).toUpperCase(),
            color: currentUser?.color || '#2f80ed',
          })
          set({
            workspaces: [...get().workspaces, createdWorkspace],
            activeWorkspaceId: createdWorkspace.id,
            workspaceMembers: [],
            error: null,
          })
          await get().setActiveWorkspace(createdWorkspace.id)
          workspaceId = createdWorkspace.id
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Erro ao criar workspace'
          set({ error: message })
          return null
        }
      }
    }
    if (!workspaceId) {
      set({ error: 'Nenhum workspace ativo para criar canal' })
      return null
    }

    if (useAuthStore.getState().isMockMode) {
      const createdChannel = createLocalChannel(data)
      set({
        activeWorkspaceId: workspaceId,
        channels: [...get().channels, createdChannel],
        projects: createdChannel.type === 'board' ? normalizeProjects(get().projects, [...get().channels, createdChannel]) : get().projects,
        error: null,
      })
      return createdChannel
    }

    try {
      const createdChannel = toChannel(await ChannelsApi.create(workspaceId, data) as ChannelResponse)
      set({
        activeWorkspaceId: workspaceId,
        channels: [...get().channels, createdChannel],
        projects: createdChannel.type === 'board' ? normalizeProjects(get().projects, [...get().channels, createdChannel]) : get().projects,
        error: null,
      })
      return createdChannel
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar canal'
      set({ error: message })
      return null
    }
  },

  createProject: async (data) =>
    get().createChannel({
      name: data.name,
      type: 'board',
      description: data.description ?? `Board do projeto ${data.name}`,
      private: data.private,
    }),

  addWorkspaceMember: async (data) => {
    const workspaceId = get().activeWorkspaceId ?? get().workspaces[0]?.id ?? null
    if (!workspaceId) {
      set({ error: 'Nenhum workspace ativo para adicionar membro' })
      return null
    }
    if (useAuthStore.getState().isMockMode) {
      set({ error: 'Convites no modo mock ainda não foram implementados' })
      return null
    }

    try {
      const member = await WorkspacesApi.addMember(workspaceId, data)
      set({
        workspaceMembers: [...get().workspaceMembers, member].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')),
        users: {
          ...get().users,
          [member.userId]: toUser(member),
        },
        error: null,
      })
      return member
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao adicionar membro'
      set({ error: message })
      return null
    }
  },

  removeWorkspaceMember: async (userId) => {
    const workspaceId = get().activeWorkspaceId ?? get().workspaces[0]?.id ?? null
    if (!workspaceId) {
      set({ error: 'Nenhum workspace ativo para remover membro' })
      return
    }
    if (useAuthStore.getState().isMockMode) {
      set({ error: 'Remoção de membros no modo mock ainda não foi implementada' })
      return
    }

    const previousMembers = get().workspaceMembers
    const previousTeams = get().teams
    set({
      workspaceMembers: previousMembers.filter((member) => member.userId !== userId),
      teams: previousTeams.map((team) => ({
        ...team,
        memberIds: team.memberIds.filter((memberId) => memberId !== userId),
      })),
      error: null,
    })

    try {
      await WorkspacesApi.removeMember(workspaceId, userId)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao remover membro'
      set({ workspaceMembers: previousMembers, teams: previousTeams, error: message })
    }
  },

  createTeam: async (data) => {
    const workspaceId = get().activeWorkspaceId ?? get().workspaces[0]?.id ?? null
    if (!workspaceId) {
      set({ error: 'Nenhum workspace ativo para criar equipe' })
      return
    }

    const previousTeams = get().teams
    const optimisticTeam = createLocalTeam(data)
    set({ teams: [...previousTeams, optimisticTeam], error: null })

    if (useAuthStore.getState().isMockMode) return

    try {
      const createdTeam = toTeam(await TeamsApi.create(workspaceId, data))
      set({ teams: [...previousTeams, createdTeam] })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar equipe'
      set({ teams: previousTeams, error: message })
    }
  },

  updateTeam: async (teamId, updates) => {
    const previousTeams = get().teams
    const nextTeams = previousTeams.map((team) => (team.id === teamId ? { ...team, ...updates } : team))
    set({ teams: nextTeams, error: null })

    if (useAuthStore.getState().isMockMode) return

    try {
      const updatedTeam = toTeam(await TeamsApi.update(teamId, updates))
      set({
        teams: previousTeams.map((team) => (team.id === teamId ? updatedTeam : team)),
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar equipe'
      set({ teams: previousTeams, error: message })
    }
  },

  removeTeam: async (teamId) => {
    const previousTeams = get().teams
    const nextTeams = previousTeams.filter((team) => team.id !== teamId)
    set({ teams: nextTeams, error: null })

    if (useAuthStore.getState().isMockMode) return

    try {
      await TeamsApi.remove(teamId)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao remover equipe'
      set({ teams: previousTeams, error: message })
    }
  },

  updateTeamPermission: async (teamId, permission) => {
    const previousTeams = get().teams
    const nextTeams = previousTeams.map((team) =>
      team.id === teamId
        ? {
            ...team,
            permissions: mergeTeamPermission(team.permissions, permission),
          }
        : team,
    )

    set({ teams: nextTeams, error: null })

    if (useAuthStore.getState().isMockMode) return

    try {
      await TeamsApi.setPermission(teamId, permission)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar permissões da equipe'
      set({ teams: previousTeams, error: message })
    }
  },
}))
