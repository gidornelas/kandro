import React from 'react'
import type { TrackReference } from '@livekit/components-core'
import { RoomAudioRenderer, VideoTrack, useConnectionState, useLocalParticipant, useParticipants, useRoomContext, useTracks } from '@livekit/components-react'
import { ConnectionState as LiveKitConnectionState, RoomEvent, Track, type Participant } from 'livekit-client'
import { useAppDataStore } from '../../app-data/store'
import { useSettingsStore } from '../../settings/store'
import { useVoiceStore } from '../store'
import { AppIcon } from '../../../design-system/AppIcon'

function mapConnectionState(state: LiveKitConnectionState) {
  if (state === LiveKitConnectionState.Connected) return 'connected'
  if (state === LiveKitConnectionState.Disconnected) return 'idle'
  return 'connecting'
}

function useParticipantTracks() {
  const participants = useParticipants({ updateOnlyOn: [] })
  const trackRefs = useTracks([Track.Source.Camera, Track.Source.ScreenShare], { updateOnlyOn: [] })

  const getTrackRef = React.useCallback(
    (participantId: string, source: Track.Source.Camera | Track.Source.ScreenShare) =>
      trackRefs.find((trackRef) => trackRef.participant.identity === participantId && trackRef.source === source),
    [trackRefs],
  )

  return { participants, getTrackRef }
}

function ParticipantFallback({ participant, large = false }: { participant: Participant; large?: boolean }) {
  const user = useAppDataStore((s) => s.users[participant.identity])

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(180deg, rgba(255,255,255,.14), rgba(0,0,0,.18))',
      }}
    >
      <div
        style={{
          width: large ? '92px' : '64px',
          height: large ? '92px' : '64px',
          borderRadius: '50%',
          background: user?.color || 'var(--color-accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: large ? '28px' : '20px',
          fontWeight: 700,
          boxShadow: '0 18px 48px rgba(0,0,0,.2)',
        }}
      >
        {user?.initials || participant.name?.slice(0, 2).toUpperCase() || '?'}
      </div>
    </div>
  )
}

