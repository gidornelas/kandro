import { useEffect, useRef } from 'react'
import { getSocket, subscribeChannel, unsubscribeChannel } from '../../core/socket'
import { useAuthStore } from '../../modules/auth/store'
import { useUIStore } from '../../modules/ui/store'
import { usePresenceStore } from '../../modules/presence/store'
import { useVoiceStore } from '../../modules/voice/store'
import { queryClient } from '../../core/queryClient'
import type { MessageResponse, MessageReaction } from '../../modules/messages/api'
import { useMessagesStore } from '../../modules/messages/store'
import { useBoardStore } from '../../modules/boards/store'

function transformMessage(msg: MessageResponse, currentUserId: string) {
  return {
    id: msg.id,
    channel: msg.channelId,
    user: msg.user.name,
    userId: msg.userId,
    time: new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    createdAt: msg.createdAt,
    text: msg.text,
    reactions: msg.reactions.map((r) => ({
      emoji: r.emoji,
      count: 1,
      me: r.userId === currentUserId,
    })),
    attachment: msg.attachment
      ? {
          name: msg.attachment.name,
          size: `${(msg.attachment.size / (1024 * 1024)).toFixed(1)} MB`,
          icon: msg.attachment.icon,
          encrypted: msg.attachment.encrypted,
        }
      : undefined,
    taskCard: msg.taskCard
      ? {
          label: msg.taskCard.label,
          labelColor: msg.taskCard.labelColor,
          title: msg.taskCard.title,
          due: msg.taskCard.due || '',
          priority: msg.taskCard.priority,
          priorityColor: msg.taskCard.priorityColor,
        }
      : undefined,
  }
}

function transformReactions(reactions: MessageReaction[], currentUserId: string) {
  const grouped: Record<string, { emoji: string; count: number; me: boolean }> = {}
  for (const r of reactions) {
    if (!grouped[r.emoji]) grouped[r.emoji] = { emoji: r.emoji, count: 0, me: false }
    grouped[r.emoji].count++
    if (r.userId === currentUserId) grouped[r.emoji].me = true
  }
  return Object.values(grouped)
}

