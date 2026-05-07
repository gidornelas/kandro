import React from 'react'
import { useUIStore } from '../../ui/store'
import { useDmStore } from '../../dms/store'
import { useAppDataStore } from '../../app-data/store'
import { useAuthStore } from '../../auth/store'
import { Skeleton } from '../../../design-system/Skeleton'
import { EmptyState } from '../../../design-system/EmptyState'
import { AppIcon } from '../../../design-system/AppIcon'

const DmMessageItem = React.memo(function DmMessageItem({ msg }: { msg: { id: string; channel: string; user: string; userId: string; time: string; text: string; reactions: { emoji: string; count: number; me: boolean }[] } }) {
  const msgUser = useAppDataStore((s) => s.users[msg.userId])
  const currentUserId = useAuthStore((s) => s.user?.id)
  const isMe = msg.userId === currentUserId || msg.userId === 'me'

  return (
    <div style={{ marginBottom: '14px', display: 'flex', gap: '8px', alignItems: 'flex-start', flexDirection: isMe ? 'row-reverse' : 'row' }}>
      {!isMe && (
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: msgUser?.color || 'var(--color-accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
            fontWeight: 700,
            color: '#fff',
            flexShrink: 0,
          }}
        >
          {msgUser?.initials || '?'}
        </div>
      )}
      <div style={{ maxWidth: '70%', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '2px', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: isMe ? 'var(--color-accent)' : 'var(--color-text-primary)' }}>
            {isMe ? 'Você' : msgUser?.name || msg.user}
          </span>
          <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)' }}>{msg.time}</span>
        </div>
        <div
          style={{
            padding: '8px 12px',
            borderRadius: '12px',
            background: isMe ? 'var(--color-accent-soft)' : 'var(--color-surface-elevated)',
            border: `1px solid ${isMe ? 'var(--color-accent-border)' : 'var(--color-border-subtle)'}`,
            wordBreak: 'break-word',
          }}
        >
          <p style={{ fontSize: '13px', lineHeight: 1.5, color: 'var(--color-text-primary)', margin: 0 }}>{msg.text}</p>
        </div>
        {msg.reactions.length > 0 && (
          <div style={{ display: 'flex', gap: '4px', marginTop: '4px', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
            {msg.reactions.map((r, i) => (
              <span
                key={i}
                style={{
                  padding: '1px 6px',
                  background: r.me ? 'var(--color-accent-soft)' : 'rgba(255,255,255,.65)',
                  border: `1px solid ${r.me ? 'var(--color-accent-border)' : 'var(--color-border-subtle)'}`,
                  borderRadius: '999px',
                  fontSize: '11px',
                  color: r.me ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                }}
              >
                {r.emoji} {r.count}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
})

export function DmView() {
  const activeDmId = useUIStore((s) => s.activeDmId)
  const dms = useAppDataStore((s) => s.dms)
  const users = useAppDataStore((s) => s.users)
  const dm = dms.find((d) => d.id === activeDmId)
  const user = dm ? users[dm.userId] : null
  const conversations = useDmStore((s) => s.conversations)
  const sendDm = useDmStore((s) => s.sendDm)
  const loadMessages = useDmStore((s) => s.loadMessages)
  const isLoading = useDmStore((s) => s.isLoading)
  const pendingRoomId = useDmStore((s) => s.pendingRoomId)
  const error = useDmStore((s) => s.error)
  const clearError = useDmStore((s) => s.clearError)
  const [input, setInput] = React.useState('')
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const isSending = pendingRoomId === activeDmId

  const messages = React.useMemo(() => {
    if (!activeDmId) return []
    return conversations[activeDmId] || []
  }, [conversations, activeDmId])
  const lastMessageId = messages[messages.length - 1]?.id ?? null

  React.useEffect(() => {
    if (!activeDmId) return
    clearError()
    void loadMessages(activeDmId)
  }, [activeDmId, clearError, loadMessages])

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [activeDmId, lastMessageId])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || !activeDmId || isSending) return
    const nextInput = input
    setInput('')
    const success = await sendDm(activeDmId, text)
    if (success) return
    setInput(nextInput)
  }

  if (!dm) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <EmptyState icon={<AppIcon name="dm" size={28} />} title="Selecione uma conversa" description="Escolha um contato na sidebar para começar a conversar." />
      </div>
    )
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%' }}>
      {/* DM Header */}
      <div
        style={{
          minHeight: '56px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '0 20px',
          borderBottom: '1px solid var(--color-border-subtle)',
          flexShrink: 0,
          background: 'var(--color-surface)',
          }}
        >
        <div
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            background: user?.color || 'var(--color-accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
            fontWeight: 700,
            color: '#fff',
          }}
        >
          {user?.initials || '?'}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.name || 'Mensagem direta'}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: user?.status === 'online' ? 'var(--color-success)' : user?.status === 'busy' ? 'var(--color-danger)' : 'var(--color-text-tertiary)',
              }}
            />
            <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', textTransform: 'capitalize' }}>
              {user?.status || 'offline'}
            </span>
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
          {messages.length > 0 ? `${messages.length} mensagem(ns)` : 'Nova conversa'}
        </span>
      </div>

      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {isLoading ? (
          <Skeleton height={60} count={4} />
        ) : error && messages.length === 0 ? (
          <EmptyState
            icon={<AppIcon name="warning" size={28} />}
            title="Não foi possível carregar a conversa"
            description={error}
            action={
              <button
                type="button"
                onClick={() => {
                  if (!activeDmId) return
                  clearError()
                  void loadMessages(activeDmId)
                }}
                style={{
                  minHeight: '38px',
                  padding: '0 14px',
                  borderRadius: '10px',
                  border: '1px solid var(--color-accent-border)',
                  background: 'var(--color-accent-soft)',
                  color: 'var(--color-accent)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Tentar novamente
              </button>
            }
          />
        ) : messages.length === 0 ? (
          <EmptyState
            icon={<AppIcon name="chat" size={28} />}
            title="Nenhuma mensagem ainda"
            description={user?.name ? `Diga olá para ${user.name} e comece a conversa.` : 'Envie a primeira mensagem desta conversa.'}
          />
        ) : (
          messages.map((msg) => <DmMessageItem key={msg.id} msg={msg} />)
        )}
      </div>
      <div style={{ padding: '10px 20px 14px', borderTop: '1px solid var(--color-border-subtle)', flexShrink: 0 }}>
        {error && messages.length > 0 && (
          <div
            style={{
              marginBottom: '10px',
              padding: '10px 12px',
              borderRadius: '12px',
              background: 'var(--color-danger-soft)',
              border: '1px solid var(--color-danger-border)',
              color: 'var(--color-danger)',
              fontSize: '12px',
              lineHeight: 1.5,
            }}
          >
            {error}
          </div>
        )}
        <div
          style={{
            background: 'rgba(255,255,255,.78)',
            border: '1px solid var(--color-border)',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            padding: '0 4px 0 12px',
            gap: '4px',
          }}
        >
          <form
            onSubmit={(event) => {
              event.preventDefault()
              void handleSend()
            }}
            style={{ display: 'contents' }}
          >
          <input
            type="text"
            placeholder={isSending ? 'Enviando mensagem...' : `Mensagem para ${user?.name || 'esta pessoa'}...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isSending}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                void handleSend()
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
            type="submit"
            disabled={!input.trim() || isSending}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              border: 'none',
              background: input.trim() && !isSending ? 'var(--color-accent)' : 'var(--color-border-subtle)',
              color: '#fff',
              fontSize: '14px',
              cursor: input.trim() && !isSending ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'background .15s',
            }}
          >
            <AppIcon name="send" size={14} />
          </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default DmView
