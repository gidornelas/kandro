import React from 'react'
import { useVoiceStore } from '../store'
import { USERS } from '../../../shared/mocks'
import { Skeleton } from '../../../design-system/Skeleton'
import { EmptyState } from '../../../design-system/EmptyState'

const VoiceTile = React.memo(function VoiceTile({ participant }: { participant: { userId: string; muted: boolean; cameraOn: boolean; sharing: boolean } }) {
  const user = USERS[participant.userId]
  const activeSpeakerId = useVoiceStore((s) => s.activeSpeakerId)
  const isSpeaking = activeSpeakerId === participant.userId

  return (
    <div
      style={{
        background: 'rgba(255,255,255,.78)',
        borderRadius: '10px',
        border: `1px solid ${isSpeaking ? 'rgba(53,183,121,.42)' : 'var(--color-border-subtle)'}`,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '120px',
        transition: 'border-color .2s, box-shadow .2s',
        boxShadow: isSpeaking ? '0 0 0 2px rgba(53,183,121,.10)' : 'none',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: user?.color || 'var(--color-accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            fontWeight: 700,
            color: '#fff',
            boxShadow: isSpeaking ? '0 0 0 3px rgba(9,10,12,.9), 0 0 0 5px var(--color-success)' : 'none',
          }}
        >
          {user?.initials}
        </div>
        <span style={{ fontSize: '11px', fontWeight: 500 }}>{user?.name}</span>
      </div>
      {participant.muted && (
        <div
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            width: '22px',
            height: '22px',
            borderRadius: '50%',
            background: 'rgba(204,75,75,.18)',
            border: '1px solid rgba(204,75,75,.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
          }}
        >
          🔇
        </div>
      )}
    </div>
  )
})

export function VoiceRoom() {
  const participants = useVoiceStore((s) => s.participants)
  const micEnabled = useVoiceStore((s) => s.micEnabled)
  const cameraEnabled = useVoiceStore((s) => s.cameraEnabled)
  const toggleMic = useVoiceStore((s) => s.toggleMic)
  const toggleCamera = useVoiceStore((s) => s.toggleCamera)
  const leaveRoom = useVoiceStore((s) => s.leaveRoom)
  const [isLoading] = React.useState(false)

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'transparent' }}>
      {/* Header */}
      <div
        style={{
          height: '52px',
          padding: '0 20px',
          background: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexShrink: 0,
          backdropFilter: 'var(--blur-panel)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '3px 10px',
            background: 'var(--color-success-soft)',
            border: '1px solid rgba(53,183,121,.22)',
            borderRadius: '20px',
            fontSize: '10px',
            fontWeight: 700,
            color: 'var(--color-success)',
            letterSpacing: '.06em',
          }}
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-success)', animation: 'livepulse 1.5s infinite' }} />
          LIVE
        </div>
        <span style={{ fontSize: '14px', fontWeight: 600 }}>Standup Daily</span>
        <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>{participants.length} participantes</span>
        <div style={{ flex: 1 }} />
        <button
          onClick={leaveRoom}
          style={{
            padding: '6px 14px',
            borderRadius: '10px',
            background: 'var(--color-danger-soft)',
            border: '1px solid var(--color-danger-border)',
            color: 'var(--color-danger)',
            fontSize: '12px',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Sair
        </button>
      </div>

      {/* Grid */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', padding: '16px', overflow: 'auto' }}>
        {isLoading ? (
          <>
            <Skeleton height={120} />
            <Skeleton height={120} />
            <Skeleton height={120} />
          </>
        ) : participants.length === 0 ? (
          <EmptyState
            icon="🎙"
            title="Ninguém na sala"
            description="Seja o primeiro a entrar na sala de voz."
          />
        ) : (
          participants.map((p) => (
            <VoiceTile key={p.userId} participant={p} />
          ))
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          height: '62px',
          background: 'var(--color-surface)',
          borderTop: '1px solid var(--color-border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          flexShrink: 0,
          backdropFilter: 'var(--blur-panel)',
        }}
      >
        <button
          onClick={toggleMic}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            border: '1px solid var(--color-border-subtle)',
            background: micEnabled ? 'var(--color-accent-soft)' : 'rgba(255,255,255,.64)',
            color: micEnabled ? 'var(--color-accent)' : 'var(--color-text-tertiary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
          }}
        >
          {micEnabled ? '🎤' : '🔇'}
        </button>
        <button
          onClick={toggleCamera}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            border: '1px solid var(--color-border-subtle)',
            background: cameraEnabled ? 'var(--color-accent-soft)' : 'rgba(255,255,255,.64)',
            color: cameraEnabled ? 'var(--color-accent)' : 'var(--color-text-tertiary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
          }}
        >
          {cameraEnabled ? '📹' : '📷'}
        </button>
      </div>
    </div>
  )
}

export default VoiceRoom
