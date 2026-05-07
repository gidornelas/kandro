import React from 'react'
import { useUIStore } from '../modules/ui/store'
import { useAuthStore } from '../modules/auth/store'
import { useVoiceStore } from '../modules/voice/store'
import { useAppDataStore } from '../modules/app-data/store'
import { hasPermissionAction, resolveMemberPermission } from '../modules/permissions/utils'
import { AppIcon } from '../design-system/AppIcon'

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
  const contentId = `${id}-section-content`

  return (
    <div style={{ marginBottom: '4px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          padding: '0 14px',
        }}
      >
        <button
          type="button"
          onClick={() => toggle(id)}
          aria-expanded={!collapsed}
          aria-controls={contentId}
          style={{
            display: 'flex',
            alignItems: 'center',
            flex: 1,
            minHeight: '28px',
            cursor: 'pointer',
            userSelect: 'none',
            background: 'transparent',
            border: 'none',
            fontFamily: 'var(--font-body)',
            textAlign: 'left',
            padding: '5px 0',
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
            }}
          >
            {label}
          </span>
          <span
            style={{
              fontSize: '9px',
              color: 'var(--color-text-tertiary)',
              transition: 'transform .2s',
              transform: collapsed ? 'rotate(-90deg)' : 'none',
              marginLeft: '4px',
            }}
          >
            <AppIcon name="chevronDown" size={12} />
          </span>
        </button>
        {action}
      </div>
      {!collapsed && (
        <div id={contentId} style={{ padding: '0 8px', display: 'flex', flexDirection: 'column', gap: '1px' }}>
          {children}
        </div>
      )}
    </div>
  )
}

function SectionActionButton({ label, onClick }: { label: string; onClick: (event: React.MouseEvent<HTMLButtonElement>) => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      style={{
        width: '18px',
        height: '18px',
        borderRadius: '6px',
        border: '1px solid var(--color-border-subtle)',
        background: 'rgba(255,255,255,.42)',
        color: 'var(--color-text-tertiary)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '11px',
        cursor: 'pointer',
        flexShrink: 0,
        marginRight: '4px',
      }}
    >
      <AppIcon name="plus" size={12} />
    </button>
  )
}

