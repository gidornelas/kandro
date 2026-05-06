import { useUIStore } from '../modules/ui/store'
import { useAppDataStore } from '../modules/app-data/store'

export function Header() {
  const mainMode = useUIStore((s) => s.mainMode)
  const activeChannelId = useUIStore((s) => s.activeChannelId)
  const activeProjectId = useUIStore((s) => s.activeProjectId)
  const channels = useAppDataStore((s) => s.channels)
  const projects = useAppDataStore((s) => s.projects)

  const channel = channels.find((c) =>
    mainMode === 'project'
      ? c.id === activeProjectId
      : mainMode === 'channel' || mainMode === 'voice'
        ? c.id === activeChannelId
        : false
  )
  const project = projects.find((item) => item.id === activeProjectId)

  const title = channel?.name || (mainMode === 'dm' ? 'Mensagens Diretas' : 'NEXUS')
  const icon = channel?.icon || (mainMode === 'dm' ? '✉' : '#')
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
      <span style={{ fontSize: '16px' }}>{icon}</span>
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
    </div>
  )
}
