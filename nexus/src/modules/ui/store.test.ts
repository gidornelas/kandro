import { describe, it, expect } from 'vitest'
import { useUIStore } from './store'

describe('ui store', () => {
  it('opens project', () => {
    useUIStore.getState().openProject('p1')
    const state = useUIStore.getState()
    expect(state.mainMode).toBe('project')
    expect(state.activeProjectId).toBe('p1')
  })

  it('opens channel', () => {
    useUIStore.getState().openChannel('ch1')
    const state = useUIStore.getState()
    expect(state.mainMode).toBe('channel')
    expect(state.activeChannelId).toBe('ch1')
  })

  it('toggles sections', () => {
    useUIStore.getState().toggleSection('test')
    expect(useUIStore.getState().collapsedSections.has('test')).toBe(true)
    useUIStore.getState().toggleSection('test')
    expect(useUIStore.getState().collapsedSections.has('test')).toBe(false)
  })
})
