import React from 'react'
import { useUIStore } from '../modules/ui/store'
import { useAuthStore } from '../modules/auth/store'
import { useVoiceStore } from '../modules/voice/store'
import { CHANNELS, DMS, USERS } from '../shared/mocks'

function StatusDot({ status }: { status?: string }) {
  const color = status === 'online' ? 'var(--color-success)' : status === 'busy' ? 'var(--color-danger)' : status === 'away' ? 'var(--color-warning)' : 'var(--color-text-tertiary)'
  return (
    <span
      style={{
        position: 'absolute',
        bottom: '-1px',
        right: '-1px',
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        background: color,
        border: '1.5px solid var(--color-surface)',
      }}
    />
  )
}

function Section({ id, label, children, action }: { id: string; label: string; children: React.ReactNode; action?: React.ReactNode }) {
  const collapsed = useUIStore((s) => s.collapsedSections.has(id))
  const toggle = useUIStore((s) => s.toggleSection)

  return (
    <div style={{ marginBottom: '4px' }}>
      <div
        onClick={() => toggle(id)}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '5px 14px',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <span
          style={{
            fontSize: '10px',
            fontWeight: 600,
            letterSpacing: '.08em',
            textTransform: 'uppercase',
            color: 'var(--color-text-tertiary)',
            flex: 1,
            transition: 'color .15s',
          }}
        >
          {label}
        </span>
        {action}
        <span
          style={{
            fontSize: '9px',
            color: 'var(--color-text-tertiary)',
            transition: 'transform .2s',
            transform: collapsed ? 'rotate(-90deg)' : 'none',
            marginLeft: '4px',
          }}
        >
          ▾
        </span>
      </div>
      {!collapsed && (
        <div style={{ padding: '0 8px', display: 'flex', flexDirection: 'column', gap: '1px' }}>
          {children}
        </div>
      )}
    </div>
  )
}

function SidebarItem({
  icon,
  label,
  badge,
  active,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  badge?: number
  active?: boolean
  onClick?: () => void
}) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '7px 9px',
        borderRadius: 'var(--radius-sm)',
        cursor: 'pointer',
        color: active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
        fontSize: '13px',
        transition: 'all .15s',
        position: 'relative',
        background: active ? 'var(--color-accent-soft)' : 'transparent',
        border: active ? '1px solid var(--color-accent-border)' : '1px solid transparent',
      }}
    >
      {active && (
        <span
          style={{
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            width: '3px',
            height: '50%',
            borderRadius: '3px',
            background: 'var(--color-accent)',
          }}
        />
      )}
      <span style={{ fontSize: '14px', width: '18px', textAlign: 'center', flexShrink: 0 }}>{icon}</span>
      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
      {badge ? (
        <span
          style={{
            fontSize: '10px',
            fontWeight: 700,
            padding: '1px 5px',
            borderRadius: '999px',
            background: 'var(--color-accent)',
            color: '#fff',
            flexShrink: 0,
          }}
        >
          {badge}
        </span>
      ) : null}
    </div>
  )
}

export function Sidebar({ width }: { width: number }) {
  const user = useAuthStore((s) => s.user)
  const activeChannelId = useUIStore((s) => s.activeChannelId)
  const activeDmId = useUIStore((s) => s.activeDmId)
  const activeProjectId = useUIStore((s) => s.activeProjectId)
  const openChannel = useUIStore((s) => s.openChannel)
  const openDm = useUIStore((s) => s.openDm)
  const openProject = useUIStore((s) => s.openProject)
  const openVoice = useUIStore((s) => s.openVoice)
  const joinRoom = useVoiceStore((s) => s.joinRoom)

  const projectChannels = CHANNELS.filter((c) => c.type === 'board')
  const textChannels = CHANNELS.filter((c) => c.type === 'text')
  const voiceChannels = CHANNELS.filter((c) => c.type === 'voice')

  return (
    <div
      style={{
        width: `${width}px`,
        flexShrink: 0,
        background: 'var(--color-surface)',
        borderRight: '1px solid var(--color-border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
        backdropFilter: 'var(--blur-panel)',
        WebkitBackdropFilter: 'var(--blur-panel)',
      }}
    >
      {/* Workspace header */}
      <div
        style={{
          height: '48px',
          display: 'flex',
          alignItems: 'center',
          padding: '0 14px',
          gap: '10px',
          borderBottom: '1px solid var(--color-border-subtle)',
          flexShrink: 0,
          cursor: 'pointer',
        }}
      >
        <div
          style={{
            width: '26px',
            height: '26px',
            borderRadius: '7px',
            background: 'var(--color-accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
            fontWeight: 700,
            color: '#fff',
            flexShrink: 0,
          }}
        >
          A
        </div>
        <span style={{ fontSize: '13px', fontWeight: 600, flex: 1 }}>Acme Design Co.</span>
        <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)' }}>⌄</span>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0 44px' }}>
        <Section id="proj" label="Projetos">
          {projectChannels.map((ch) => (
            <SidebarItem
              key={ch.id}
              icon="◈"
              label={ch.name}
              active={activeProjectId === ch.id}
              onClick={() => openProject(ch.id)}
            />
          ))}
        </Section>

        <Section id="com" label="Comunicação">
          {textChannels.map((ch) => (
            <SidebarItem
              key={ch.id}
              icon="#"
              label={ch.name}
              badge={ch.badge}
              active={activeChannelId === ch.id}
              onClick={() => openChannel(ch.id)}
            />
          ))}
        </Section>

        <Section id="voz" label="Voz & Reuniões">
          {voiceChannels.map((ch) => (
            <SidebarItem
              key={ch.id}
              icon="🔊"
              label={ch.name}
              active={activeChannelId === ch.id}
              onClick={() => {
                openVoice(ch.id)
                joinRoom(ch.id)
              }}
            />
          ))}
        </Section>

        <Section id="dm" label="Diretos">
          {DMS.map((dm) => {
            const u = USERS[dm.userId]
            return (
              <SidebarItem
                key={dm.id}
                icon={
                  <div style={{ position: 'relative' }}>
                    <div
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        background: u?.color || 'var(--color-accent)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '7px',
                        fontWeight: 700,
                        color: '#fff',
                      }}
                    >
                      {u?.initials}
                    </div>
                    <StatusDot status={u?.status} />
                  </div>
                }
                label={u?.name || dm.userId}
                badge={dm.unread || undefined}
                active={activeDmId === dm.id}
                onClick={() => openDm(dm.id)}
              />
            )
          })}
        </Section>
      </div>

      {/* User bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: `${width}px`,
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          gap: '9px',
          padding: '0 12px',
          background: 'var(--color-surface)',
          borderTop: '1px solid var(--color-border-subtle)',
        }}
      >
        <div
          style={{
            width: '26px',
            height: '26px',
            borderRadius: '50%',
            background: user?.color || 'var(--color-accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            fontWeight: 700,
            color: '#fff',
            position: 'relative',
            flexShrink: 0,
          }}
        >
          {user?.initials || '?'}
          <StatusDot status={user?.status} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '12px', fontWeight: 600 }}>{user?.name || 'Usuário'}</div>
          <div style={{ fontSize: '10px', color: 'var(--color-text-tertiary)' }}>{user?.role || 'Membro'}</div>
        </div>
      </div>
    </div>
  )
}
