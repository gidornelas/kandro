import React from 'react'
import { useUIStore } from '../../ui/store'
import { useDmStore } from '../../dms/store'
import { DMS, USERS } from '../../../shared/mocks'
import { Skeleton } from '../../../design-system/Skeleton'
import { EmptyState } from '../../../design-system/EmptyState'

const DmMessageItem = React.memo(function DmMessageItem({ msg }: { msg: { id: string; channel: string; user: string; userId: string; time: string; text: string; reactions: { emoji: string; count: number; me: boolean }[] } }) {
  const msgUser = USERS[msg.userId]
  const isMe = msg.userId === 'me'

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
  const dm = DMS.find((d) => d.id === activeDmId)
  const user = dm ? USERS[dm.userId] : null
  const messages = useDmStore((s) => s.getMessages(activeDmId || ''))
  const sendDm = useDmStore((s) => s.sendDm)
  const [input, setInput] = React.useState('')
  const [isLoading] = React.useState(false)
  const scrollRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages.length])

  const handleSend = () => {
    const text = input.trim()
    if (!text || !activeDmId) return
    sendDm(activeDmId, text)
    setInput('')
  }

  if (!dm) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <EmptyState icon="✉" title="Selecione uma conversa" description="Escolha um contato na sidebar para começar a conversar." />
      </div>
    )
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%' }}>
      {/* DM Header */}
      <div
        style={{
          height: '48px',
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
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: user?.color || 'var(--color-accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            fontWeight: 700,
            color: '#fff',
          }}
        >
          {user?.initials}
        </div>
        <span style={{ fontSize: '14px', fontWeight: 600 }}>{user?.name}</span>
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: user?.status === 'online' ? 'var(--color-success)' : user?.status === 'busy' ? 'var(--color-danger)' : 'var(--color-text-tertiary)',
          }}
        />
        <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', textTransform: 'capitalize' }}>{user?.status}</span>
      </div>

      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {isLoading ? (
          <Skeleton height={60} count={4} />
        ) : messages.length === 0 ? (
          <EmptyState icon="💬" title="Nenhuma mensagem ainda" description={`Diga olá para ${user?.name}!`} />
        ) : (
          messages.map((msg) => <DmMessageItem key={msg.id} msg={msg} />)
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
          }}
        >
          <input
            type="text"
            placeholder={`Mensagem para ${user?.name}...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
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
            disabled={!input.trim()}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              border: 'none',
              background: input.trim() ? 'var(--color-accent)' : 'var(--color-border-subtle)',
              color: '#fff',
              fontSize: '14px',
              cursor: input.trim() ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'background .15s',
            }}
          >
            →
          </button>
        </div>
      </div>
    </div>
  )
}

export default DmView
