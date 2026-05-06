import React from 'react'
import { useVoiceStore } from '../store'
import { Skeleton } from '../../../design-system/Skeleton'
import { EmptyState } from '../../../design-system/EmptyState'
import { VoiceHeader } from './VoiceHeader'
import { VoiceFooter } from './VoiceFooter'
import { RoomChatPanel } from './RoomChatPanel'
import { LayoutVoice } from './LayoutVoice'
import { LayoutGrid } from './LayoutGrid'
import { LayoutSpotlight } from './LayoutSpotlight'
import { LayoutScreen } from './LayoutScreen'

const LayoutMap = {
  voice: LayoutVoice,
  grid: LayoutGrid,
  spotlight: LayoutSpotlight,
  screen: LayoutScreen,
}

export function VoiceRoom() {
  const layout = useVoiceStore((s) => s.layout)
  const active = useVoiceStore((s) => s.active)
  const participants = useVoiceStore((s) => s.participants)
  const tickTimer = useVoiceStore((s) => s.tickTimer)
  const setActiveSpeaker = useVoiceStore((s) => s.setActiveSpeaker)
  const [isLoading] = React.useState(false)

  const timerRef = React.useRef<number | null>(null)
  const waveRef = React.useRef<number | null>(null)

  React.useEffect(() => {
    if (!active) return
    timerRef.current = window.setInterval(() => {
      tickTimer()
    }, 1000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [active, tickTimer])

  React.useEffect(() => {
    if (!active) return
    const speakers = ['rc', 'al', 'jl']
    let idx = 0
    waveRef.current = window.setInterval(() => {
      idx = (idx + 1) % speakers.length
      setActiveSpeaker(speakers[idx])
    }, 3000)
    return () => {
      if (waveRef.current) clearInterval(waveRef.current)
    }
  }, [active, setActiveSpeaker])

  const ActiveLayout = LayoutMap[layout]

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'transparent', height: '100%' }}>
      <VoiceHeader />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
          {isLoading ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '400px' }}>
                <Skeleton height={120} />
                <Skeleton height={120} />
              </div>
            </div>
          ) : participants.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <EmptyState icon="🎙" title="Ninguém na sala" description="Seja o primeiro a entrar na sala de voz." />
            </div>
          ) : (
            <ActiveLayout />
          )}
          <VoiceFooter />
        </div>

        <RoomChatPanel />
      </div>
    </div>
  )
}

export default VoiceRoom
