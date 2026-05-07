import React from 'react'
import { LiveKitRoom } from '@livekit/components-react'
import { Room } from 'livekit-client'
import { useVoiceStore } from '../store'
import { Skeleton } from '../../../design-system/Skeleton'
import { EmptyState } from '../../../design-system/EmptyState'
import { Button } from '../../../design-system/Button'
import { VoiceHeader } from './VoiceHeader'
import { VoiceFooter } from './VoiceFooter'
import { RoomChatPanel } from './RoomChatPanel'
import { LayoutVoice } from './LayoutVoice'
import { LayoutGrid } from './LayoutGrid'
import { LayoutSpotlight } from './LayoutSpotlight'
import { LayoutScreen } from './LayoutScreen'
import { LiveKitStage, LiveKitVoiceSync } from './LiveKitStage'
import { useAuthStore } from '../../auth/store'
import { useSettingsStore } from '../../settings/store'
import { AppIcon } from '../../../design-system/AppIcon'

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
  const connectionState = useVoiceStore((s) => s.connectionState)
  const error = useVoiceStore((s) => s.error)
  const token = useVoiceStore((s) => s.token)
  const url = useVoiceStore((s) => s.url)
  const channelId = useVoiceStore((s) => s.channelId)
  const micEnabled = useVoiceStore((s) => s.micEnabled)
  const cameraEnabled = useVoiceStore((s) => s.cameraEnabled)
  const tickTimer = useVoiceStore((s) => s.tickTimer)
  const connect = useVoiceStore((s) => s.connect)
  const isMockMode = useAuthStore((s) => s.isMockMode)
  const isLoading = connectionState === 'connecting'

  const timerRef = React.useRef<number | null>(null)

  React.useEffect(() => {
    if (!active) return
    timerRef.current = window.setInterval(() => {
      tickTimer()
    }, 1000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [active, tickTimer])

  const ActiveLayout = LayoutMap[layout]
  const hasLiveKitRoom = Boolean(channelId && token && url && !isMockMode)
  const room = React.useMemo(() => {
    if (!hasLiveKitRoom || !token || !url) return null
    const voiceVideo = useSettingsStore.getState().voiceVideo
    return new Room({
      audioCaptureDefaults: voiceVideo.preferredMicrophoneId ? { deviceId: { exact: voiceVideo.preferredMicrophoneId } } : undefined,
      videoCaptureDefaults: voiceVideo.preferredCameraId ? { deviceId: { exact: voiceVideo.preferredCameraId } } : undefined,
      audioOutput: voiceVideo.preferredSpeakerId ? { deviceId: voiceVideo.preferredSpeakerId } : undefined,
    })
  }, [hasLiveKitRoom, token, url])

  React.useEffect(() => {
    if (!room) return
    return () => {
      void room.disconnect()
    }
  }, [room])

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'transparent', height: '100%' }}>
      <VoiceHeader />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
          {hasLiveKitRoom ? (
            connectionState === 'error' && error ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <EmptyState
                  icon={<AppIcon name="warning" size={28} />}
                  title="Não foi possível conectar"
                  description={error}
                  action={channelId ? (
                    <Button type="button" variant="primary" onClick={() => void connect(channelId)}>
                      Tentar novamente
                    </Button>
                  ) : undefined}
                />
              </div>
            ) : (
            <LiveKitRoom
              room={room ?? undefined}
              serverUrl={url ?? undefined}
              token={token ?? undefined}
              connect
              audio={micEnabled}
              video={cameraEnabled}
              style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}
              onError={(liveKitError) => {
                if (liveKitError.message === 'Client initiated disconnect') return
                useVoiceStore.setState({
                  error: liveKitError.message || 'Erro ao conectar à sala de mídia',
                  connectionState: 'error',
                })
              }}
            >
              <LiveKitVoiceSync />
              <LiveKitStage layout={layout} />
            </LiveKitRoom>
            )
          ) : isLoading ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '400px' }}>
                <Skeleton height={120} />
                <Skeleton height={120} />
              </div>
            </div>
          ) : error ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <EmptyState
                icon={<AppIcon name="warning" size={28} />}
                title="Não foi possível conectar"
                description={error}
                action={channelId ? (
                  <Button type="button" variant="primary" onClick={() => void connect(channelId)}>
                    Tentar novamente
                  </Button>
                ) : undefined}
              />
            </div>
          ) : participants.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <EmptyState icon={<AppIcon name="mic" size={28} />} title="Ninguém na sala" description="Seja o primeiro a entrar na sala de voz." />
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
