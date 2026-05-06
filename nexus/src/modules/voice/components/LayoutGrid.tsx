import { useVoiceStore } from '../store'
import { VoiceTile } from './VoiceTile'

export function LayoutGrid() {
  const participants = useVoiceStore((s) => s.participants)
  const setLayout = useVoiceStore((s) => s.setLayout)
  const setActiveSpeaker = useVoiceStore((s) => s.setActiveSpeaker)

  return (
    <div
      style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gridTemplateRows: 'repeat(2, 1fr)',
        gap: '12px',
        padding: '20px',
        overflow: 'auto',
      }}
    >
      {participants.slice(0, 4).map((p) => (
        <VoiceTile
          key={p.userId}
          participant={p}
          size="lg"
          onClick={() => {
            setActiveSpeaker(p.userId)
            setLayout('spotlight')
          }}
        />
      ))}
    </div>
  )
}
