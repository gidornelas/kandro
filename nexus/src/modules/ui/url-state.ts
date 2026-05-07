import type { MainMode } from '../../shared/types/domain'
import type { ProjectView, UISnapshot } from './store'

const projectViews = new Set<ProjectView>(['board', 'timeline', 'list', 'files'])
const mainModes = new Set<MainMode>(['project', 'channel', 'dm', 'voice'])

function parseProjectView(value: string | null): ProjectView | undefined {
  if (!value || !projectViews.has(value as ProjectView)) return undefined
  return value as ProjectView
}

function parseMainMode(value: string | null): MainMode | undefined {
  if (!value || !mainModes.has(value as MainMode)) return undefined
  return value as MainMode
}

export function readUiStateFromUrl(): Partial<UISnapshot> {
  const params = new URLSearchParams(window.location.search)
  const mainMode = parseMainMode(params.get('mode'))
  const projectView = parseProjectView(params.get('view'))
  const project = params.get('project')
  const channel = params.get('channel')
  const dm = params.get('dm')

  return {
    mainMode,
    projectView,
    activeProjectId: project || undefined,
    activeChannelId: channel || undefined,
    activeDmId: dm || undefined,
  }
}

export function writeUiStateToUrl(state: UISnapshot) {
  const params = new URLSearchParams(window.location.search)
  params.set('mode', state.mainMode)

  if (state.mainMode === 'project' && state.activeProjectId) params.set('project', state.activeProjectId)
  else params.delete('project')

  if ((state.mainMode === 'channel' || state.mainMode === 'voice') && state.activeChannelId) params.set('channel', state.activeChannelId)
  else params.delete('channel')

  if (state.mainMode === 'dm' && state.activeDmId) params.set('dm', state.activeDmId)
  else params.delete('dm')

  if (state.mainMode === 'project') params.set('view', state.projectView)
  else params.delete('view')

  const query = params.toString()
  const nextUrl = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`
  window.history.replaceState({}, '', nextUrl)
}
