import { create } from 'zustand'
import type { VoiceLayout } from '../../shared/types/domain'

export type ConnectionState = 'idle' | 'connecting' | 'connected' | 'error'

export interface VoiceParticipant {
  userId: string
  muted: boolean
  cameraOn: boolean
  sharing: boolean
}

interface VoiceState {
  active: boolean
  layout: VoiceLayout
  micEnabled: boolean
  cameraEnabled: boolean
  screenEnabled: boolean
  chatOpen: boolean
  activeSpeakerId: string
  connectionState: ConnectionState
  error: string | null
  token: string | null
  room: string | null
  url: string | null
  participants: VoiceParticipant[]

  joinRoom: (channelId?: string) => void
  leaveRoom: () => void
  connect: (channelId: string) => Promise<void>
  disconnect: () => void
  setLayout: (l: VoiceLayout) => void
  toggleMic: () => void
  toggleCamera: () => void
  toggleScreen: () => void
  toggleChat: () => void
  setActiveSpeaker: (id: string) => void
  setParticipants: (participants: VoiceParticipant[]) => void
  updateParticipant: (userId: string, updates: Partial<VoiceParticipant>) => void
}

const defaultParticipants: VoiceParticipant[] = [
  { userId: 'rc', muted: false, cameraOn: false, sharing: false },
  { userId: 'al', muted: false, cameraOn: true, sharing: true },
  { userId: 'cm', muted: true, cameraOn: false, sharing: false },
  { userId: 'jl', muted: true, cameraOn: false, sharing: false },
  { userId: 'ms', muted: false, cameraOn: false, sharing: false },
]

const defaultSpeakerId = 'rc'

export const useVoiceStore = create<VoiceState>((set, get) => ({
  active: false,
  layout: 'voice',
  micEnabled: true,
  cameraEnabled: false,
  screenEnabled: false,
  chatOpen: false,
  activeSpeakerId: defaultSpeakerId,
  connectionState: 'idle',
  error: null,
  token: null,
  room: null,
  url: null,
  participants: defaultParticipants,

  joinRoom: (channelId = 'standup') => {
    void get().connect(channelId)
  },

  leaveRoom: () => {
    set({
      active: false,
      chatOpen: false,
      cameraEnabled: false,
      screenEnabled: false,
      connectionState: 'idle',
      error: null,
      token: null,
      room: null,
      url: null,
      activeSpeakerId: defaultSpeakerId,
      participants: defaultParticipants,
    })
  },

  connect: async (channelId) => {
    set({ connectionState: 'connecting', error: null })

    // Mock mode fallback
    set({
      active: true,
      layout: 'voice',
      connectionState: 'connected',
      token: 'mock-token',
      room: channelId,
      url: 'mock://voice',
      participants: get().participants.length > 0 ? get().participants : defaultParticipants,
      activeSpeakerId: get().activeSpeakerId || defaultSpeakerId,
    })
  },

  disconnect: () => get().leaveRoom(),
  setLayout: (layout) => set({ layout }),
  toggleMic: () => set((state) => ({ micEnabled: !state.micEnabled })),
  toggleCamera: () => set((state) => ({ cameraEnabled: !state.cameraEnabled })),
  toggleScreen: () => set((state) => ({ screenEnabled: !state.screenEnabled })),
  toggleChat: () => set((state) => ({ chatOpen: !state.chatOpen })),
  setActiveSpeaker: (id) => set({ activeSpeakerId: id }),
  setParticipants: (participants) => set({ participants }),
  updateParticipant: (userId, updates) =>
    set((state) => ({
      participants: state.participants.map((p) => (p.userId === userId ? { ...p, ...updates } : p)),
    })),
}))
