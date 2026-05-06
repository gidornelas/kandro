import React from 'react'
import { useUIStore } from '../../ui/store'
import { MESSAGES, USERS } from '../../../shared/mocks'
import { Skeleton } from '../../../design-system/Skeleton'
import { EmptyState } from '../../../design-system/EmptyState'

const MessageItem = React.memo(function MessageItem({ msg }: { msg: typeof MESSAGES[0] }) {
  const user = USERS[msg.userId]

  return (
    <div style={{ marginBottom: '14px' }}>
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
          {user?.initials}
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
            <span style={{ fontSize: '22px' }}>{msg.attachment.icon}</span>
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
            <div
              style={{
                fontSize: '10px',
                color: 'var(--color-accent)',
                fontWeight: 600,
                marginBottom: '3px',
                textTransform: 'uppercase',
                letterSpacing: '.05em',
              }}
            >
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
                style={{
                  padding: '2px 8px',
                  background: r.me ? 'var(--color-accent-soft)' : 'rgba(255,255,255,.65)',
                  border: `1px solid ${r.me ? 'var(--color-accent-border)' : 'var(--color-border-subtle)'}`,
                  borderRadius: '999px',
                  fontSize: '12px',
                  cursor: 'pointer',
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

export function ChatView() {
  const activeChannelId = useUIStore((s) => s.activeChannelId)
  const messages = MESSAGES.filter((m) => m.channel === activeChannelId)
  const [input, setInput] = React.useState('')
  const [isLoading] = React.useState(false) // placeholder para query real

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {isLoading ? (
          <>
            <Skeleton height={60} count={4} />
          </>
        ) : messages.length === 0 ? (
          <EmptyState
            icon="💬"
            title="Nenhuma mensagem ainda"
            description="Seja o primeiro a enviar uma mensagem neste canal."
          />
        ) : (
          messages.map((msg) => <MessageItem key={msg.id} msg={msg} />)
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
            placeholder="Mensagem..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
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
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              border: 'none',
              background: 'var(--color-accent)',
              color: '#fff',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            →
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatView
