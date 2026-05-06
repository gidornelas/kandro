import { create } from 'zustand'
import type { VoiceLayout, Message } from '../../shared/types/domain'

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
  screenSharerId: string | null
  connectionState: ConnectionState
  error: string | null
  token: string | null
  room: string | null
  url: string | null
  participants: VoiceParticipant[]
  roomMessages: Message[]
  callDuration: number

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
  setScreenSharer: (id: string | null) => void
  setParticipants: (participants: VoiceParticipant[]) => void
  updateParticipant: (userId: string, updates: Partial<VoiceParticipant>) => void
  sendRoomMessage: (text: string) => void
  tickTimer: () => void
}

const defaultParticipants: VoiceParticipant[] = [
  { userId: 'rc', muted: false, cameraOn: false, sharing: false },
  { userId: 'al', muted: false, cameraOn: true, sharing: true },
  { userId: 'cm', muted: true, cameraOn: false, sharing: false },
  { userId: 'jl', muted: true, cameraOn: false, sharing: false },
  { userId: 'ms', muted: false, cameraOn: false, sharing: false },
]

const defaultSpeakerId = 'rc'

const initialMessages: Message[] = [
  { id: 'v1', channel: 'standup', user: 'rc', userId: 'rc', time: '09:05', createdAt: '2025-05-04T09:05:00Z', text: 'Bom dia, time!', reactions: [] },
  { id: 'v2', channel: 'standup', user: 'al', userId: 'al', time: '09:06', createdAt: '2025-05-04T09:06:00Z', text: 'Vou compartilhar a tela do Figma.', reactions: [] },
  { id: 'v3', channel: 'standup', user: 'jl', userId: 'jl', time: '09:07', createdAt: '2025-05-04T09:07:00Z', text: 'DataTable tá quase pronto.', reactions: [{ emoji: '👍', count: 2, me: false }] },
]

let msgId = 4

export const useVoiceStore = create<VoiceState>((set, get) => ({
  active: false,
  layout: 'voice',
  micEnabled: true,
  cameraEnabled: false,
  screenEnabled: false,
  chatOpen: false,
  activeSpeakerId: defaultSpeakerId,
  screenSharerId: 'al',
  connectionState: 'idle',
  error: null,
  token: null,
  room: null,
  url: null,
  participants: defaultParticipants,
  roomMessages: initialMessages,
  callDuration: 0,

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
      screenSharerId: null,
      participants: defaultParticipants,
      roomMessages: initialMessages,
      callDuration: 0,
    })
  },

  connect: async (channelId) => {
    set({ connectionState: 'connecting', error: null })
    set({
      active: true,
      layout: 'voice',
      connectionState: 'connected',
      token: 'mock-token',
      room: channelId,
      url: 'mock://voice',
      participants: get().participants.length > 0 ? get().participants : defaultParticipants,
      activeSpeakerId: get().activeSpeakerId || defaultSpeakerId,
      screenSharerId: get().screenSharerId || 'al',
      callDuration: 0,
    })
  },

  disconnect: () => get().leaveRoom(),
  setLayout: (layout) => set({ layout }),
  toggleMic: () => set((state) => ({ micEnabled: !state.micEnabled })),
  toggleCamera: () => set((state) => ({ cameraEnabled: !state.cameraEnabled })),
  toggleScreen: () => {
    const next = !get().screenEnabled
    set({ screenEnabled: next, layout: next ? 'screen' : 'voice' })
    if (next) {
      // Simulate: when local user shares screen, set them as sharer
      // For demo, cycle between sharers or set to 'al' if not set
      const sharer = get().screenSharerId || 'al'
      set({ screenSharerId: sharer })
    } else {
      set({ screenSharerId: null })
    }
  },
  toggleChat: () => set((state) => ({ chatOpen: !state.chatOpen })),
  setActiveSpeaker: (id) => set({ activeSpeakerId: id }),
  setScreenSharer: (id) => set({ screenSharerId: id }),
  setParticipants: (participants) => set({ participants }),
  updateParticipant: (userId, updates) =>
    set((state) => ({
      participants: state.participants.map((p) => (p.userId === userId ? { ...p, ...updates } : p)),
    })),
  sendRoomMessage: (text) => {
    const msg: Message = {
      id: `v${++msgId}`,
      channel: get().room || 'standup',
      user: 'me',
      userId: 'me',
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      createdAt: new Date().toISOString(),
      text,
      reactions: [],
    }
    set({ roomMessages: [...get().roomMessages, msg] })
  },
  tickTimer: () => set((state) => ({ callDuration: state.callDuration + 1 })),
}))
