import { useVoiceStore } from '../store'
import { VoiceTile } from './VoiceTile'

export function LayoutVoice() {
  const participants = useVoiceStore((s) => s.participants)
  const setLayout = useVoiceStore((s) => s.setLayout)
  const setActiveSpeaker = useVoiceStore((s) => s.setActiveSpeaker)

  return (
    <div
      style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '12px',
        padding: '16px',
        overflowY: 'auto',
        alignItems: 'start',
        justifyItems: 'center',
      }}
    >
      {participants.map((p) => (
        <VoiceTile
          key={p.userId}
          participant={p}
          size="md"
          onClick={() => {
            setActiveSpeaker(p.userId)
            setLayout('spotlight')
          }}
        />
      ))}
    </div>
  )
}
