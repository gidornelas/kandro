  import { create } from 'zustand'
  import type { MainMode } from '../types'

  type Modal = 'taskDetail' | 'createTask' | 'addColumn' | null

  interface UIState {
    mainMode:          MainMode
    activeProjectId:   string | null
    activeChannelId:   string | null
    activeDmId:        string | null
    threadOpen:        boolean
    threadCardId:      string | null
    collapsedSections: Set<string>
    projectView:       'board' | 'files' | 'timeline'
    activeModal:       Modal
    activeCardId:      string | null

    openProject:    (id: string) => void
    openChannel:    (id: string) => void
    openDm:         (id: string) => void
    openVoice:      () => void
    openThread:     (cardId: string | null) => void
    closeThread:    () => void
    toggleSection:  (id: string) => void
    setProjectView: (v: 'board' | 'files' | 'timeline') => void
    openModal:      (m: Modal, cardId?: string) => void
    closeModal:     () => void
  }

  export const useUIStore = create<UIState>((set) => ({
    mainMode:          'project',
    activeProjectId:   'sprint12',
    activeChannelId:   null,
    activeDmId:        null,
    threadOpen:        false,
    threadCardId:      null,
    collapsedSections: new Set(),
    projectView:       'board',
    activeModal:       null,
    activeCardId:      null,

    openProject: (id) => set({ mainMode:'project', activeProjectId:id, threadOpen:false, threadCardId:null }),
    openChannel: (id) => set({ mainMode:'channel', activeChannelId:id, threadOpen:false }),
    openDm:      (id) => set({ mainMode:'dm',      activeDmId:id,      threadOpen:false }),
    openVoice:   () => set({ mainMode:'voice', threadOpen:false }),
    openThread:  (cardId) => set({ threadOpen:true,  threadCardId:cardId }),
    closeThread: ()       => set({ threadOpen:false, threadCardId:null  }),
    toggleSection: (id) => set((s) => {
      const n = new Set(s.collapsedSections)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return { collapsedSections: n }
    }),
    setProjectView: (v) => set({ projectView:v }),
    openModal:  (m, cardId) => set({ activeModal:m, activeCardId:cardId??null }),
    closeModal: ()          => set({ activeModal:null, activeCardId:null }),
  }))
