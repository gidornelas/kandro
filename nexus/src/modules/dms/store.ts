import { create } from 'zustand'
import type { Message } from '../../shared/types/domain'
import { DMS } from '../../shared/mocks'
import { useAuthStore } from '../auth/store'
import * as DmsApi from './api'

interface DmState {
  conversations: Record<string, Message[]>
  isLoading: boolean
  error: string | null
  loadMessages: (dmId: string) => Promise<void>
  sendDm: (dmId: string, text: string) => Promise<void>
  getMessages: (dmId: string) => Message[]
}

let dmMsgId = 300

function toMessage(message: DmsApi.DmMessage): Message {
  return {
    id: message.id,
    channel: message.roomId,
    user: message.user?.name ?? message.userId,
    userId: message.userId,
    time: new Date(message.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    createdAt: message.createdAt,
    text: message.text,
    reactions: [],
  }
}

export const useDmStore = create<DmState>((set, get) => ({
  conversations: Object.fromEntries(DMS.map((d) => [d.id, d.messages])),
  isLoading: false,
  error: null,

  loadMessages: async (dmId) => {
    set({ isLoading: true, error: null })
    try {
      const response = await DmsApi.listMessages(dmId)
      set({
        conversations: {
          ...get().conversations,
          [dmId]: response.data.map(toMessage).reverse(),
        },
        isLoading: false,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar conversa'
      set({ error: message, isLoading: false })
    }
  },

  sendDm: async (dmId, text) => {
    try {
      const created = await DmsApi.createMessage(dmId, text)
      set({
        conversations: {
          ...get().conversations,
          [dmId]: [...(get().conversations[dmId] || []), toMessage(created)],
        },
      })
    } catch {
      const msg: Message = {
        id: `dm-${++dmMsgId}`,
        channel: dmId,
        user: 'me',
        userId: useAuthStore.getState().user?.id ?? 'me',
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        createdAt: new Date().toISOString(),
        text,
        reactions: [],
      }
      set({
        conversations: {
          ...get().conversations,
          [dmId]: [...(get().conversations[dmId] || []), msg],
        },
      })
    }
  },

  getMessages(dmId) {
    return get().conversations[dmId] || []
  },
}))
