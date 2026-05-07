import React from 'react'
import { useUIStore } from '../../ui/store'
import { useMessagesStore } from '../../messages/store'
import { useAppDataStore } from '../../app-data/store'
import { Skeleton } from '../../../design-system/Skeleton'
import { EmptyState } from '../../../design-system/EmptyState'
import { useResolvedPermissions } from '../../permissions/hooks'
import { hasPermissionAction } from '../../permissions/utils'
import { AppIcon } from '../../../design-system/AppIcon'
import { getFileIconName } from '../../../design-system/app-icon.utils'

const QUICK_REACTIONS = ['👍', '❤️', '😂', '🎉', '🤔', '👀']

const MessageItem = React.memo(function MessageItem({
  msg,
  canReact,
}: {
  msg: { id: string; channel: string; user: string; userId: string; time: string; text: string; reactions: { emoji: string; count: number; me: boolean }[]; attachment?: { name: string; size: string; icon: string }; taskCard?: { label: string; title: string; due: string; priority: string; priorityColor: string } }
  canReact: boolean
}) {
  const user = useAppDataStore((s) => s.users[msg.userId])
  const addReaction = useMessagesStore((s) => s.addReaction)
  const [showReactions, setShowReactions] = React.useState(false)

  return (
    <div
      style={{ marginBottom: '14px', position: 'relative' }}
      onMouseEnter={() => setShowReactions(true)}
      onMouseLeave={() => setShowReactions(false)}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: user?.color || 'var(--color-accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
            fontWeight: 700,
            color: '#fff',
            flexShrink: 0,
          }}
        >
          {user?.initials || '?'}
        </div>
        <span style={{ fontSize: '13px', fontWeight: 600 }}>{user?.name || msg.user}</span>
        <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>{msg.time}</span>
      </div>
      <div style={{ paddingLeft: '40px' }}>
        <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--color-text-primary)', margin: 0 }}>
          {msg.text}
        </p>
        {msg.attachment && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginTop: '6px',
              padding: '9px 12px',
              background: 'var(--color-surface-elevated)',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: '10px',
              maxWidth: '300px',
              cursor: 'pointer',
            }}
          >
            <span style={{ display: 'inline-flex', color: 'var(--color-text-secondary)' }}>
              <AppIcon name={getFileIconName(msg.attachment.icon)} size={22} />
            </span>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 500 }}>{msg.attachment.name}</div>
              <div style={{ fontSize: '10px', color: 'var(--color-text-tertiary)' }}>{msg.attachment.size}</div>
            </div>
          </div>
        )}
        {msg.taskCard && (
          <div
            style={{
              marginTop: '6px',
              padding: '9px 12px',
              background: 'var(--color-surface-elevated)',
              border: '1px solid var(--color-border-subtle)',
              borderLeft: '3px solid var(--color-accent)',
              borderRadius: '10px',
              maxWidth: '340px',
              cursor: 'pointer',
            }}
          >
            <div style={{ fontSize: '10px', color: 'var(--color-accent)', fontWeight: 600, marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '.05em' }}>
              {msg.taskCard.label}
            </div>
            <div style={{ fontSize: '12px', fontWeight: 500 }}>{msg.taskCard.title}</div>
            <div style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', marginTop: '3px', display: 'flex', gap: '10px' }}>
              <span>{msg.taskCard.due}</span>
              <span style={{ color: msg.taskCard.priorityColor }}>{msg.taskCard.priority}</span>
            </div>
          </div>
        )}
        {msg.reactions.length > 0 && (
          <div style={{ display: 'flex', gap: '4px', marginTop: '6px', flexWrap: 'wrap' }}>
            {msg.reactions.map((r, i) => (
              <span
                key={i}
                onClick={() => {
                  if (!canReact) return
                  void addReaction(msg.id, r.emoji)
                }}
                style={{
                  padding: '2px 8px',
                  background: r.me ? 'var(--color-accent-soft)' : 'rgba(255,255,255,.65)',
                  border: `1px solid ${r.me ? 'var(--color-accent-border)' : 'var(--color-border-subtle)'}`,
                  borderRadius: '999px',
                  fontSize: '12px',
                  cursor: canReact ? 'pointer' : 'default',
                  color: r.me ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                }}
              >
                {r.emoji} {r.count}
              </span>
            ))}
          </div>
        )}
        {showReactions && canReact && (
          <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
            {QUICK_REACTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => void addReaction(msg.id, emoji)}
                style={{
                  padding: '3px 7px',
                  borderRadius: '999px',
                  border: '1px solid var(--color-border-subtle)',
                  background: 'rgba(255,255,255,.72)',
                  fontSize: '13px',
                  cursor: 'pointer',
                  opacity: 0.7,
                  transition: 'opacity .15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '1' }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.7' }}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
})

