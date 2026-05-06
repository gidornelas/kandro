import React from 'react'
import { useVoiceStore } from '../store'
import { USERS } from '../../../shared/mocks'
import { EmptyState } from '../../../design-system/EmptyState'

export function RoomChatPanel() {
  const chatOpen = useVoiceStore((s) => s.chatOpen)
  const messages = useVoiceStore((s) => s.roomMessages)
  const sendMessage = useVoiceStore((s) => s.sendRoomMessage)
  const [input, setInput] = React.useState('')

  if (!chatOpen) return null

  return (
    <div
      style={{
        width: '300px',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--color-surface)',
        borderLeft: '1px solid var(--color-border-subtle)',
        backdropFilter: 'var(--blur-panel)',
        animation: 'slideIn .2s ease',
      }}
    >
      <style>{`@keyframes slideIn { from { transform: translateX(20px); opacity: 0 } to { transform: translateX(0); opacity: 1 } }`}</style>
      {/* Header */}
      <div
        style={{
          height: '44px',
          display: 'flex',
          alignItems: 'center',
          padding: '0 14px',
          borderBottom: '1px solid var(--color-border-subtle)',
          flexShrink: 0,
          gap: '8px',
        }}
      >
        <span style={{ fontSize: '14px' }}>💬</span>
        <span style={{ fontSize: '13px', fontWeight: 600, flex: 1 }}>Chat da chamada</span>
        <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>{messages.length} msgs</span>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {messages.length === 0 ? (
          <EmptyState icon="💬" title="Sem mensagens" description="Envie uma mensagem para a sala." />
        ) : (
          messages.map((msg) => {
            const user = USERS[msg.userId]
            const isMe = msg.userId === 'me'
            return (
              <div key={msg.id} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                {!isMe && (
                  <div
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      background: user?.color || 'var(--color-accent)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '9px',
                      fontWeight: 700,
                      color: '#fff',
                      flexShrink: 0,
                    }}
                  >
                    {user?.initials || '?'}
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '2px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: isMe ? 'var(--color-accent)' : 'var(--color-text-primary)' }}>
                      {isMe ? 'Você' : user?.name || msg.user}
                    </span>
                    <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)' }}>{msg.time}</span>
                  </div>
                  <p style={{ fontSize: '12px', lineHeight: 1.5, color: 'var(--color-text-primary)', margin: 0, wordBreak: 'break-word' }}>
                    {msg.text}
                  </p>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Input */}
      <div style={{ padding: '10px 12px 12px', borderTop: '1px solid var(--color-border-subtle)', flexShrink: 0 }}>
        <div
          style={{
            background: 'rgba(255,255,255,.78)',
            border: '1px solid var(--color-border)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            padding: '0 4px 0 10px',
            gap: '4px',
          }}
        >
          <input
            type="text"
            placeholder="Mensagem..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const t = input.trim()
                if (t) {
                  sendMessage(t)
                  setInput('')
                }
              }
            }}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--color-text-primary)',
              fontSize: '12px',
              padding: '9px 0',
              fontFamily: 'var(--font-body)',
            }}
          />
          <button
            onClick={() => {
              const t = input.trim()
              if (t) {
                sendMessage(t)
                setInput('')
              }
            }}
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '7px',
              border: 'none',
              background: 'var(--color-accent)',
              color: '#fff',
              fontSize: '12px',
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
