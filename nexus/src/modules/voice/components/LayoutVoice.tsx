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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '14px',
        padding: '20px',
        flexWrap: 'wrap',
        overflow: 'auto',
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