export function useSocketEvents() {
  const activeChannelId = useUIStore((s) => s.activeChannelId)
  const activeProjectId = useUIStore((s) => s.activeProjectId)
  const subRef = useRef<string | null>(null)
  const projectSubRef = useRef<string | null>(null)

  useEffect(() => {
    const socket = getSocket()
    if (!socket?.connected) return

    subscribeChannel('default')

    const currentUserId = useAuthStore.getState().user?.id ?? ''

    // ── Chat handlers ──
    const handleChatMessage = (msg: MessageResponse) => {
      const transformed = transformMessage(msg, currentUserId)
      const messages = useMessagesStore.getState().messages
      if (!messages.some((message) => message.id === transformed.id)) {
        useMessagesStore.setState({ messages: [...messages, transformed] })
      }
      queryClient.setQueryData(['messages', msg.channelId], (old: Array<typeof transformed> | null) => {
        return old ? [...old, transformed] : [transformed]
      })
    }

    const handleChatUpdated = (msg: MessageResponse) => {
      const transformed = transformMessage(msg, currentUserId)
      useMessagesStore.setState({
        messages: useMessagesStore.getState().messages.map((message) =>
          message.id === msg.id ? transformed : message
        ),
      })
      queryClient.setQueryData(['messages', msg.channelId], (old: Array<typeof transformed> | null) => {
        if (!old) return old
        return old.map((m) => (m.id === msg.id ? transformed : m))
      })
    }

    const handleChatDeleted = (data: { messageId: string; channelId?: string }) => {
      useMessagesStore.setState({
        messages: useMessagesStore.getState().messages.filter((message) => message.id !== data.messageId),
      })
      if (data.channelId) {
        queryClient.setQueryData(['messages', data.channelId], (old: { id: string }[] | null) => {
          if (!old) return old
          return old.filter((m) => m.id !== data.messageId)
        })
      }
      queryClient.invalidateQueries({ queryKey: ['messages'] })
    }

    const handleChatReactions = (data: { messageId: string; channelId?: string; reactions: MessageReaction[] }) => {
      const newReactions = transformReactions(data.reactions, currentUserId)
      useMessagesStore.setState({
        messages: useMessagesStore.getState().messages.map((message) =>
          message.id === data.messageId ? { ...message, reactions: newReactions } : message
        ),
      })
      if (data.channelId) {
        queryClient.setQueryData(['messages', data.channelId], (old: { id: string; reactions: typeof newReactions }[] | null) => {
          if (!old) return old
          return old.map((m) => (m.id === data.messageId ? { ...m, reactions: newReactions } : m))
        })
      }
      queryClient.invalidateQueries({ queryKey: ['messages'] })
    }

    // ── Board handlers ──
    const invalidateBoard = () => {
      if (activeProjectId) {
        void useBoardStore.getState().loadBoard(activeProjectId)
        queryClient.invalidateQueries({ queryKey: ['board', activeProjectId] })
      }
    }

    // ── Presence handlers ──
    const handlePresenceOnline = (data: { userId: string; status: string }) => {
      usePresenceStore.getState().setOnline(data.userId, data.status)
    }

    const handlePresenceStatus = (data: { userId: string; status: string; action?: string; context?: string }) => {
      usePresenceStore.getState().setStatus(data.userId, data.status, data.action, data.context)
    }

    const handlePresenceOffline = (data: { userId: string }) => {
      usePresenceStore.getState().setOffline(data.userId)
    }

    const handlePresenceActivity = (data: { userId: string; action: string; context?: string }) => {
      usePresenceStore.getState().setActivity(data.userId, data.action, data.context)
    }

    // ── Voice event handlers ──
    const handleVoiceParticipantJoined = (data: { userId: string; timestamp?: string }) => {
      useVoiceStore.getState().updateParticipant(data.userId, { muted: false, cameraOn: false, sharing: false })
      const exists = useVoiceStore.getState().participants.some((p) => p.userId === data.userId)
      if (!exists) {
        useVoiceStore.getState().setParticipants([
          ...useVoiceStore.getState().participants,
          { userId: data.userId, muted: false, cameraOn: false, sharing: false },
        ])
      }
    }

    const handleVoiceParticipantLeft = (data: { userId: string }) => {
      useVoiceStore.getState().setParticipants(
        useVoiceStore.getState().participants.filter((p) => p.userId !== data.userId)
      )
    }

    const handleVoiceParticipantChanged = (data: { userId: string; muted?: boolean; cameraOn?: boolean; sharing?: boolean }) => {
      useVoiceStore.getState().updateParticipant(data.userId, {
        muted: data.muted,
        cameraOn: data.cameraOn,
        sharing: data.sharing,
      })
    }

    socket.on('chat:message', handleChatMessage)
    socket.on('chat:updated', handleChatUpdated)
    socket.on('chat:deleted', handleChatDeleted)
    socket.on('chat:reactions', handleChatReactions)

    socket.on('board:card:created', invalidateBoard)
    socket.on('board:card:updated', invalidateBoard)
    socket.on('board:card:moved', invalidateBoard)
    socket.on('board:card:deleted', invalidateBoard)
    socket.on('board:column:created', invalidateBoard)
    socket.on('board:column:updated', invalidateBoard)
    socket.on('board:column:deleted', invalidateBoard)

    socket.on('presence:online', handlePresenceOnline)
    socket.on('presence:status', handlePresenceStatus)
    socket.on('presence:offline', handlePresenceOffline)
    socket.on('presence:activity', handlePresenceActivity)

    socket.on('voice:participant:joined', handleVoiceParticipantJoined)
    socket.on('voice:participant:left', handleVoiceParticipantLeft)
    socket.on('voice:participant:changed', handleVoiceParticipantChanged)

    return () => {
      socket.off('chat:message', handleChatMessage)
      socket.off('chat:updated', handleChatUpdated)
      socket.off('chat:deleted', handleChatDeleted)
      socket.off('chat:reactions', handleChatReactions)
      socket.off('board:card:created', invalidateBoard)
      socket.off('board:card:updated', invalidateBoard)
      socket.off('board:card:moved', invalidateBoard)
      socket.off('board:card:deleted', invalidateBoard)
      socket.off('board:column:created', invalidateBoard)
      socket.off('board:column:updated', invalidateBoard)
      socket.off('board:column:deleted', invalidateBoard)
      socket.off('presence:online', handlePresenceOnline)
      socket.off('presence:status', handlePresenceStatus)
      socket.off('presence:offline', handlePresenceOffline)
      socket.off('presence:activity', handlePresenceActivity)
      socket.off('voice:participant:joined', handleVoiceParticipantJoined)
      socket.off('voice:participant:left', handleVoiceParticipantLeft)
      socket.off('voice:participant:changed', handleVoiceParticipantChanged)
    }
  }, [activeProjectId])

  useEffect(() => {
    const prev = subRef.current
    if (prev && prev !== activeChannelId) {
      unsubscribeChannel(prev)
    }
    if (activeChannelId) {
      subscribeChannel(activeChannelId)
      subRef.current = activeChannelId
    }
  }, [activeChannelId])

  useEffect(() => {
    const prev = projectSubRef.current
    if (prev && prev !== activeProjectId) {
      unsubscribeChannel(prev)
    }
    if (activeProjectId) {
      subscribeChannel(activeProjectId)
      projectSubRef.current = activeProjectId
    }
  }, [activeProjectId])
}
