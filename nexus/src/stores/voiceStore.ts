import { create } from 'zustand'
import type { VoiceLayout } from '../types'
import * as voiceApi from '../api/voice'
import { useToastStore } from './toastStore'

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
  chatOpen: boolean
  activeSpeakerId: string

  // LiveKit connection data
  token: string | null
  room: string | null
  url: string | null
  connectionState: ConnectionState
  error: string | null

  // Participants from socket events + LiveKit
  participants: VoiceParticipant[]

  // Actions
  setLayout: (l: VoiceLayout) => void
  toggleMic: () => void
  toggleCamera: () => void
  toggleChat: () => void
  setActiveSpeaker: (id: string) => void
  setParticipants: (participants: VoiceParticipant[]) => void
  updateParticipant: (userId: string, updates: Partial<VoiceParticipant>) => void

  connect: (channelId: string) => Promise<void>
  disconnect: () => void
}

export const useVoiceStore = create<VoiceState>((set, get) => ({
  active: false,
  layout: 'voice',
  micEnabled: true,
  cameraEnabled: false,
  chatOpen: false,
  activeSpeakerId: '',

  token: null,
  room: null,
  url: null,
  connectionState: 'idle',
  error: null,

  participants: [],

  setLayout: (l) => set({ layout: l }),
  toggleMic: () => set((s) => ({ micEnabled: !s.micEnabled })),
  toggleCamera: () => set((s) => ({ cameraEnabled: !s.cameraEnabled })),
  toggleChat: () => set((s) => ({ chatOpen: !s.chatOpen })),
  setActiveSpeaker: (id) => set({ activeSpeakerId: id }),

  setParticipants: (participants) => set({ participants }),
  updateParticipant: (userId, updates) => set((s) => ({
    participants: s.participants.map(p =>
      p.userId === userId ? { ...p, ...updates } : p
    ),
  })),

  connect: async (channelId: string) => {
    set({ connectionState: 'connecting', error: null })
    try {
      // Call join endpoint
      await voiceApi.joinVoice(channelId)

      // Get token
      const res = await voiceApi.getVoiceToken(channelId)
      set({
        active: true,
        token: res.token,
        room: res.room,
        url: res.url,
        connectionState: 'connected',
        error: null,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao conectar'
      set({
        active: false,
        connectionState: 'error',
        error: message,
        token: null,
        room: null,
        url: null,
      })
      useToastStore.getState().add('error', message)
    }
  },

  disconnect: () => {
    const { token, room } = get()
    if (token && room) {
      const channelId = room.replace('channel-', '')
      voiceApi.leaveVoice(channelId).catch(() => {})
    }
    set({
      active: false,
      token: null,
      room: null,
      url: null,
      connectionState: 'idle',
      error: null,
      participants: [],
      activeSpeakerId: '',
    })
  },
}))
