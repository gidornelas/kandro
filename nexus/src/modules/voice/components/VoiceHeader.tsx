import { useVoiceStore } from '../store'
import { fmtDuration } from '../lib/fmtDuration'
import { useAppDataStore } from '../../app-data/store'
import { useSettingsStore } from '../../settings/store'
import { AppIcon } from '../../../design-system/AppIcon'
import type { AppIconName } from '../../../design-system/app-icon.utils'

const LAYOUTS: { key: 'voice' | 'grid' | 'spotlight' | 'screen'; label: string; icon: AppIconName }[] = [
  { key: 'voice', label: 'Voz', icon: 'mic' },
  { key: 'grid', label: 'Grid', icon: 'grid' },
  { key: 'spotlight', label: 'Destaque', icon: 'spotlight' },
  { key: 'screen', label: 'Tela', icon: 'screen' },
]

export function VoiceHeader() {
  const participants = useVoiceStore((s) => s.participants)
  const layout = useVoiceStore((s) => s.layout)
  const chatOpen = useVoiceStore((s) => s.chatOpen)
  const callDuration = useVoiceStore((s) => s.callDuration)
  const activeChannelId = useVoiceStore((s) => s.channelId)
  const setLayout = useVoiceStore((s) => s.setLayout)
  const toggleChat = useVoiceStore((s) => s.toggleChat)
  const leaveRoom = useVoiceStore((s) => s.leaveRoom)
  const openSettings = useSettingsStore((s) => s.openSettings)
  const channelName = useAppDataStore((s) => s.channels.find((channel) => channel.id === activeChannelId)?.name ?? 'Sala de voz')

  return (
    <div
      style={{
        height: '52px',
        padding: '0 16px',
        background: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border-subtle)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
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
          flexShrink: 0,
        }}
      >
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-success)', animation: 'livepulse 1.5s infinite' }} />
        LIVE
      </div>

      <span style={{ fontSize: '14px', fontWeight: 600, whiteSpace: 'nowrap' }}>{channelName}</span>
      <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', whiteSpace: 'nowrap' }}>
        {participants.length} participantes
      </span>

      <div style={{ flex: 1 }} />

      <span
        style={{
          fontSize: '13px',
          fontFamily: 'var(--font-mono)',
          color: 'var(--color-text-secondary)',
          letterSpacing: '.04em',
          flexShrink: 0,
        }}
      >
        {fmtDuration(callDuration)}
      </span>

      <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
        {LAYOUTS.map((l) => (
          <button
            key={l.key}
            type="button"
            onClick={() => setLayout(l.key)}
            title={l.label}
            aria-label={`Alterar layout para ${l.label}`}
            aria-pressed={layout === l.key}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              border: `1px solid ${layout === l.key ? 'var(--color-accent)' : 'var(--color-border-subtle)'}`,
              background: layout === l.key ? 'var(--color-accent-soft)' : 'rgba(255,255,255,.52)',
              color: layout === l.key ? 'var(--color-accent)' : 'var(--color-text-tertiary)',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background .15s ease, border-color .15s ease, color .15s ease',
            }}
          >
            <AppIcon name={l.icon} size={16} />
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={toggleChat}
        title="Chat"
        aria-label={chatOpen ? 'Fechar chat da reunião' : 'Abrir chat da reunião'}
        aria-pressed={chatOpen}
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '8px',
          border: `1px solid ${chatOpen ? 'var(--color-accent)' : 'var(--color-border-subtle)'}`,
          background: chatOpen ? 'var(--color-accent-soft)' : 'rgba(255,255,255,.52)',
          color: chatOpen ? 'var(--color-accent)' : 'var(--color-text-tertiary)',
          fontSize: '14px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background .15s ease, border-color .15s ease, color .15s ease',
        }}
      >
        <AppIcon name="chat" size={16} />
      </button>

      <button
        type="button"
        onClick={() => openSettings('voice-video')}
        title="Abrir preferências de voz e vídeo"
        aria-label="Abrir preferências de voz e vídeo"
        style={{
          minHeight: '40px',
          padding: '0 12px',
          borderRadius: '10px',
          border: '1px solid var(--color-border-subtle)',
          background: 'rgba(255,255,255,.52)',
          color: 'var(--color-text-secondary)',
          fontSize: '12px',
          fontWeight: 600,
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        A/V
      </button>

      <button
        type="button"
        onClick={leaveRoom}
        style={{
          minHeight: '40px',
          padding: '0 14px',
          borderRadius: '10px',
          background: 'var(--color-danger-soft)',
          border: '1px solid var(--color-danger-border)',
          color: 'var(--color-danger)',
          fontSize: '12px',
          fontWeight: 500,
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        Sair
      </button>
    </div>
  )
}