export function ChatView() {
  const activeChannelId = useUIStore((s) => s.activeChannelId)
  const allMessages = useMessagesStore((s) => s.messages)
  const sendMessage = useMessagesStore((s) => s.sendMessage)
  const loadChannel = useMessagesStore((s) => s.loadChannel)
  const isLoading = useMessagesStore((s) => s.isLoading)
  const [input, setInput] = React.useState('')
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const permissions = useResolvedPermissions(activeChannelId, 'channel')
  const canViewChannel = hasPermissionAction(permissions.actions, 'view')
  const canPostChannel = hasPermissionAction(permissions.actions, 'post') || hasPermissionAction(permissions.actions, 'edit')
  const canReactToMessages = hasPermissionAction(permissions.actions, 'comment') || canPostChannel

  const messages = React.useMemo(() => {
    if (!activeChannelId) return []
    return allMessages.filter((m) => m.channel === activeChannelId)
  }, [allMessages, activeChannelId])

  const msgCount = messages.length

  React.useEffect(() => {
    if (!activeChannelId) return
    void loadChannel(activeChannelId)
  }, [activeChannelId, loadChannel])

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [msgCount])

  const handleSend = () => {
    const text = input.trim()
    if (!text || !activeChannelId || !canPostChannel) return
    void sendMessage(activeChannelId, text)
    setInput('')
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%' }}>
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {!canViewChannel ? (
          <EmptyState
            icon={<AppIcon name="lock" size={28} />}
            title="Canal restrito para você"
            description="Sua equipe ainda não tem permissão de visualização neste canal."
          />
        ) : isLoading ? (
          <>
            <Skeleton height={60} count={4} />
          </>
        ) : messages.length === 0 ? (
          <EmptyState
            icon={<AppIcon name="chat" size={28} />}
            title="Nenhuma mensagem ainda"
            description="Seja o primeiro a enviar uma mensagem neste canal."
          />
        ) : (
          messages.map((msg) => <MessageItem key={msg.id} msg={msg} canReact={canReactToMessages} />)
        )}
      </div>
      <div style={{ padding: '10px 20px 14px', borderTop: '1px solid var(--color-border-subtle)', flexShrink: 0 }}>
        <div
          style={{
            background: 'rgba(255,255,255,.78)',
            border: '1px solid var(--color-border)',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            padding: '0 4px 0 12px',
            gap: '4px',
            transition: 'border-color .15s',
          }}
        >
          <input
            type="text"
            placeholder={canPostChannel ? 'Mensagem...' : 'Você tem acesso somente leitura neste canal'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={!canPostChannel}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--color-text-primary)',
              fontSize: '13px',
              padding: '11px 0',
              fontFamily: 'var(--font-body)',
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || !canPostChannel}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              border: 'none',
              background: input.trim() && canPostChannel ? 'var(--color-accent)' : 'var(--color-border-subtle)',
              color: '#fff',
              fontSize: '14px',
              cursor: input.trim() && canPostChannel ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'background .15s',
            }}
          >
            <AppIcon name="send" size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatView
