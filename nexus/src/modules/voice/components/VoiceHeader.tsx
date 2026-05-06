import { useVoiceStore } from '../store'
import { useCallTimer } from '../hooks/useCallTimer'

const LAYOUTS: { key: typeof useVoiceStore.getState.prototype.layout; label: string; icon: string }[] = [
  { key: 'voice', label: 'Voz', icon: '🎙' },
  { key: 'grid', label: 'Grid', icon: '⊞' },
  { key: 'spotlight', label: 'Destaque', icon: '⬡' },
  { key: 'screen', label: 'Tela', icon: '🖥' },
]

export function VoiceHeader() {
  const participants = useVoiceStore((s) => s.participants)
  const layout = useVoiceStore((s) => s.layout)
  const setLayout = useVoiceStore((s) => s.setLayout)
  const toggleChat = useVoiceStore((s) => s.toggleChat)
  const leaveRoom = useVoiceStore((s) => s.leaveRoom)
  const active = useVoiceStore((s) => s.active)
  const timer = useCallTimer(active)

  return (
    <div
      style={{
        height: '52px',
        padding: '0 16px',
        background: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border-subtle)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        flexShrink: 0,
        backdropFilter: 'var(--blur-panel)',
      }}
    >
      {/* LIVE badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          padding: '3px 10px',
          background: 'var(--color-success-soft)',
          border: '1px solid rgba(53,183,121,.22)',
          borderRadius: '20px',
          fontSize: '10px',
          fontWeight: 700,
          color: 'var(--color-success)',
          letterSpacing: '.06em',
          flexShrink: 0,
        }}
      >
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-success)', animation: 'livepulse 1.5s infinite' }} />
        LIVE
      </div>

      {/* Room name */}
      <span style={{ fontSize: '14px', fontWeight: 600, whiteSpace: 'nowrap' }}>Standup Daily</span>
      <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', whiteSpace: 'nowrap' }}>
        {participants.length} participantes
      </span>

      <div style={{ flex: 1 }} />

      {/* Timer */}
      <span
        style={{
          fontSize: '13px',
          fontFamily: 'var(--font-mono)',
          color: 'var(--color-text-secondary)',
          letterSpacing: '.04em',
          flexShrink: 0,
        }}
      >
        {timer}
      </span>

      {/* Layout toggles */}
      <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
        {LAYOUTS.map((l) => (
          <button
            key={l.key}
            onClick={() => setLayout(l.key)}
            title={l.label}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: `1px solid ${layout === l.key ? 'var(--color-accent)' : 'var(--color-border-subtle)'}`,
              background: layout === l.key ? 'var(--color-accent-soft)' : 'rgba(255,255,255,.52)',
              color: layout === l.key ? 'var(--color-accent)' : 'var(--color-text-tertiary)',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all .15s',
            }}
          >
            {l.icon}
          </button>
        ))}
      </div>

      {/* Chat toggle */}
      <button
        onClick={toggleChat}
        title="Chat"
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          border: '1px solid var(--color-border-subtle)',
          background: 'rgba(255,255,255,.52)',
          color: 'var(--color-text-tertiary)',
          fontSize: '14px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        💬
      </button>

      {/* Leave */}
      <button
        onClick={leaveRoom}
        style={{
          padding: '6px 14px',
          borderRadius: '10px',
          background: 'var(--color-danger-soft)',
          border: '1px solid var(--color-danger-border)',
          color: 'var(--color-danger)',
          fontSize: '12px',
          fontWeight: 500,
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        Sair
      </button>
    </div>
  )
}
