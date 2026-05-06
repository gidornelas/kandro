import React from 'react'
import { useUIStore } from '../../ui/store'
import { DMS, USERS } from '../../../shared/mocks'
import { Skeleton } from '../../../design-system/Skeleton'
import { EmptyState } from '../../../design-system/EmptyState'

const DmMessageItem = React.memo(function DmMessageItem({ msg }: { msg: typeof DMS[0]['messages'][0] }) {
  const msgUser = USERS[msg.userId]
  return (
    <div style={{ marginBottom: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
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
          {msgUser?.initials}
        </div>
        <span style={{ fontSize: '13px', fontWeight: 600 }}>{msgUser?.name || msg.user}</span>
        <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>{msg.time}</span>
      </div>
      <div style={{ paddingLeft: '40px' }}>
        <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--color-text-primary)', margin: 0 }}>
          {msg.text}
        </p>
        {msg.reactions.length > 0 && (
          <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
            {msg.reactions.map((r, i) => (
              <span
                key={i}
                style={{
                  padding: '2px 8px',
                  background: r.me ? 'var(--color-accent-soft)' : 'rgba(255,255,255,.65)',
                  border: `1px solid ${r.me ? 'var(--color-accent-border)' : 'var(--color-border-subtle)'}`,
                  borderRadius: '999px',
                  fontSize: '12px',
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
  const [input, setInput] = React.useState('')
  const [isLoading] = React.useState(false)

  if (!dm) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <EmptyState
          icon="✉"
          title="Selecione uma conversa"
          description="Escolha um contato na sidebar para começar a conversar."
        />
      </div>
    )
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {isLoading ? (
          <Skeleton height={60} count={4} />
        ) : dm.messages.length === 0 ? (
          <EmptyState
            icon="💬"
            title="Nenhuma mensagem ainda"
            description={`Diga olá para ${user?.name}!`}
          />
        ) : (
          dm.messages.map((msg) => <DmMessageItem key={msg.id} msg={msg} />)
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

export default DmView
