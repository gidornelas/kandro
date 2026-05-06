import { useVoiceStore } from '../store'
import { fmtDuration } from '../lib/fmtDuration'

export function VoiceFooter() {
  const micEnabled = useVoiceStore((s) => s.micEnabled)
  const cameraEnabled = useVoiceStore((s) => s.cameraEnabled)
  const screenEnabled = useVoiceStore((s) => s.screenEnabled)
  const chatOpen = useVoiceStore((s) => s.chatOpen)
  const callDuration = useVoiceStore((s) => s.callDuration)
  const toggleMic = useVoiceStore((s) => s.toggleMic)
  const toggleCamera = useVoiceStore((s) => s.toggleCamera)
  const toggleScreen = useVoiceStore((s) => s.toggleScreen)
  const toggleChat = useVoiceStore((s) => s.toggleChat)
  const leaveRoom = useVoiceStore((s) => s.leaveRoom)

  return (
    <div
      style={{
        height: '62px',
        background: 'var(--color-surface)',
        borderTop: '1px solid var(--color-border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        flexShrink: 0,
        backdropFilter: 'var(--blur-panel)',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>⏱</span>
        <span
          style={{
            fontSize: '13px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--color-text-secondary)',
            letterSpacing: '.04em',
          }}
        >
          {fmtDuration(callDuration)}
        </span>
      </div>

      <ControlBtn active={micEnabled} onClick={toggleMic} label="Mic">
        {micEnabled ? '🎤' : '🔇'}
      </ControlBtn>
      <ControlBtn active={cameraEnabled} onClick={toggleCamera} label="Câmera">
        {cameraEnabled ? '📹' : '📷'}
      </ControlBtn>
      <ControlBtn active={screenEnabled} onClick={toggleScreen} label="Tela">
        🖥
      </ControlBtn>
      <ControlBtn active={chatOpen} onClick={toggleChat} label="Chat">
        💬
      </ControlBtn>

      <button
        onClick={leaveRoom}
        style={{
          position: 'absolute',
          right: '16px',
          padding: '8px 18px',
          borderRadius: '10px',
          background: 'var(--color-danger)',
          color: '#fff',
          border: 'none',
          fontSize: '13px',
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <span>🔴</span> Sair
      </button>
    </div>
  )
}

function ControlBtn({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean
  onClick: () => void
  label: string
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      style={{
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        border: `1px solid ${active ? 'transparent' : 'var(--color-border-subtle)'}`,
        background: active ? 'var(--color-accent)' : 'rgba(255,255,255,.64)',
        color: active ? '#fff' : 'var(--color-text-tertiary)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px',
        transition: 'all .15s',
      }}
    >
      {children}
    </button>
  )
}
