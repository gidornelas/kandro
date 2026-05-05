import { describe, it, expect, beforeEach } from 'vitest'
import { useUIStore } from './uiStore'

beforeEach(() => {
  useUIStore.setState({
    mainMode: 'project',
    activeProjectId: 'sprint12',
    activeChannelId: null,
    activeDmId: null,
    threadOpen: false,
    threadCardId: null,
    collapsedSections: new Set(),
    projectView: 'board',
    activeModal: null,
    activeCardId: null,
  })
})

describe('uiStore', () => {
  it('should initialize with default state', () => {
    const state = useUIStore.getState()
    expect(state.mainMode).toBe('project')
    expect(state.activeProjectId).toBe('sprint12')
    expect(state.activeModal).toBeNull()
    expect(state.threadOpen).toBe(false)
  })

  it('should open project', () => {
    useUIStore.getState().openProject('proj-2')
    const state = useUIStore.getState()
    expect(state.mainMode).toBe('project')
    expect(state.activeProjectId).toBe('proj-2')
    expect(state.threadOpen).toBe(false)
  })

  it('should open channel', () => {
    useUIStore.getState().openChannel('chan-1')
    const state = useUIStore.getState()
    expect(state.mainMode).toBe('channel')
    expect(state.activeChannelId).toBe('chan-1')
  })

  it('should open DM', () => {
    useUIStore.getState().openDm('dm-1')
    const state = useUIStore.getState()
    expect(state.mainMode).toBe('dm')
    expect(state.activeDmId).toBe('dm-1')
  })

  it('should open voice', () => {
    useUIStore.getState().openVoice()
    expect(useUIStore.getState().mainMode).toBe('voice')
  })

  it('should toggle section', () => {
    useUIStore.getState().toggleSection('proj')
    expect(useUIStore.getState().collapsedSections.has('proj')).toBe(true)
    useUIStore.getState().toggleSection('proj')
    expect(useUIStore.getState().collapsedSections.has('proj')).toBe(false)
  })

  it('should open and close thread', () => {
    useUIStore.getState().openThread('card-1')
    expect(useUIStore.getState().threadOpen).toBe(true)
    expect(useUIStore.getState().threadCardId).toBe('card-1')
    useUIStore.getState().closeThread()
    expect(useUIStore.getState().threadOpen).toBe(false)
    expect(useUIStore.getState().threadCardId).toBeNull()
  })

  it('should open and close modal', () => {
    useUIStore.getState().openModal('taskDetail', 'card-1')
    expect(useUIStore.getState().activeModal).toBe('taskDetail')
    expect(useUIStore.getState().activeCardId).toBe('card-1')
    useUIStore.getState().closeModal()
    expect(useUIStore.getState().activeModal).toBeNull()
    expect(useUIStore.getState().activeCardId).toBeNull()
  })

  it('should set project view', () => {
    useUIStore.getState().setProjectView('files')
    expect(useUIStore.getState().projectView).toBe('files')
  })
})
