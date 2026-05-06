import { create } from 'zustand'
import type { Message } from '../../shared/types/domain'
import { MESSAGES } from '../../shared/mocks'
import { useAuthStore } from '../auth/store'
import * as MessagesApi from './api'

interface MessagesState {
  messages: Message[]
  isLoading: boolean
  error: string | null
  loadChannel: (channelId: string) => Promise<void>
  sendMessage: (channelId: string, text: string) => Promise<void>
  addReaction: (messageId: string, emoji: string) => Promise<void>
  getChannelMessages: (channelId: string) => Message[]
}

let msgIdCounter = 1000

function formatSize(size: number) {
  if (size >= 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} MB`
  return `${(size / 1024).toFixed(1)} KB`
}

function toReactions(reactions: MessagesApi.MessageReaction[]) {
  const currentUserId = useAuthStore.getState().user?.id
  return Object.values(
    reactions.reduce<Record<string, { emoji: string; count: number; me: boolean }>>((acc, reaction) => {
      return {
        ...acc,
        [reaction.emoji]: {
          emoji: reaction.emoji,
          count: (acc[reaction.emoji]?.count ?? 0) + 1,
          me: acc[reaction.emoji]?.me || reaction.userId === currentUserId,
        },
      }
    }, {}),
  )
}

function toMessage(message: MessagesApi.MessageResponse): Message {
  return {
    id: message.id,
    channel: message.channelId,
    user: message.user.name,
    userId: message.userId,
    time: new Date(message.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    createdAt: message.createdAt,
    text: message.text,
    reactions: toReactions(message.reactions),
    attachment: message.attachment
      ? {
          name: message.attachment.name,
          size: formatSize(message.attachment.size),
          icon: message.attachment.icon,
          encrypted: message.attachment.encrypted,
        }
      : undefined,
    taskCard: message.taskCard
      ? {
          label: message.taskCard.label,
          labelColor: message.taskCard.labelColor,
          title: message.taskCard.title,
          due: message.taskCard.due ?? '',
          priority: message.taskCard.priority,
          priorityColor: message.taskCard.priorityColor,
        }
      : undefined,
  }
}

export const useMessagesStore = create<MessagesState>((set, get) => ({
  messages: [...MESSAGES],
  isLoading: false,
  error: null,

  loadChannel: async (channelId) => {
    set({ isLoading: true, error: null })
    try {
      const response = await MessagesApi.listByChannel(channelId)
      const nextMessages = response.data.map(toMessage).reverse()
      set({
        messages: [
          ...get().messages.filter((message) => message.channel !== channelId),
          ...nextMessages,
        ],
        isLoading: false,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar mensagens'
      set({ error: message, isLoading: false })
    }
  },

  sendMessage: async (channelId, text) => {
    try {
      const created = await MessagesApi.create(channelId, text)
      set({ messages: [...get().messages, toMessage(created)] })
    } catch {
      const msg: Message = {
        id: String(++msgIdCounter),
        channel: channelId,
        user: 'me',
        userId: useAuthStore.getState().user?.id ?? 'me',
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        createdAt: new Date().toISOString(),
        text,
        reactions: [],
      }
      set({ messages: [...get().messages, msg] })
    }
  },

  addReaction: async (messageId, emoji) => {
    const target = get().messages.find((message) => message.id === messageId)
    if (!target) return
    try {
      const response = await MessagesApi.toggleReaction(messageId, emoji)
      set({
        messages: get().messages.map((message) =>
          message.id === messageId ? { ...message, reactions: toReactions(response.reactions) } : message
        ),
      })
    } catch {
      set({
        messages: get().messages.map((message) => {
          if (message.id !== messageId) return message
          const existing = message.reactions.find((reaction) => reaction.emoji === emoji)
          if (!existing) return { ...message, reactions: [...message.reactions, { emoji, count: 1, me: true }] }
          return {
            ...message,
            reactions: message.reactions.map((reaction) =>
              reaction.emoji === emoji ? { ...reaction, count: reaction.count + 1, me: true } : reaction
            ),
          }
        }),
      })
    }
  },

  getChannelMessages(channelId) {
    return get().messages.filter((m) => m.channel === channelId)
  },
}))
