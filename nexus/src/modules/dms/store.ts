import { create } from 'zustand'
import type { Message } from '../../shared/types/domain'
import { DMS } from '../../shared/mocks'

interface DmState {
  conversations: Record<string, Message[]>
  sendDm: (dmId: string, text: string) => void
  getMessages: (dmId: string) => Message[]
}

let dmMsgId = 300

export const useDmStore = create<DmState>((set, get) => ({
  conversations: Object.fromEntries(DMS.map((d) => [d.id, d.messages])),

  sendDm(dmId, text) {
    const msg: Message = {
      id: `dm-${++dmMsgId}`,
      channel: dmId,
      user: 'me',
      userId: 'me',
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
  },

  getMessages(dmId) {
    return get().conversations[dmId] || []
  },
}))
