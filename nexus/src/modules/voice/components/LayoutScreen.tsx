import { useVoiceStore } from '../store'
import { useAppDataStore } from '../../app-data/store'
import { VoiceTile } from './VoiceTile'
import { ScreenShareMock } from './ScreenShareMock'

export function LayoutScreen() {
  const participants = useVoiceStore((s) => s.participants)
  const screenSharerId = useVoiceStore((s) => s.screenSharerId)
  const setScreenSharer = useVoiceStore((s) => s.setScreenSharer)
  const setActiveSpeaker = useVoiceStore((s) => s.setActiveSpeaker)
  const users = useAppDataStore((s) => s.users)

  const sharer = participants.find((p) => p.userId === screenSharerId)
  const sharerName = sharer ? users[sharer.userId]?.name || 'Desconhecido' : 'Desconhecido'

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
      <div style={{ flex: 1, position: 'relative', padding: '12px', minHeight: 0 }}>
        <ScreenShareMock userName={sharerName} />

        {sharer && (
          <div
            style={{
              position: 'absolute',
              bottom: '20px',
              right: '20px',
              width: '160px',
            }}
          >
            <VoiceTile participant={sharer} size="sm" />
            <div
              style={{
                position: 'absolute',
                top: '-6px',
                left: '50%',
                transform: 'translateX(-50%)',
                padding: '2px 8px',
                borderRadius: '4px',
                background: 'var(--color-accent)',
                color: '#fff',
                fontSize: '9px',
                fontWeight: 700,
                letterSpacing: '.04em',
                whiteSpace: 'nowrap',
              }}
            >
              Transmitindo
            </div>
          </div>
        )}
      </div>

      <div
        style={{
          height: '90px',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '0 16px',
          background: 'var(--color-surface)',
          borderTop: '1px solid var(--color-border-subtle)',
          overflowX: 'auto',
        }}
      >
        {participants.map((p) => (
          <VoiceTile
            key={p.userId}
            participant={p}
            size="sm"
            selected={p.userId === screenSharerId}
            showWaveform={false}
            onClick={() => {
              setScreenSharer(p.userId)
              setActiveSpeaker(p.userId)
            }}
          />
        ))}
      </div>
    </div>
  )
}
