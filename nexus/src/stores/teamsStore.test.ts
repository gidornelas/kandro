import { describe, it, expect, beforeEach } from 'vitest'
import { useTeamsStore } from './teamsStore'

beforeEach(() => {
  useTeamsStore.setState({
    teams: [],
    selectedTeamId: null,
    settingsOpen: false,
    permModalResource: null,
  })
})

describe('teamsStore', () => {
  it('should initialize with empty state', () => {
    const state = useTeamsStore.getState()
    expect(state.teams).toEqual([])
    expect(state.selectedTeamId).toBeNull()
  })

  it('should create a team', () => {
    useTeamsStore.getState().createTeam('Design', '#7c6af7')
    const state = useTeamsStore.getState()
    expect(state.teams).toHaveLength(1)
    expect(state.teams[0].name).toBe('Design')
    expect(state.teams[0].color).toBe('#7c6af7')
    expect(state.teams[0].memberIds).toEqual([])
  })

  it('should delete a team', () => {
    useTeamsStore.getState().createTeam('Design', '#7c6af7')
    const teamId = useTeamsStore.getState().teams[0].id
    useTeamsStore.getState().deleteTeam(teamId)
    expect(useTeamsStore.getState().teams).toHaveLength(0)
  })

  it('should rename a team', () => {
    useTeamsStore.getState().createTeam('Design', '#7c6af7')
    const teamId = useTeamsStore.getState().teams[0].id
    useTeamsStore.getState().renameTeam(teamId, 'UX')
    expect(useTeamsStore.getState().teams[0].name).toBe('UX')
  })

  it('should add and remove member', () => {
    useTeamsStore.getState().createTeam('Design', '#7c6af7')
    const teamId = useTeamsStore.getState().teams[0].id
    useTeamsStore.getState().addMember(teamId, 'user-1')
    expect(useTeamsStore.getState().teams[0].memberIds).toContain('user-1')
    useTeamsStore.getState().removeMember(teamId, 'user-1')
    expect(useTeamsStore.getState().teams[0].memberIds).not.toContain('user-1')
  })

  it('should set permission', () => {
    useTeamsStore.getState().createTeam('Design', '#7c6af7')
    const teamId = useTeamsStore.getState().teams[0].id
    useTeamsStore.getState().setPermission(teamId, 'res-1', 'folder', 'edit')
    const perm = useTeamsStore.getState().teams[0].permissions[0]
    expect(perm.resourceId).toBe('res-1')
    expect(perm.level).toBe('edit')
  })

  it('should open and close settings', () => {
    useTeamsStore.getState().openSettings()
    expect(useTeamsStore.getState().settingsOpen).toBe(true)
    useTeamsStore.getState().closeSettings()
    expect(useTeamsStore.getState().settingsOpen).toBe(false)
  })

  it('should select team', () => {
    useTeamsStore.getState().selectTeam('team-1')
    expect(useTeamsStore.getState().selectedTeamId).toBe('team-1')
  })

  it('should resolve permission based on teams', () => {
    useTeamsStore.getState().createTeam('Design', '#7c6af7')
    const teamId = useTeamsStore.getState().teams[0].id
    useTeamsStore.getState().addMember(teamId, 'user-1')
    useTeamsStore.getState().setPermission(teamId, 'res-1', 'folder', 'view')
    const level = useTeamsStore.getState().resolvePermission('user-1', 'res-1')
    expect(level).toBe('view')
  })
})
