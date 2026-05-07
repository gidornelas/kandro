import { useVoiceStore, type VoiceParticipant } from '../store'
import { useAppDataStore } from '../../app-data/store'
import { WaveformBars } from './WaveformBars'

export function VoiceTile({
  participant,
  size = 'md',
  onClick,
  selected = false,
  showWaveform = true,
}: {
  participant: VoiceParticipant
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
  selected?: boolean
  showWaveform?: boolean
}) {
  const user = useAppDataStore((s) => s.users[participant.userId])
  const activeSpeakerId = useVoiceStore((s) => s.activeSpeakerId)
  const isSpeaking = activeSpeakerId === participant.userId

  const sizeMap = { sm: { avatar: 40, font: 11 }, md: { avatar: 64, font: 13 }, lg: { avatar: 96, font: 16 } }
  const s = sizeMap[size]
  const Component = onClick ? 'button' : 'div'

  return (
    <Component
      {...(onClick ? { type: 'button' as const } : {})}
      onClick={onClick}
      aria-label={onClick ? `Selecionar participante ${user?.name ?? participant.userId}` : undefined}
      aria-pressed={onClick ? selected : undefined}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: size === 'lg' ? '24px' : '12px',
        borderRadius: 'var(--radius-md)',
        background: selected ? 'var(--color-accent-soft)' : isSpeaking ? 'rgba(53,183,121,.08)' : 'rgba(255,255,255,.55)',
        border: `1px solid ${selected ? 'var(--color-accent)' : isSpeaking ? 'rgba(53,183,121,.35)' : 'var(--color-border-subtle)'}`,
        transition: 'background .2s ease, border-color .2s ease, box-shadow .2s ease, transform .2s ease',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        minHeight: size === 'lg' ? '280px' : size === 'md' ? '140px' : '72px',
        flex: size === 'lg' ? 1 : undefined,
        fontFamily: 'var(--font-body)',
        textAlign: 'center',
      }}
      onMouseEnter={(e) => {
        if (!onClick) return
        e.currentTarget.style.background = 'rgba(255,255,255,.82)'
        e.currentTarget.style.borderColor = 'var(--color-border)'
        e.currentTarget.style.transform = 'translateY(-1px)'
        e.currentTarget.style.boxShadow = 'var(--shadow-soft)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = selected ? 'var(--color-accent-soft)' : isSpeaking ? 'rgba(53,183,121,.08)' : 'rgba(255,255,255,.55)'
        e.currentTarget.style.borderColor = selected ? 'var(--color-accent)' : isSpeaking ? 'rgba(53,183,121,.35)' : 'var(--color-border-subtle)'
        e.currentTarget.style.transform = 'none'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      <div
        style={{
          width: s.avatar,
          height: s.avatar,
          borderRadius: '50%',
          background: user?.color || 'var(--color-accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: size === 'lg' ? '28px' : size === 'md' ? '20px' : '14px',
          fontWeight: 700,
          color: '#fff',
          position: 'relative',
          border: participant.cameraOn ? `3px solid var(--color-success)` : '3px solid transparent',
          boxShadow: selected ? '0 0 0 4px rgba(47,128,237,.16)' : isSpeaking ? '0 0 0 4px rgba(53,183,121,.20)' : 'none',
          transition: 'box-shadow .3s, border-color .3s',
        }}
      >
        {user?.initials}
        {participant.cameraOn && (
          <span
            style={{
              position: 'absolute',
              bottom: '-4px',
              right: '-4px',
              padding: '2px 5px',
              borderRadius: '4px',
              background: 'var(--color-success)',
              color: '#fff',
              fontSize: '8px',
              fontWeight: 700,
              letterSpacing: '.04em',
            }}
          >
            CÂMERA
          </span>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ fontSize: s.font, fontWeight: 600, color: 'var(--color-text-primary)' }}>{user?.name}</span>
        {participant.muted && (
          <span
            style={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              background: 'var(--color-danger-soft)',
              border: '1px solid var(--color-danger-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '9px',
            }}
          >
            🔇
          </span>
        )}
      </div>
      {showWaveform && (
        <WaveformBars active={isSpeaking} />
      )}
    </Component>
  )
}
