import { create } from 'zustand'
import type { Message } from '../../shared/types/domain'
import { DMS } from '../../shared/mocks'
import { useAuthStore } from '../auth/store'
import * as DmsApi from './api'

interface DmState {
  conversations: Record<string, Message[]>
  isLoading: boolean
  pendingRoomId: string | null
  error: string | null
  loadMessages: (dmId: string) => Promise<void>
  sendDm: (dmId: string, text: string) => Promise<boolean>
  getMessages: (dmId: string) => Message[]
  clearError: () => void
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
  conversations: {},
  isLoading: false,
  pendingRoomId: null,
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
      if (useAuthStore.getState().isMockMode) {
        const mockConversation = DMS.find((dm) => dm.id === dmId)?.messages ?? []
        set({
          conversations: {
            ...get().conversations,
            [dmId]: mockConversation,
          },
          isLoading: false,
        })
        return
      }
      set({ error: message, isLoading: false })
    }
  },

  sendDm: async (dmId, text) => {
    set({ pendingRoomId: dmId, error: null })
    try {
      const created = await DmsApi.createMessage(dmId, text)
      set({
        conversations: {
          ...get().conversations,
          [dmId]: [...(get().conversations[dmId] || []), toMessage(created)],
        },
        pendingRoomId: null,
      })
      return true
    } catch (err) {
      if (!useAuthStore.getState().isMockMode) {
        const message = err instanceof Error ? err.message : 'Erro ao enviar mensagem direta'
        set({ error: message, pendingRoomId: null })
        return false
      }
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
        pendingRoomId: null,
      })
      return true
    }
  },

  getMessages(dmId) {
    return get().conversations[dmId] || []
  },

  clearError: () => set({ error: null }),
}))
