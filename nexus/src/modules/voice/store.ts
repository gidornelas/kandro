import { create } from 'zustand'
import type { VoiceLayout, Message } from '../../shared/types/domain'
import { useAuthStore } from '../auth/store'
import { useSettingsStore } from '../settings/store'
import { getVoiceSession, getVoiceToken, leaveVoice as leaveVoiceApi, updateParticipant as updateVoiceParticipantApi } from './api'

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
  channelId: string | null
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

let msgId = 4

function resetVoiceState() {
  const voiceVideo = useSettingsStore.getState().voiceVideo
  return {
    active: false,
    layout: voiceVideo.preferredVoiceLayout as VoiceLayout,
    micEnabled: !voiceVideo.autoMuteOnJoin,
    cameraEnabled: !voiceVideo.autoCameraOffOnJoin,
    screenEnabled: false,
    chatOpen: false,
    activeSpeakerId: '',
    screenSharerId: null,
    connectionState: 'idle' as ConnectionState,
    error: null,
    token: null,
    channelId: null,
    room: null,
    url: null,
    participants: [] as VoiceParticipant[],
    roomMessages: [] as Message[],
    callDuration: 0,
  }
}

function deriveParticipantState(participants: VoiceParticipant[], currentSpeakerId: string, currentSharerId: string | null) {
  const activeSpeakerId = participants.some((participant) => participant.userId === currentSpeakerId)
    ? currentSpeakerId
    : participants[0]?.userId ?? ''
  const screenSharerId = participants.some((participant) => participant.userId === currentSharerId && participant.sharing)
    ? currentSharerId
    : participants.find((participant) => participant.sharing)?.userId ?? null

  return { activeSpeakerId, screenSharerId }
}

export const useVoiceStore = create<VoiceState>((set, get) => ({
  ...resetVoiceState(),

  joinRoom: (channelId = 'standup') => {
    void get().connect(channelId)
  },

  leaveRoom: async () => {
    const channelId = get().channelId
    if (channelId) {
      try {
        await leaveVoiceApi(channelId)
      } catch {
        // Best-effort cleanup; local state should still reset.
      }
    }
    set(resetVoiceState())
  },

  connect: async (channelId) => {
    set({ connectionState: 'connecting', error: null })
    try {
      const [tokenData, session] = await Promise.all([
        getVoiceToken(channelId),
        getVoiceSession(channelId),
      ])
      const participants = session.participants.map((participant) => ({
        userId: participant.userId,
        muted: participant.muted,
        cameraOn: participant.cameraOn,
        sharing: participant.sharing,
      }))
      const { activeSpeakerId, screenSharerId } = deriveParticipantState(participants, get().activeSpeakerId, get().screenSharerId)
      set({
        active: true,
        layout: screenSharerId ? 'screen' : 'voice',
        connectionState: 'connected',
        token: tokenData.token,
        channelId,
        room: tokenData.room,
        url: tokenData.url,
        participants,
        activeSpeakerId,
        screenSharerId,
        screenEnabled: Boolean(screenSharerId && screenSharerId === useAuthStore.getState().user?.id),
        callDuration: 0,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao conectar à sala de voz'
      set({ ...resetVoiceState(), connectionState: 'error', error: message })
    }
  },

  disconnect: () => get().leaveRoom(),
  setLayout: (layout) => set({ layout }),
  toggleMic: () => {
    const state = get()
    const userId = useAuthStore.getState().user?.id
    const next = !state.micEnabled
    set({ micEnabled: next })
    if (!state.channelId || !userId) return
    get().updateParticipant(userId, { muted: !next })
    void updateVoiceParticipantApi(state.channelId, { muted: !next })
  },
  toggleCamera: () => {
    const state = get()
    const userId = useAuthStore.getState().user?.id
    const next = !state.cameraEnabled
    set({ cameraEnabled: next })
    if (!state.channelId || !userId) return
    get().updateParticipant(userId, { cameraOn: next })
    void updateVoiceParticipantApi(state.channelId, { cameraOn: next })
  },
  toggleScreen: () => {
    const state = get()
    const userId = useAuthStore.getState().user?.id
    const next = !state.screenEnabled
    set({
      screenEnabled: next,
      layout: next ? 'screen' : state.layout === 'screen' ? 'voice' : state.layout,
      screenSharerId: next ? userId ?? state.screenSharerId : state.screenSharerId === userId ? null : state.screenSharerId,
    })
    if (!state.channelId || !userId) return
    get().updateParticipant(userId, { sharing: next })
    void updateVoiceParticipantApi(state.channelId, { sharing: next })
  },
  toggleChat: () => set((state) => ({ chatOpen: !state.chatOpen })),
  setActiveSpeaker: (id) => set({ activeSpeakerId: id }),
  setScreenSharer: (id) => set({ screenSharerId: id }),
  setParticipants: (participants) => {
    const { activeSpeakerId, screenSharerId } = deriveParticipantState(participants, get().activeSpeakerId, get().screenSharerId)
    set({
      participants,
      activeSpeakerId,
      screenSharerId,
      active: participants.length > 0 ? get().active : false,
      layout: get().layout === 'screen' && !screenSharerId ? 'voice' : get().layout,
    })
  },
  updateParticipant: (userId, updates) =>
    set((state) => ({
      participants: state.participants.some((participant) => participant.userId === userId)
        ? state.participants.map((participant) => (participant.userId === userId ? { ...participant, ...updates } : participant))
        : [...state.participants, { userId, muted: false, cameraOn: false, sharing: false, ...updates }],
      screenSharerId: updates.sharing === true ? userId : updates.sharing === false && state.screenSharerId === userId ? null : state.screenSharerId,
    })),
  sendRoomMessage: (text) => {
    const user = useAuthStore.getState().user
    const msg: Message = {
      id: `v${++msgId}`,
      channel: get().channelId || get().room || 'voice',
      user: user?.name || 'Você',
      userId: user?.id || 'me',
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      createdAt: new Date().toISOString(),
      text,
      reactions: [],
    }
    set({ roomMessages: [...get().roomMessages, msg] })
  },
  tickTimer: () => set((state) => ({ callDuration: state.callDuration + 1 })),
}))
