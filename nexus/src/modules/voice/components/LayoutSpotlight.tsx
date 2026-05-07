import { useVoiceStore } from '../store'
import { VoiceTile } from './VoiceTile'

export function LayoutSpotlight() {
  const participants = useVoiceStore((s) => s.participants)
  const activeSpeakerId = useVoiceStore((s) => s.activeSpeakerId)
  const setActiveSpeaker = useVoiceStore((s) => s.setActiveSpeaker)

  const activeParticipant = participants.find((p) => p.userId === activeSpeakerId)
  const others = participants.filter((p) => p.userId !== activeSpeakerId)

  return (
    <div style={{ flex: 1, display: 'flex', gap: '12px', padding: '16px', overflow: 'hidden' }}>
      {/* Main speaker */}
      <div style={{ flex: 3, minWidth: 0 }}>
        {activeParticipant ? (
          <VoiceTile participant={activeParticipant} size="lg" showWaveform />
        ) : (
          <div
            style={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255,255,255,.32)',
              border: '1px dashed var(--color-border)',
              color: 'var(--color-text-tertiary)',
              fontSize: '14px',
            }}
          >
            Selecione um participante
          </div>
        )}
      </div>

      {/* Thumbnails sidebar */}
      <div
        style={{
          flex: 1,
          minWidth: '140px',
          maxWidth: '180px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          overflowY: 'auto',
        }}
      >
        {others.map((p) => (
          <VoiceTile
            key={p.userId}
            participant={p}
            size="sm"
            showWaveform={false}
            onClick={() => setActiveSpeaker(p.userId)}
          />
        ))}
      </div>
    </div>
  )
}
