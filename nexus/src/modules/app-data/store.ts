import { create } from 'zustand'
import * as ChannelsApi from '../channels/api'
import * as DmsApi from '../dms/api'
import * as ProjectsApi from '../projects/api'
import * as TeamsApi from '../teams/api'
import * as WorkspacesApi from '../workspaces/api'
import { useAuthStore } from '../auth/store'
import { useUIStore } from '../ui/store'
import type { Channel, DirectMessage, Project, Team, User, Workspace } from '../../shared/types/domain'
import { CHANNELS, DMS, PROJECTS, TEAMS, USERS } from '../../shared/mocks'

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
  channels: Channel[]
  projects: Project[]
  teams: Team[]
  users: Record<string, User>
  dms: DirectMessage[]
  isLoading: boolean
  error: string | null
  initialize: () => Promise<void>
  setActiveWorkspace: (workspaceId: string) => Promise<void>
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

export const useAppDataStore = create<AppDataState>((set, get) => ({
  workspaces: [],
  activeWorkspaceId: null,
  channels: CHANNELS,
  projects: PROJECTS,
  teams: TEAMS,
  users: USERS,
  dms: DMS.map((dm) => ({ ...dm, messages: [] })),
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
        members.map((member) => [
          member.userId,
          {
            id: member.userId,
            name: member.name,
            initials: member.initials,
            color: member.color,
            role: member.role,
            status: member.status as User['status'],
          },
        ]),
      )
      const mappedChannels = channels.map((channel) => toChannel(channel as ChannelResponse))
      const mappedDms = dms.map((dm) => toDm(dm, useAuthStore.getState().user?.id ?? ''))
      set({
        channels: mappedChannels,
        projects: projects.map((project) => toProject(project as ProjectResponse)),
        teams: teams.map(toTeam),
        users: { ...USERS, ...users },
        dms: mappedDms,
        isLoading: false,
      })
      syncInitialSelection(mappedChannels, mappedDms)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar dados do workspace'
      set({ error: message, isLoading: false })
    }
  },
}))
