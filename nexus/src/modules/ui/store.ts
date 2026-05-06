import { create } from 'zustand'
import type { MainMode } from '../../shared/types/domain'

type Modal = 'taskDetail' | 'createTask' | 'addColumn' | null
type ProjectView = 'board' | 'timeline' | 'list' | 'files'

interface UIState {
  mainMode: MainMode
  activeProjectId: string | null
  activeChannelId: string | null
  activeDmId: string | null
  threadOpen: boolean
  threadCardId: string | null
  collapsedSections: Set<string>
  projectView: ProjectView
  activeModal: Modal
  activeCardId: string | null

  openProject: (id: string) => void
  openChannel: (id: string) => void
  openDm: (id: string) => void
  openVoice: (channelId?: string) => void
  openThread: (cardId: string | null) => void
  closeThread: () => void
  toggleSection: (id: string) => void
  setProjectView: (v: ProjectView) => void
  openModal: (m: Modal, cardId?: string) => void
  closeModal: () => void
}

export const useUIStore = create<UIState>((set) => ({
  mainMode: 'project',
  activeProjectId: 'sprint12',
  activeChannelId: 'geral',
  activeDmId: 'dm-al',
  threadOpen: false,
  threadCardId: null,
  collapsedSections: new Set(),
  projectView: 'board',
  activeModal: null,
  activeCardId: null,

  openProject: (id) =>
    set({ mainMode: 'project', activeProjectId: id, projectView: 'board', threadOpen: false, threadCardId: null }),
  openChannel: (id) =>
    set({ mainMode: 'channel', activeChannelId: id, threadOpen: false, threadCardId: null }),
  openDm: (id) =>
    set({ mainMode: 'dm', activeDmId: id, threadOpen: false, threadCardId: null }),
  openVoice: (channelId?: string) =>
    set({ mainMode: 'voice', activeChannelId: channelId ?? null, threadOpen: false, threadCardId: null }),
  openThread: (cardId) => set({ threadOpen: true, threadCardId: cardId }),
  closeThread: () => set({ threadOpen: false, threadCardId: null }),
  toggleSection: (id) =>
    set((state) => {
      const collapsedSections = new Set(state.collapsedSections)
      if (collapsedSections.has(id)) collapsedSections.delete(id)
      else collapsedSections.add(id)
      return { collapsedSections }
    }),
  setProjectView: (v) => set({ projectView: v }),
  openModal: (m, cardId) => set({ activeModal: m, activeCardId: cardId ?? null }),
  closeModal: () => set({ activeModal: null, activeCardId: null }),
}))
