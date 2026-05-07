import { useUIStore } from '../modules/ui/store'
import { useAppDataStore } from '../modules/app-data/store'
import { useSettingsStore } from '../modules/settings/store'
import { AppIcon } from '../design-system/AppIcon'
import { getChannelIconName } from '../design-system/app-icon.utils'

export function Header() {
  const mainMode = useUIStore((s) => s.mainMode)
  const activeChannelId = useUIStore((s) => s.activeChannelId)
  const activeProjectId = useUIStore((s) => s.activeProjectId)
  const channels = useAppDataStore((s) => s.channels)
  const projects = useAppDataStore((s) => s.projects)
  const openSettings = useSettingsStore((s) => s.openSettings)

  const channel = channels.find((c) =>
    mainMode === 'project'
      ? c.id === activeProjectId
      : mainMode === 'channel' || mainMode === 'voice'
        ? c.id === activeChannelId
        : false
  )
  const project = projects.find((item) => item.id === activeProjectId)

  const title = channel?.name || (mainMode === 'dm' ? 'Mensagens Diretas' : 'NEXUS')
  const iconName = mainMode === 'dm' ? 'dm' : getChannelIconName(channel?.type)
  const desc = channel?.desc || ''

  return (
    <div
      style={{
        height: '48px',
        background: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border-subtle)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: '12px',
        flexShrink: 0,
        backdropFilter: 'var(--blur-panel)',
        WebkitBackdropFilter: 'var(--blur-panel)',
      }}
    >
      <span style={{ display: 'inline-flex', color: 'var(--color-text-secondary)' }}>
        <AppIcon name={iconName} size={18} />
      </span>
      <div
        style={{
          fontSize: '14px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          letterSpacing: '-0.01em',
        }}
      >
        {title}
        {mainMode === 'project' && (
          <span
            style={{
              fontSize: '10px',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: '999px',
              background: 'var(--color-accent-soft)',
              border: '1px solid var(--color-accent-border)',
              color: 'var(--color-accent)',
              letterSpacing: '.03em',
            }}
          >
            {project?.status ?? 'Em andamento'}
          </span>
        )}
      </div>
      {desc && (
        <>
          <span
            style={{
              width: '1px',
              height: '16px',
              background: 'var(--color-border)',
            }}
          />
          <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>{desc}</span>
        </>
      )}
      <div style={{ flex: 1 }} />
      <button
        type="button"
        onClick={() => openSettings('appearance')}
        aria-label="Abrir configurações"
        style={{
          minHeight: '34px',
          padding: '0 12px',
          borderRadius: '10px',
          border: '1px solid var(--color-border-subtle)',
          background: 'rgba(255,255,255,.42)',
          color: 'var(--color-text-secondary)',
          fontSize: '12px',
          fontWeight: 600,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          transition: 'background .18s ease, border-color .18s ease, color .18s ease',
        }}
      >
        <span aria-hidden="true" style={{ display: 'inline-flex' }}>
          <AppIcon name="settings" size={16} />
        </span>
        Configurações
      </button>
    </div>
  )
}
