import { useState, useEffect, useRef, useMemo } from 'react'
import { useUIStore } from '../../stores/uiStore'
import { useAuthStore } from '../../stores/authStore'
import { useDmMessages } from '../../hooks/queries/useDmMessages'
import { useDmRooms } from '../../hooks/queries/useDmRooms'
import { queryClient } from '../../lib/queryClient'
import { USERS } from '../../data/mock'
import { getSocket } from '../../lib/socket'
import type { DmMessage, PaginatedDmMessages } from '../../api/dms'
import { MessageGroup } from '../chat/MessageGroup'
import { SkeletonList } from '../ui/Skeleton'
import { QueryError } from '../ui/QueryError'

export function DmView() {
  const { activeDmId } = useUIStore()
  const authUser = useAuthStore(s => s.user)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [input, setInput] = useState('')

  const { data, isLoading, error, refetch } = useDmMessages(activeDmId)
  const { data: rooms } = useDmRooms()
  const messages = data?.data ? [...data.data].reverse() : []

  const roomUser = useMemo(() => {
    if (!activeDmId || !authUser || !rooms) return null
    const room = rooms.find(r => r.id === activeDmId)
    if (!room) return null
    return room.userAId === authUser.id ? room.userB : room.userA
  }, [activeDmId, authUser, rooms])

  useEffect(() => {
    if (!activeDmId) return

    const socket = getSocket()
    if (socket?.connected) {
      socket.emit('subscribe:dm', activeDmId)

      const handleDmMessage = (msg: DmMessage) => {
        queryClient.setQueryData<PaginatedDmMessages>(['dm-messages', activeDmId], (old) => {
          if (!old) return old
          return { ...old, data: [...old.data, msg] }
        })
      }

      socket.on('dm:message', handleDmMessage)

      return () => {
        socket.emit('unsubscribe:dm', activeDmId)
        socket.off('dm:message', handleDmMessage)
      }
    }
  }, [activeDmId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, isLoading])

  const handleSend = () => {
    if (!input.trim() || !activeDmId) return

    const socket = getSocket()
    if (socket?.connected) {
      socket.emit('dm:send', { roomId: activeDmId, text: input.trim() })
    }
    setInput('')
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-1">
        {isLoading && <SkeletonList count={5} />}

        {!isLoading && error && (
          <QueryError message={error.message} onRetry={() => refetch()} />
        )}

        {!isLoading && !error && messages.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-[var(--text-3)] text-sm">
            Nenhuma mensagem ainda
          </div>
        )}
        {messages.map(msg => {
          const u = msg.user ? USERS[msg.user.id] ?? { id: msg.user.id, name: msg.user.name, initials: msg.user.initials, color: msg.user.color, role: '', status: 'online' as const } : null
          if (!u) return null
          const displayMsg = {
            id: msg.id,
            channel: activeDmId ?? '',
            user: msg.user.id,
            userId: msg.userId,
            time: new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            createdAt: msg.createdAt,
            text: msg.text,
            reactions: [],
          }
          return <MessageGroup key={msg.id} message={displayMsg} user={u} />
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-2.5 border-t border-[var(--b1)] flex gap-2 flex-shrink-0">
        <button className="w-[44px] h-[44px] rounded-[var(--r-sm)] border border-[var(--b2)] bg-[var(--s2)] text-[var(--t3)] cursor-pointer text-sm flex items-center justify-center" aria-label="Áudio">🎙</button>
        <button className="w-[44px] h-[44px] rounded-[var(--r-sm)] border border-[var(--b2)] bg-[var(--s2)] text-[var(--t3)] cursor-pointer text-sm flex items-center justify-center" aria-label="Vídeo">🎬</button>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSend() }}
          placeholder={roomUser ? `Mensagem para ${roomUser.name}…` : 'Mensagem…'}
          className="flex-1 bg-[var(--s3)] border border-[var(--b2)] rounded-[var(--r)] px-2.5 py-2 text-sm text-[var(--t1)] font-body outline-none"
        />
      </div>
    </div>
  )
}
