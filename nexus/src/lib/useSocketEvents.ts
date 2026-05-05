import { useEffect, useRef } from 'react'
import { getSocket, subscribeChannel, subscribeWorkspace, unsubscribeChannel } from './socket'
import { transformMessage, transformReactions } from '../stores/dataStore'
import { useAuthStore } from '../stores/authStore'
import { useUIStore } from '../stores/uiStore'
import { usePresenceStore } from '../stores/presenceStore'
import { useVoiceStore } from '../stores/voiceStore'
import { queryClient } from './queryClient'
import type { MessageResponse, MessageReaction } from '../api/messages'

export function useSocketEvents() {
  const activeChannelId = useUIStore(s => s.activeChannelId)
  const activeProjectId = useUIStore(s => s.activeProjectId)
  const subRef = useRef<string | null>(null)
  const projectSubRef = useRef<string | null>(null)

  useEffect(() => {
    const socket = getSocket()
    if (!socket?.connected) return

    subscribeWorkspace('default')

    const currentUserId = useAuthStore.getState().user?.id ?? ''

    // ── Chat handlers ──
    const handleChatMessage = (msg: MessageResponse) => {
      const transformed = transformMessage(msg, currentUserId)
      queryClient.setQueryData(['messages', msg.channelId], (old: typeof transformed[] | null) => {
        return old ? [...old, transformed] : [transformed]
      })
    }

    const handleChatUpdated = (msg: MessageResponse) => {
      const transformed = transformMessage(msg, currentUserId)
      queryClient.setQueryData(['messages', msg.channelId], (old: typeof transformed[] | null) => {
        if (!old) return old
        return old.map(m => m.id === msg.id ? transformed : m)
      })
    }

    const handleChatDeleted = (data: { messageId: string; channelId?: string }) => {
      if (data.channelId) {
        queryClient.setQueryData(['messages', data.channelId], (old: { id: string }[] | null) => {
          if (!old) return old
          return old.filter(m => m.id !== data.messageId)
        })
      }
      // Also invalidate all message queries to be safe
      queryClient.invalidateQueries({ queryKey: ['messages'] })
    }

    const handleChatReactions = (data: { messageId: string; channelId?: string; reactions: MessageReaction[] }) => {
      const newReactions = transformReactions(data.reactions, currentUserId)
      if (data.channelId) {
        queryClient.setQueryData(['messages', data.channelId], (old: { id: string; reactions: typeof newReactions }[] | null) => {
          if (!old) return old
          return old.map(m => m.id === data.messageId ? { ...m, reactions: newReactions } : m)
        })
      }
      queryClient.invalidateQueries({ queryKey: ['messages'] })
    }

    // ── Board handlers ──
    const handleCardCreated = () => {
      if (activeProjectId) {
        queryClient.invalidateQueries({ queryKey: ['board', activeProjectId] })
      }
    }

    const handleCardUpdated = () => {
      if (activeProjectId) {
        queryClient.invalidateQueries({ queryKey: ['board', activeProjectId] })
      }
    }

    const handleCardMoved = () => {
      if (activeProjectId) {
        queryClient.invalidateQueries({ queryKey: ['board', activeProjectId] })
      }
    }

    const handleCardDeleted = () => {
      if (activeProjectId) {
        queryClient.invalidateQueries({ queryKey: ['board', activeProjectId] })
      }
    }

    const handleColumnCreated = () => {
      if (activeProjectId) {
        queryClient.invalidateQueries({ queryKey: ['board', activeProjectId] })
      }
    }

    const handleColumnUpdated = () => {
      if (activeProjectId) {
        queryClient.invalidateQueries({ queryKey: ['board', activeProjectId] })
      }
    }

    const handleColumnDeleted = () => {
      if (activeProjectId) {
        queryClient.invalidateQueries({ queryKey: ['board', activeProjectId] })
      }
    }

    socket.on('chat:message', handleChatMessage)
    socket.on('chat:updated', handleChatUpdated)
    socket.on('chat:deleted', handleChatDeleted)
    socket.on('chat:reactions', handleChatReactions)

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
      const exists = useVoiceStore.getState().participants.some(p => p.userId === data.userId)
      if (!exists) {
        useVoiceStore.getState().setParticipants([
          ...useVoiceStore.getState().participants,
          { userId: data.userId, muted: false, cameraOn: false, sharing: false },
        ])
      }
    }

    const handleVoiceParticipantLeft = (data: { userId: string }) => {
      useVoiceStore.getState().setParticipants(
        useVoiceStore.getState().participants.filter(p => p.userId !== data.userId)
      )
    }

    const handleVoiceParticipantChanged = (data: { userId: string; muted?: boolean; cameraOn?: boolean; sharing?: boolean }) => {
      useVoiceStore.getState().updateParticipant(data.userId, {
        muted: data.muted,
        cameraOn: data.cameraOn,
        sharing: data.sharing,
      })
    }

    socket.on('board:card:created', handleCardCreated)
    socket.on('board:card:updated', handleCardUpdated)
    socket.on('board:card:moved', handleCardMoved)
    socket.on('board:card:deleted', handleCardDeleted)
    socket.on('board:column:created', handleColumnCreated)
    socket.on('board:column:updated', handleColumnUpdated)
    socket.on('board:column:deleted', handleColumnDeleted)

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
      socket.off('board:card:created', handleCardCreated)
      socket.off('board:card:updated', handleCardUpdated)
      socket.off('board:card:moved', handleCardMoved)
      socket.off('board:card:deleted', handleCardDeleted)
      socket.off('board:column:created', handleColumnCreated)
      socket.off('board:column:updated', handleColumnUpdated)
      socket.off('board:column:deleted', handleColumnDeleted)
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