function ParticipantMediaTile({
  participant,
  trackRef,
  size = 'md',
  selected = false,
  onClick,
}: {
  participant: Participant
  trackRef?: TrackReference
  size?: 'sm' | 'md' | 'lg'
  selected?: boolean
  onClick?: () => void
}) {
  const user = useAppDataStore((s) => s.users[participant.identity])
  const Component = onClick ? 'button' : 'div'
  const minHeight = size === 'lg' ? '280px' : size === 'md' ? '180px' : '84px'

  return (
    <Component
      {...(onClick ? { type: 'button' as const } : {})}
      onClick={onClick}
      aria-label={onClick ? `Selecionar participante ${user?.name || participant.name || participant.identity}` : undefined}
      aria-pressed={onClick ? selected : undefined}
      style={{
        position: 'relative',
        width: '100%',
        minHeight,
        borderRadius: '16px',
        overflow: 'hidden',
        border: `1px solid ${selected ? 'var(--color-accent)' : participant.isSpeaking ? 'rgba(53,183,121,.42)' : 'var(--color-border-subtle)'}`,
        background: selected ? 'var(--color-accent-soft)' : 'rgba(255,255,255,.42)',
        cursor: onClick ? 'pointer' : 'default',
        padding: 0,
        textAlign: 'left',
        fontFamily: 'var(--font-body)',
        transition: 'transform .18s ease, box-shadow .18s ease, border-color .18s ease, background .18s ease',
        boxShadow: participant.isSpeaking ? '0 0 0 3px rgba(53,183,121,.12)' : 'none',
      }}
      onMouseEnter={(event) => {
        if (!onClick) return
        event.currentTarget.style.transform = 'translateY(-1px)'
        event.currentTarget.style.boxShadow = 'var(--shadow-soft)'
      }}
      onMouseLeave={(event) => {
        if (!onClick) return
        event.currentTarget.style.transform = 'none'
        event.currentTarget.style.boxShadow = participant.isSpeaking ? '0 0 0 3px rgba(53,183,121,.12)' : 'none'
      }}
    >
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(255,255,255,.08), rgba(15,23,42,.14))' }} />
      {trackRef ? (
        <VideoTrack
          trackRef={trackRef}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            background: 'rgba(255,255,255,.12)',
          }}
        />
      ) : (
        <ParticipantFallback participant={participant} large={size === 'lg'} />
      )}
      <div
        style={{
          position: 'absolute',
          inset: 'auto 0 0 0',
          padding: '10px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          background: 'linear-gradient(180deg, rgba(0,0,0,0), rgba(10,15,25,.72))',
          color: '#fff',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
          <span style={{ fontSize: size === 'sm' ? '11px' : '13px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.name || participant.name || participant.identity}
          </span>
          <span style={{ fontSize: '10px', opacity: 0.78 }}>
            {participant.isSpeaking ? 'Falando' : participant.isMicrophoneEnabled ? 'No ar' : 'Microfone desligado'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          {!participant.isMicrophoneEnabled && <AppIcon name="micOff" size={12} color="#fff" />}
          {participant.isCameraEnabled && <AppIcon name="camera" size={12} color="#fff" />}
          {participant.isScreenShareEnabled && <AppIcon name="screen" size={12} color="#fff" />}
        </div>
      </div>
    </Component>
  )
}

export function LiveKitVoiceSync() {
  const room = useRoomContext()
  const connectionState = useConnectionState()
  const { localParticipant } = useLocalParticipant()
  const { participants } = useParticipantTracks()
  const desiredMicEnabled = useVoiceStore((s) => s.micEnabled)
  const desiredCameraEnabled = useVoiceStore((s) => s.cameraEnabled)
  const desiredScreenEnabled = useVoiceStore((s) => s.screenEnabled)
  const preferredMicrophoneId = useSettingsStore((s) => s.voiceVideo.preferredMicrophoneId)
  const preferredCameraId = useSettingsStore((s) => s.voiceVideo.preferredCameraId)
  const preferredSpeakerId = useSettingsStore((s) => s.voiceVideo.preferredSpeakerId)

  React.useEffect(() => {
    const nextParticipants = participants.map((participant) => ({
      userId: participant.identity,
      muted: !participant.isMicrophoneEnabled,
      cameraOn: participant.isCameraEnabled,
      sharing: participant.isScreenShareEnabled,
    }))
    const activeSpeakerId = room.activeSpeakers[0]?.identity ?? participants.find((participant) => participant.isSpeaking)?.identity ?? participants[0]?.identity ?? ''
    const screenSharerId = participants.find((participant) => participant.isScreenShareEnabled)?.identity ?? null
    useVoiceStore.setState({
      participants: nextParticipants,
      active: connectionState === LiveKitConnectionState.Connected,
      connectionState: mapConnectionState(connectionState),
      activeSpeakerId,
      screenSharerId,
      micEnabled: localParticipant.isMicrophoneEnabled,
      cameraEnabled: localParticipant.isCameraEnabled,
      screenEnabled: localParticipant.isScreenShareEnabled,
    })
  }, [connectionState, localParticipant.isCameraEnabled, localParticipant.isMicrophoneEnabled, localParticipant.isScreenShareEnabled, participants, room.activeSpeakers])

  React.useEffect(() => {
    if (localParticipant.isMicrophoneEnabled === desiredMicEnabled) return
    void localParticipant.setMicrophoneEnabled(desiredMicEnabled).catch(() => {
      useVoiceStore.setState({ error: 'Não foi possível controlar o microfone', connectionState: 'error' })
    })
  }, [desiredMicEnabled, localParticipant])

  React.useEffect(() => {
    if (localParticipant.isCameraEnabled === desiredCameraEnabled) return
    void localParticipant.setCameraEnabled(desiredCameraEnabled).catch(() => {
      useVoiceStore.setState({ error: 'Não foi possível controlar a câmera', connectionState: 'error' })
    })
  }, [desiredCameraEnabled, localParticipant])

  React.useEffect(() => {
    if (localParticipant.isScreenShareEnabled === desiredScreenEnabled) return
    void localParticipant.setScreenShareEnabled(desiredScreenEnabled).catch(() => {
      useVoiceStore.setState({ error: 'Não foi possível compartilhar a tela', connectionState: 'error' })
    })
  }, [desiredScreenEnabled, localParticipant])

  React.useEffect(() => {
    const handleActiveSpeakers = () => {
      const activeSpeakerId = room.activeSpeakers[0]?.identity ?? ''
      if (activeSpeakerId) useVoiceStore.setState({ activeSpeakerId })
    }
    room.on(RoomEvent.ActiveSpeakersChanged, handleActiveSpeakers)
    return () => {
      room.off(RoomEvent.ActiveSpeakersChanged, handleActiveSpeakers)
    }
  }, [room])

  React.useEffect(() => {
    if (connectionState !== LiveKitConnectionState.Connected) return
    const desiredDeviceId = preferredMicrophoneId ?? 'default'
    const currentDeviceId = room.getActiveDevice('audioinput') ?? 'default'
    if (currentDeviceId === desiredDeviceId) return
    void room.switchActiveDevice('audioinput', desiredDeviceId, desiredDeviceId !== 'default').catch((error) => {
      useVoiceStore.setState({ error: error instanceof Error ? error.message : 'Não foi possível trocar o microfone' })
    })
  }, [connectionState, preferredMicrophoneId, room])

  React.useEffect(() => {
    if (connectionState !== LiveKitConnectionState.Connected) return
    const desiredDeviceId = preferredCameraId ?? 'default'
    const currentDeviceId = room.getActiveDevice('videoinput') ?? 'default'
    if (currentDeviceId === desiredDeviceId) return
    void room.switchActiveDevice('videoinput', desiredDeviceId, desiredDeviceId !== 'default').catch((error) => {
      useVoiceStore.setState({ error: error instanceof Error ? error.message : 'Não foi possível trocar a câmera' })
    })
  }, [connectionState, preferredCameraId, room])

  React.useEffect(() => {
    if (connectionState !== LiveKitConnectionState.Connected) return
    const desiredDeviceId = preferredSpeakerId ?? 'default'
    const currentDeviceId = room.getActiveDevice('audiooutput') ?? 'default'
    if (currentDeviceId === desiredDeviceId) return
    void room.switchActiveDevice('audiooutput', desiredDeviceId, desiredDeviceId !== 'default').catch((error) => {
      useVoiceStore.setState({ error: error instanceof Error ? error.message : 'Não foi possível trocar o alto-falante' })
    })
  }, [connectionState, preferredSpeakerId, room])

  return <RoomAudioRenderer />
}

export function LiveKitStage({ layout }: { layout: 'voice' | 'grid' | 'spotlight' | 'screen' }) {
  const activeSpeakerId = useVoiceStore((s) => s.activeSpeakerId)
  const screenSharerId = useVoiceStore((s) => s.screenSharerId)
  const setLayout = useVoiceStore((s) => s.setLayout)
  const setActiveSpeaker = useVoiceStore((s) => s.setActiveSpeaker)
  const setScreenSharer = useVoiceStore((s) => s.setScreenSharer)
  const { participants, getTrackRef } = useParticipantTracks()

  if (layout === 'voice') {
    return (
      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '14px',
          padding: '20px',
          overflow: 'auto',
        }}
      >
        {participants.map((participant) => (
          <ParticipantMediaTile
            key={participant.identity}
            participant={participant}
            size="md"
            selected={participant.identity === activeSpeakerId}
            trackRef={getTrackRef(participant.identity, Track.Source.Camera)}
            onClick={() => {
              setActiveSpeaker(participant.identity)
              setLayout('spotlight')
            }}
          />
        ))}
      </div>
    )
  }

  if (layout === 'grid') {
    return (
      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: '12px',
          padding: '20px',
          overflow: 'auto',
        }}
      >
        {participants.slice(0, 4).map((participant) => (
          <ParticipantMediaTile
            key={participant.identity}
            participant={participant}
            size="lg"
            selected={participant.identity === activeSpeakerId}
            trackRef={getTrackRef(participant.identity, Track.Source.Camera)}
            onClick={() => {
              setActiveSpeaker(participant.identity)
              setLayout('spotlight')
            }}
          />
        ))}
      </div>
    )
  }

  if (layout === 'screen') {
    const sharer = participants.find((participant) => participant.identity === screenSharerId) ?? participants.find((participant) => participant.isScreenShareEnabled)
    const sharerTrack = sharer ? getTrackRef(sharer.identity, Track.Source.ScreenShare) : undefined

    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
        <div
          style={{
            flex: 1,
            minHeight: 0,
            margin: '12px',
            borderRadius: '18px',
            overflow: 'hidden',
            border: '1px solid var(--color-border-subtle)',
            background: 'rgba(255,255,255,.22)',
            position: 'relative',
          }}
        >
          {sharer && sharerTrack ? (
            <ParticipantMediaTile participant={sharer} trackRef={sharerTrack} size="lg" />
          ) : (
            <div
              style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-text-tertiary)',
                background: 'linear-gradient(180deg, rgba(255,255,255,.14), rgba(15,23,42,.08))',
              }}
            >
              Nenhum participante está compartilhando a tela
            </div>
          )}
        </div>
        <div
          style={{
            height: '96px',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '0 16px 12px',
            overflowX: 'auto',
          }}
        >
          {participants.map((participant) => (
            <div key={participant.identity} style={{ width: '164px', flexShrink: 0 }}>
              <ParticipantMediaTile
                participant={participant}
                size="sm"
                selected={participant.identity === sharer?.identity}
                trackRef={getTrackRef(participant.identity, Track.Source.Camera)}
                onClick={() => {
                  setScreenSharer(participant.identity)
                  setActiveSpeaker(participant.identity)
                }}
              />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const activeParticipant = participants.find((participant) => participant.identity === activeSpeakerId) ?? participants[0]
  const others = participants.filter((participant) => participant.identity !== activeParticipant?.identity)

  return (
    <div style={{ flex: 1, display: 'flex', gap: '12px', padding: '16px', overflow: 'hidden' }}>
      <div style={{ flex: 3, minWidth: 0 }}>
        {activeParticipant ? (
          <ParticipantMediaTile
            participant={activeParticipant}
            size="lg"
            selected
            trackRef={getTrackRef(activeParticipant.identity, Track.Source.Camera)}
          />
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
      <div
        style={{
          flex: 1,
          minWidth: '180px',
          maxWidth: '220px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          overflowY: 'auto',
        }}
      >
        {others.map((participant) => (
          <ParticipantMediaTile
            key={participant.identity}
            participant={participant}
            size="sm"
            trackRef={getTrackRef(participant.identity, Track.Source.Camera)}
            onClick={() => setActiveSpeaker(participant.identity)}
          />
        ))}
      </div>
    </div>
  )
}
