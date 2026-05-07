import { useVoiceStore } from '../store'
import { fmtDuration } from '../lib/fmtDuration'
import { AppIcon } from '../../../design-system/AppIcon'

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
        minHeight: '62px',
        background: 'var(--color-surface)',
        borderTop: '1px solid var(--color-border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        flexShrink: 0,
        backdropFilter: 'var(--blur-panel)',
        position: 'relative',
        flexWrap: 'wrap',
        padding: '0 16px',
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
        <span style={{ display: 'inline-flex', color: 'var(--color-text-tertiary)' }}>
          <AppIcon name="calendar" size={12} />
        </span>
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
        <AppIcon name={micEnabled ? 'mic' : 'micOff'} size={20} />
      </ControlBtn>
      <ControlBtn active={cameraEnabled} onClick={toggleCamera} label="Câmera">
        <AppIcon name={cameraEnabled ? 'camera' : 'cameraOff'} size={20} />
      </ControlBtn>
      <ControlBtn active={screenEnabled} onClick={toggleScreen} label="Tela">
        <AppIcon name="screen" size={20} />
      </ControlBtn>
      <ControlBtn active={chatOpen} onClick={toggleChat} label="Chat">
        <AppIcon name="chat" size={20} />
      </ControlBtn>

      <button
        type="button"
        onClick={leaveRoom}
        style={{
          padding: '8px 16px',
          borderRadius: '10px',
          background: 'var(--color-danger)',
          color: '#fff',
          border: 'none',
          fontSize: '13px',
          fontWeight: 600,
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          flexShrink: 0,
        }}
      >
        <AppIcon name="logout" size={16} color="#fff" /> Sair
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
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={active}
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
        transition: 'background .15s ease, border-color .15s ease, color .15s ease',
      }}
      onFocus={(e) => {
        e.currentTarget.style.boxShadow = '0 0 0 4px rgba(47,128,237,.3)'
        e.currentTarget.style.outline = 'none'
      }}
      onBlur={(e) => {
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {children}
    </button>
  )
}
