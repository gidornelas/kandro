import { useEffect, useRef, useMemo } from 'react'
import { useUIStore } from '../../stores/uiStore'
import { useMessages } from '../../hooks/queries/useMessages'
import { USERS } from '../../data/mock'
import { MessageGroup } from '../chat/MessageGroup'
import { MessageInput } from '../chat/MessageInput'
import { SkeletonList } from '../ui/Skeleton'
import { QueryError } from '../ui/QueryError'

export function ChannelView() {
  const { activeChannelId } = useUIStore()
  const { data: messages, isLoading, error, refetch } = useMessages(activeChannelId)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const channelMessages = useMemo(() => messages ?? [], [messages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [channelMessages])

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-1">
        {isLoading && <SkeletonList count={5} />}

        {!isLoading && error && (
          <QueryError message={error.message} onRetry={() => refetch()} />
        )}

        {!isLoading && !error && channelMessages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center gap-2">
            <div className="text-3xl opacity-40">💬</div>
            <div className="text-[var(--text-3)] text-sm">Nenhuma mensagem ainda</div>
            <div className="text-[var(--text-3)] text-xs">Envie a primeira mensagem neste canal</div>
          </div>
        )}

        {!isLoading && channelMessages.map(msg => {
          const user = USERS[msg.user]
          if (!user) return null
          return <MessageGroup key={msg.id} message={msg} user={user} />
        })}
        <div ref={messagesEndRef} />
      </div>
      <MessageInput />
    </div>
  )
}
