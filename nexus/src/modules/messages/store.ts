import { create } from 'zustand'
import type { Message } from '../../shared/types/domain'
import { MESSAGES } from '../../shared/mocks'

interface MessagesState {
  messages: Message[]
  sendMessage: (channelId: string, text: string) => void
  addReaction: (messageId: string, emoji: string) => void
  getChannelMessages: (channelId: string) => Message[]
}

let msgIdCounter = 1000

export const useMessagesStore = create<MessagesState>((set, get) => ({
  messages: [...MESSAGES],

  sendMessage(channelId, text) {
    const msg: Message = {
      id: String(++msgIdCounter),
      channel: channelId,
      user: 'me',
      userId: 'me',
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      createdAt: new Date().toISOString(),
      text,
      reactions: [],
    }
    set({ messages: [...get().messages, msg] })
  },

  addReaction(messageId, emoji) {
    set({
      messages: get().messages.map((m) => {
        if (m.id !== messageId) return m
        const existing = m.reactions.find((r) => r.emoji === emoji)
        if (existing) {
          return {
            ...m,
            reactions: m.reactions.map((r) =>
              r.emoji === emoji ? { ...r, count: r.count + 1, me: true } : r
            ),
          }
        }
        return { ...m, reactions: [...m.reactions, { emoji, count: 1, me: true }] }
      }),
    })
  },

  getChannelMessages(channelId) {
    return get().messages.filter((m) => m.channel === channelId)
  },
}))