function InlineCreateForm({
  value,
  placeholder,
  error,
  onChange,
  onConfirm,
  onCancel,
}: {
  value: string
  placeholder: string
  error: string | null
  onChange: (value: string) => void
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div style={{ padding: '4px 6px 8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <input
        autoFocus
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') onConfirm()
          if (event.key === 'Escape') onCancel()
        }}
        style={{
          width: '100%',
          minHeight: '36px',
          padding: '0 10px',
          borderRadius: '10px',
          border: '1px solid var(--color-accent-border)',
          background: 'rgba(255,255,255,.82)',
          color: 'var(--color-text-primary)',
          fontSize: '12px',
          fontFamily: 'var(--font-body)',
          outline: 'none',
        }}
      />
      <div style={{ display: 'flex', gap: '6px' }}>
        <button
          type="button"
          onClick={onConfirm}
          disabled={!value.trim()}
          style={{
            flex: 1,
            minHeight: '32px',
            borderRadius: '8px',
            border: '1px solid var(--color-accent)',
            background: value.trim() ? 'var(--color-accent)' : 'var(--color-border-subtle)',
            color: '#fff',
            fontSize: '11px',
            fontWeight: 600,
            cursor: value.trim() ? 'pointer' : 'default',
          }}
        >
          Criar
        </button>
        <button
          type="button"
          onClick={onCancel}
          style={{
            minWidth: '64px',
            minHeight: '32px',
            borderRadius: '8px',
            border: '1px solid var(--color-border-subtle)',
            background: 'rgba(255,255,255,.42)',
            color: 'var(--color-text-secondary)',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Cancelar
        </button>
      </div>
      {error && (
        <span style={{ fontSize: '11px', color: 'var(--color-danger)', lineHeight: 1.4 }}>
          {error}
        </span>
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
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        width: '100%',
        padding: '7px 9px',
        borderRadius: 'var(--radius-sm)',
        cursor: 'pointer',
        color: active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
        fontSize: '13px',
        transition: 'background .15s ease, border-color .15s ease, color .15s ease',
        position: 'relative',
        background: active ? 'var(--color-accent-soft)' : 'transparent',
        border: active ? '1px solid var(--color-accent-border)' : '1px solid transparent',
        fontFamily: 'var(--font-body)',
        textAlign: 'left',
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
    </button>
  )
}

export function Sidebar({ width }: { width: number }) {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const mainMode = useUIStore((s) => s.mainMode)
  const activeChannelId = useUIStore((s) => s.activeChannelId)
  const activeDmId = useUIStore((s) => s.activeDmId)
  const activeProjectId = useUIStore((s) => s.activeProjectId)
  const openChannel = useUIStore((s) => s.openChannel)
  const openDm = useUIStore((s) => s.openDm)
  const openProject = useUIStore((s) => s.openProject)
  const openVoice = useUIStore((s) => s.openVoice)
  const joinRoom = useVoiceStore((s) => s.joinRoom)
  const voiceChannelId = useVoiceStore((s) => s.channelId)
  const voiceParticipants = useVoiceStore((s) => s.participants)
  const voiceConnectionState = useVoiceStore((s) => s.connectionState)
  const channels = useAppDataStore((s) => s.channels)
  const createChannel = useAppDataStore((s) => s.createChannel)
  const createProject = useAppDataStore((s) => s.createProject)
  const dms = useAppDataStore((s) => s.dms)
  const teams = useAppDataStore((s) => s.teams)
  const users = useAppDataStore((s) => s.users)
  const workspaces = useAppDataStore((s) => s.workspaces)
  const activeWorkspaceId = useAppDataStore((s) => s.activeWorkspaceId)
  const appDataError = useAppDataStore((s) => s.error)
  const [creatingSection, setCreatingSection] = React.useState<'project' | 'channel' | 'voice' | null>(null)
  const [draftName, setDraftName] = React.useState('')

  const workspace = workspaces.find((item) => item.id === activeWorkspaceId)
  const canOpenResource = (resourceId: string, resourceType: 'board' | 'channel' | 'voice_room') => {
    if (!user?.id) return false
    return hasPermissionAction(resolveMemberPermission(teams, user.id, resourceId, resourceType).actions, 'view')
  }
  const projectChannels = channels.filter((c) => c.type === 'board' && canOpenResource(c.id, 'board'))
  const textChannels = channels.filter((c) => c.type === 'text' && canOpenResource(c.id, 'channel'))
  const voiceChannels = channels.filter((c) => c.type === 'voice' && canOpenResource(c.id, 'voice_room'))
  const activeVoiceParticipantIds = voiceChannelId ? voiceParticipants.map((participant) => participant.userId) : []

  const toggleCreateSection = (section: 'project' | 'channel' | 'voice') => {
    setCreatingSection((current) => current === section ? null : section)
    setDraftName('')
  }

  const closeCreateSection = () => {
    setCreatingSection(null)
    setDraftName('')
  }

  const handleCreate = async (section: 'project' | 'channel' | 'voice') => {
    const name = draftName.trim()
    if (!name) return
    const createdChannel = section === 'project'
      ? await createProject({ name, description: `Board do projeto ${name}` })
      : await createChannel({
          name,
          type: section === 'channel' ? 'text' : 'voice',
          description: section === 'channel' ? `Canal de texto ${name}` : `Sala de voz ${name}`,
        })
    if (!createdChannel) return
    closeCreateSection()
    if (section === 'project') {
      openProject(createdChannel.id)
      return
    }
    if (section === 'channel') {
      openChannel(createdChannel.id)
      return
    }
    openVoice(createdChannel.id)
    joinRoom(createdChannel.id)
  }

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
          {workspace?.initials ?? 'N'}
        </div>
        <span style={{ fontSize: '13px', fontWeight: 600, flex: 1 }}>{workspace?.name ?? 'NEXUS'}</span>
        <span style={{ display: 'inline-flex', color: 'var(--color-text-tertiary)' }}>
          <AppIcon name="chevronDown" size={12} />
        </span>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '8px 0 44px' }}>
        <Section
          id="proj"
          label="Projetos"
          action={<SectionActionButton label="Criar projeto" onClick={(event) => {
            event.stopPropagation()
            toggleCreateSection('project')
          }} />}
        >
          {creatingSection === 'project' && (
            <InlineCreateForm
              value={draftName}
              placeholder="Nome do projeto..."
              error={appDataError}
              onChange={setDraftName}
              onConfirm={() => void handleCreate('project')}
              onCancel={closeCreateSection}
            />
          )}
          {projectChannels.map((ch) => (
            <SidebarItem
              key={ch.id}
              icon={<AppIcon name="project" size={15} />}
              label={ch.name}
              active={mainMode === 'project' && activeProjectId === ch.id}
              onClick={() => openProject(ch.id)}
            />
          ))}
        </Section>

        <Section
          id="com"
          label="Comunicação"
          action={<SectionActionButton label="Criar canal de texto" onClick={(event) => {
            event.stopPropagation()
            toggleCreateSection('channel')
          }} />}
        >
          {creatingSection === 'channel' && (
            <InlineCreateForm
              value={draftName}
              placeholder="Nome do canal..."
              error={appDataError}
              onChange={setDraftName}
              onConfirm={() => void handleCreate('channel')}
              onCancel={closeCreateSection}
            />
          )}
          {textChannels.map((ch) => (
            <SidebarItem
              key={ch.id}
              icon={<AppIcon name="channel" size={15} />}
              label={ch.name}
              badge={ch.badge}
              active={mainMode === 'channel' && activeChannelId === ch.id}
              onClick={() => openChannel(ch.id)}
            />
          ))}
        </Section>

        <Section
          id="voz"
          label="Voz & Reuniões"
          action={<SectionActionButton label="Criar sala de voz" onClick={(event) => {
            event.stopPropagation()
            toggleCreateSection('voice')
          }} />}
        >
          {creatingSection === 'voice' && (
            <InlineCreateForm
              value={draftName}
              placeholder="Nome da sala..."
              error={appDataError}
              onChange={setDraftName}
              onConfirm={() => void handleCreate('voice')}
              onCancel={closeCreateSection}
            />
          )}
          {voiceChannels.map((ch) => (
            <div key={ch.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <SidebarItem
                icon={<AppIcon name="voice" size={15} />}
                label={ch.name}
                badge={voiceChannelId === ch.id ? activeVoiceParticipantIds.length || undefined : undefined}
                active={mainMode === 'voice' && activeChannelId === ch.id}
                onClick={() => {
                  openVoice(ch.id)
                  joinRoom(ch.id)
                }}
              />
              {voiceChannelId === ch.id && (voiceConnectionState !== 'idle' || activeVoiceParticipantIds.length > 0) && (
                <div
                  style={{
                    marginLeft: '18px',
                    paddingLeft: '12px',
                    borderLeft: '1px solid var(--color-border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  {voiceParticipants.map((participant) => {
                    const participantUser = users[participant.userId]
                    const isCurrentUser = participant.userId === user?.id
                    return (
                      <div
                        key={participant.userId}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          minHeight: '26px',
                          padding: '2px 0',
                          color: 'var(--color-text-secondary)',
                          fontSize: '12px',
                        }}
                      >
                        <div style={{ position: 'relative', flexShrink: 0 }}>
                          <div
                            style={{
                              width: '18px',
                              height: '18px',
                              borderRadius: '50%',
                              background: participantUser?.color || 'var(--color-accent)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '7px',
                              fontWeight: 700,
                              color: '#fff',
                            }}
                          >
                            {participantUser?.initials || '?'}
                          </div>
                          <StatusDot status={participantUser?.status} />
                        </div>
                        <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {participantUser?.name || participant.userId}
                          {isCurrentUser ? ' (você)' : ''}
                        </span>
                        <span style={{ fontSize: '11px', opacity: 0.78, flexShrink: 0 }}>
                          {participant.sharing ? (
                            <AppIcon name="screen" size={14} />
                          ) : participant.cameraOn ? (
                            <AppIcon name="camera" size={14} />
                          ) : participant.muted ? (
                            <AppIcon name="micOff" size={14} />
                          ) : (
                            <AppIcon name="mic" size={14} />
                          )}
                        </span>
                      </div>
                    )
                  })}
                  {voiceParticipants.length === 0 && (
                    <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', padding: '2px 0' }}>
                      {voiceConnectionState === 'connecting' ? 'Entrando na sala...' : 'Sem participantes visíveis ainda'}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </Section>

        <Section id="dm" label="Diretos">
          {dms.map((dm) => {
            const u = users[dm.userId]
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
                active={mainMode === 'dm' && activeDmId === dm.id}
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
          minHeight: '48px',
          display: 'flex',
          alignItems: 'center',
          gap: '9px',
          padding: '6px 12px',
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
        <button
          type="button"
          onClick={logout}
          aria-label="Fazer logout"
          title="Sair"
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '8px',
            border: '1px solid var(--color-border-subtle)',
            background: 'rgba(255,255,255,.42)',
            color: 'var(--color-text-secondary)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'background .18s ease, border-color .18s ease, color .18s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--color-danger-soft)'
            e.currentTarget.style.borderColor = 'var(--color-danger-border)'
            e.currentTarget.style.color = 'var(--color-danger)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,.42)'
            e.currentTarget.style.borderColor = 'var(--color-border-subtle)'
            e.currentTarget.style.color = 'var(--color-text-secondary)'
          }}
        >
          <AppIcon name="logout" size={16} />
        </button>
      </div>
    </div>
  )
}
