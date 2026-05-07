import React from 'react'
import { Button } from '../../../design-system/Button'
import { ConfirmDialog } from '../../../design-system/ConfirmDialog'
import { Modal } from '../../../design-system/Modal'
import { useAppDataStore } from '../../app-data/store'
import { resolveMemberPermission } from '../../permissions/utils'
import { useSettingsStore } from '../store'
import type { PermissionAction, ResourceType, Team, TeamPermission } from '../../../shared/types/domain'
import type { SettingsSection, ThemeMode } from '../types'

type MediaOption = {
  deviceId: string
  label: string
}

function useMediaOptions(kind: MediaDeviceKind) {
  const [devices, setDevices] = React.useState<MediaOption[]>([])
  const supported = typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices?.enumerateDevices)

  React.useEffect(() => {
    if (!navigator.mediaDevices?.enumerateDevices) return

    const syncDevices = async () => {
      const allDevices = await navigator.mediaDevices.enumerateDevices()
      const filtered = allDevices
        .filter((device) => device.kind === kind)
        .map((device, index) => ({
          deviceId: device.deviceId,
          label: device.label || `${kind} ${index + 1}`,
        }))
      setDevices(filtered)
    }

    void syncDevices()
    navigator.mediaDevices.addEventListener('devicechange', syncDevices)
    return () => navigator.mediaDevices.removeEventListener('devicechange', syncDevices)
  }, [kind])

  return { devices, supported }
}

function SectionButton({ section, label }: { section: SettingsSection; label: string }) {
  const activeSection = useSettingsStore((s) => s.activeSection)
  const openSettings = useSettingsStore((s) => s.openSettings)
  const active = activeSection === section

  return (
    <button
      type="button"
      onClick={() => openSettings(section)}
      aria-pressed={active}
      style={{
        width: '100%',
        minHeight: '40px',
        padding: '0 12px',
        borderRadius: '10px',
        background: active ? 'var(--color-accent-soft)' : 'transparent',
        border: `1px solid ${active ? 'var(--color-accent-border)' : 'transparent'}`,
        color: active ? 'var(--color-accent)' : 'var(--color-text-secondary)',
        textAlign: 'left',
        fontSize: '13px',
        fontWeight: active ? 600 : 500,
        transition: 'background .18s ease, border-color .18s ease, color .18s ease',
      }}
    >
      {label}
    </button>
  )
}

function SelectField({
  label,
  value,
  options,
  disabled = false,
  hint,
  onChange,
}: {
  label: string
  value: string | null
  options: MediaOption[]
  disabled?: boolean
  hint?: string
  onChange: (value: string | null) => void
}) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>{label}</span>
      <select
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value || null)}
        disabled={disabled}
        style={{
          minHeight: '40px',
          borderRadius: '10px',
          border: '1px solid var(--color-border)',
          background: 'rgba(255,255,255,.72)',
          color: 'var(--color-text-primary)',
          padding: '0 12px',
        }}
      >
        <option value="">Usar padrão do sistema</option>
        {options.map((option) => (
          <option key={option.deviceId} value={option.deviceId}>
            {option.label}
          </option>
        ))}
      </select>
      {hint && <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>{hint}</span>}
    </label>
  )
}

function ToggleField({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '16px',
        padding: '12px 0',
        borderBottom: '1px solid var(--color-border-subtle)',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{label}</span>
        <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', lineHeight: 1.5 }}>{description}</span>
      </div>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
    </label>
  )
}

function AppearanceSettingsPanel() {
  const theme = useSettingsStore((s) => s.appearance.theme)
  const setTheme = useSettingsStore((s) => s.setTheme)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <div>
        <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '6px' }}>Tema da interface</h3>
        <p style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', lineHeight: 1.5 }}>
          Escolha entre claro, escuro ou seguir a configuração do sistema.
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '10px' }}>
        {(['light', 'dark', 'system'] as ThemeMode[]).map((mode) => {
          const active = theme === mode
          const label = mode === 'light' ? 'Claro' : mode === 'dark' ? 'Escuro' : 'Sistema'
          return (
            <button
              key={mode}
              type="button"
              onClick={() => setTheme(mode)}
              aria-pressed={active}
              style={{
                minHeight: '76px',
                borderRadius: '14px',
                border: `1px solid ${active ? 'var(--color-accent-border)' : 'var(--color-border-subtle)'}`,
                background: active ? 'var(--color-accent-soft)' : 'var(--color-surface-elevated)',
                color: active ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                padding: '12px',
              }}
            >
              <span style={{ fontSize: '18px' }}>{mode === 'light' ? '☀️' : mode === 'dark' ? '🌙' : '🖥️'}</span>
              <span style={{ fontSize: '13px', fontWeight: 600 }}>{label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function VoiceVideoSettingsPanel() {
  const voiceVideo = useSettingsStore((s) => s.voiceVideo)
  const updateVoiceVideo = useSettingsStore((s) => s.updateVoiceVideo)
  const microphones = useMediaOptions('audioinput')
  const speakers = useMediaOptions('audiooutput')
  const cameras = useMediaOptions('videoinput')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <div>
        <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '6px' }}>Voz e vídeo</h3>
        <p style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', lineHeight: 1.5 }}>
          Preferências persistidas localmente para entrada em salas, layout e dispositivos.
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' }}>
        <SelectField
          label="Microfone"
          value={voiceVideo.preferredMicrophoneId}
          options={microphones.devices}
          disabled={!microphones.supported}
          hint={!microphones.supported ? 'Seu navegador não expõe dispositivos de entrada nesta sessão.' : undefined}
          onChange={(value) => updateVoiceVideo({ preferredMicrophoneId: value })}
        />
        <SelectField
          label="Câmera"
          value={voiceVideo.preferredCameraId}
          options={cameras.devices}
          disabled={!cameras.supported}
          hint={!cameras.supported ? 'Seu navegador não expõe dispositivos de vídeo nesta sessão.' : undefined}
          onChange={(value) => updateVoiceVideo({ preferredCameraId: value })}
        />
        <SelectField
          label="Alto-falante"
          value={voiceVideo.preferredSpeakerId}
          options={speakers.devices}
          disabled={!speakers.supported}
          hint="A troca de saída depende de suporte do navegador para audio output."
          onChange={(value) => updateVoiceVideo({ preferredSpeakerId: value })}
        />
        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Layout preferido</span>
          <select
            value={voiceVideo.preferredVoiceLayout}
            onChange={(event) => updateVoiceVideo({ preferredVoiceLayout: event.target.value as typeof voiceVideo.preferredVoiceLayout })}
            style={{
              minHeight: '40px',
              borderRadius: '10px',
              border: '1px solid var(--color-border)',
              background: 'rgba(255,255,255,.72)',
              color: 'var(--color-text-primary)',
              padding: '0 12px',
            }}
          >
            <option value="voice">Voice</option>
            <option value="grid">Grid</option>
            <option value="spotlight">Spotlight</option>
            <option value="screen">Screen share</option>
          </select>
        </label>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <ToggleField
          label="Entrar com microfone mutado"
          description="Aplica sua preferência automaticamente quando você entrar em uma sala."
          checked={voiceVideo.autoMuteOnJoin}
          onChange={(checked) => updateVoiceVideo({ autoMuteOnJoin: checked })}
        />
        <ToggleField
          label="Entrar com câmera desligada"
          description="Evita abrir sua câmera por padrão nas salas de voz e vídeo."
          checked={voiceVideo.autoCameraOffOnJoin}
          onChange={(checked) => updateVoiceVideo({ autoCameraOffOnJoin: checked })}
        />
      </div>
    </div>
  )
}

const PERMISSION_ACTIONS: PermissionAction[] = ['view', 'post', 'comment', 'edit', 'manage', 'admin']
const PERMISSION_ACTION_LABELS: Record<PermissionAction, string> = {
  view: 'Ver',
  post: 'Postar',
  comment: 'Comentar',
  edit: 'Editar',
  manage: 'Gerir',
  admin: 'Admin',
}
const RESOURCE_TYPE_LABELS: Record<ResourceType, string> = {
  channel: 'Canal',
  board: 'Board',
  folder: 'Pasta',
  doc: 'Documento',
  voice_room: 'Sala de voz',
  settings: 'Configurações',
  member_list: 'Membros',
  integration: 'Integrações',
  announcement: 'Comunicados',
}

type ResourceCatalogItem = {
  resourceId: string
  resourceType: ResourceType
  label: string
}

const TEXT_FIELD_STYLE: React.CSSProperties = {
  minHeight: '40px',
  borderRadius: '10px',
  border: '1px solid var(--color-border)',
  background: 'rgba(255,255,255,.72)',
  color: 'var(--color-text-primary)',
  padding: '0 12px',
  width: '100%',
}

function buildResourceCatalog(teams: Team[], channels: { id: string; name: string; type: 'text' | 'board' | 'voice' }[]): ResourceCatalogItem[] {
  const seededResources: ResourceCatalogItem[] = [
    { resourceId: 'workspace-settings', resourceType: 'settings' as const, label: 'Workspace settings' },
    { resourceId: 'workspace-members', resourceType: 'member_list' as const, label: 'Membros e convites' },
    { resourceId: 'workspace-integrations', resourceType: 'integration' as const, label: 'Integrações' },
    { resourceId: 'workspace-announcements', resourceType: 'announcement' as const, label: 'Comunicados do workspace' },
  ]

  const channelResources: ResourceCatalogItem[] = channels.map((channel) => ({
    resourceId: channel.id,
    resourceType: channel.type === 'board' ? 'board' : channel.type === 'voice' ? 'voice_room' : 'channel',
    label: channel.name,
  }))

  const permissionResources: ResourceCatalogItem[] = teams.flatMap((team) =>
    team.permissions.map((permission) => ({
      resourceId: permission.resourceId,
      resourceType: permission.resourceType,
      label: permission.resourceId,
    })),
  )

  return [...seededResources, ...channelResources, ...permissionResources]
    .filter((resource, index, all) =>
      all.findIndex((candidate) => candidate.resourceId === resource.resourceId && candidate.resourceType === resource.resourceType) === index,
    )
    .sort((a, b) =>
      a.resourceType === b.resourceType
        ? a.label.localeCompare(b.label, 'pt-BR')
        : RESOURCE_TYPE_LABELS[a.resourceType].localeCompare(RESOURCE_TYPE_LABELS[b.resourceType], 'pt-BR'),
    )
}

function groupResourcesByType(resources: ResourceCatalogItem[]) {
  return resources.reduce<Record<ResourceType, ResourceCatalogItem[]>>(
    (groups, resource) => ({
      ...groups,
      [resource.resourceType]: [...(groups[resource.resourceType] ?? []), resource],
    }),
    {
      channel: [],
      board: [],
      folder: [],
      doc: [],
      voice_room: [],
      settings: [],
      member_list: [],
      integration: [],
      announcement: [],
    },
  )
}

function TeamSettingsPanel() {
  const teams = useAppDataStore((s) => s.teams)
  const channels = useAppDataStore((s) => s.channels)
  const users = useAppDataStore((s) => s.users)
  const createTeam = useAppDataStore((s) => s.createTeam)
  const updateTeam = useAppDataStore((s) => s.updateTeam)
  const removeTeam = useAppDataStore((s) => s.removeTeam)
  const updateTeamPermission = useAppDataStore((s) => s.updateTeamPermission)
  const error = useAppDataStore((s) => s.error)
  const [selectedTeamId, setSelectedTeamId] = React.useState<string | null>(teams[0]?.id ?? null)
  const [pendingKey, setPendingKey] = React.useState<string | null>(null)
  const [teamDraft, setTeamDraft] = React.useState({
    teamId: teams[0]?.id ?? null,
    name: teams[0]?.name ?? '',
    color: teams[0]?.color ?? '#2f80ed',
  })
  const [newTeamName, setNewTeamName] = React.useState('')
  const [newTeamColor, setNewTeamColor] = React.useState('#2f80ed')
  const [isRemovingTeam, setIsRemovingTeam] = React.useState(false)
  const [selectedResourceKey, setSelectedResourceKey] = React.useState<string | null>(null)
  const activeTeam = teams.find((team) => team.id === selectedTeamId) ?? teams[0]
  const resourceCatalog = React.useMemo(() => buildResourceCatalog(teams, channels), [teams, channels])
  const resourceGroups = React.useMemo(() => groupResourcesByType(resourceCatalog), [resourceCatalog])
  const draftName = teamDraft.teamId === activeTeam?.id ? teamDraft.name : activeTeam?.name ?? ''
  const draftColor = teamDraft.teamId === activeTeam?.id ? teamDraft.color : activeTeam?.color ?? '#2f80ed'
  const hasTeamDraftChanges = Boolean(activeTeam) && (draftName.trim() !== activeTeam.name || draftColor !== activeTeam.color)
  const fallbackResource = resourceCatalog[0] ?? null
  const inspectedResource = resourceCatalog.find((resource) => `${resource.resourceType}:${resource.resourceId}` === selectedResourceKey) ?? fallbackResource
  const effectiveMembers = React.useMemo(() => {
    if (!inspectedResource) return []
    return Object.values(users)
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
      .map((member) => {
        const resolved = resolveMemberPermission(teams, member.id, inspectedResource.resourceId, inspectedResource.resourceType)
        const memberTeams = teams.filter((team) => resolved.teamIds.includes(team.id))
        return { member, resolved, memberTeams }
      })
  }, [inspectedResource, teams, users])

  const getPermission = (resourceId: string, resourceType: ResourceType) =>
    activeTeam?.permissions.find((permission) => permission.resourceId === resourceId && permission.resourceType === resourceType)

  const toggleAction = async (permission: TeamPermission, action: PermissionAction, checked: boolean) => {
    if (!activeTeam) return
    const nextActions = checked
      ? [...permission.actions, action]
      : permission.actions.filter((currentAction) => currentAction !== action)
    const key = `${activeTeam.id}:${permission.resourceType}:${permission.resourceId}:${action}`
    setPendingKey(key)
    await updateTeamPermission(activeTeam.id, { ...permission, actions: nextActions })
    setPendingKey(null)
  }

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return
    await createTeam({ name: newTeamName.trim(), color: newTeamColor })
    setNewTeamName('')
    setNewTeamColor('#2f80ed')
  }

  const handleSaveTeam = async () => {
    if (!activeTeam || !draftName.trim() || !hasTeamDraftChanges) return
    await updateTeam(activeTeam.id, { name: draftName.trim(), color: draftColor })
    setTeamDraft({ teamId: activeTeam.id, name: draftName.trim(), color: draftColor })
  }

  const handleRemoveTeam = async () => {
    if (!activeTeam) return
    await removeTeam(activeTeam.id)
    setIsRemovingTeam(false)
  }

  if (!activeTeam) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '280px', color: 'var(--color-text-tertiary)' }}>
        Nenhuma equipe disponível neste workspace.
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', minHeight: '0' }}>
      <div>
        <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '6px' }}>Equipes e permissões</h3>
        <p style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', lineHeight: 1.5 }}>
          Modelo V2 com ações explícitas por recurso. A matriz agora abre inteira no modal, em cards por categoria, sem scroll horizontal.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '16px', minHeight: '360px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <aside style={{ width: '240px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div
            style={{
              padding: '14px',
              borderRadius: '16px',
              background: 'var(--color-surface-elevated)',
              border: '1px solid var(--color-border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)' }}>Nova equipe</span>
              <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>Crie squads, operações ou núcleos com permissões próprias.</span>
            </div>
            <input type="text" value={newTeamName} onChange={(event) => setNewTeamName(event.target.value)} placeholder="Ex.: Produto" style={TEXT_FIELD_STYLE} />
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Cor da equipe</span>
              <input type="color" value={newTeamColor} onChange={(event) => setNewTeamColor(event.target.value)} style={{ ...TEXT_FIELD_STYLE, padding: '6px', minHeight: '44px' }} />
            </label>
            <Button type="button" variant="primary" onClick={() => void handleCreateTeam()} disabled={!newTeamName.trim()}>
              Criar equipe
            </Button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {teams.map((team) => {
              const active = team.id === activeTeam.id
              return (
                <button
                  key={team.id}
                  type="button"
                  onClick={() => {
                    setSelectedTeamId(team.id)
                    setTeamDraft({ teamId: team.id, name: team.name, color: team.color })
                  }}
                  aria-pressed={active}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '14px',
                    border: `1px solid ${active ? 'var(--color-accent-border)' : 'var(--color-border-subtle)'}`,
                    background: active ? 'var(--color-accent-soft)' : 'var(--color-surface-elevated)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: team.color, flexShrink: 0 }} />
                    <span style={{ fontSize: '13px', fontWeight: 700, color: active ? 'var(--color-accent)' : 'var(--color-text-primary)' }}>{team.name}</span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
                    {team.memberIds.length} membro(s) • {team.permissions.length} recurso(s)
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {team.memberIds.slice(0, 4).map((memberId) => (
                      <span
                        key={memberId}
                        title={users[memberId]?.name ?? memberId}
                        style={{
                          minWidth: '28px',
                          height: '28px',
                          padding: '0 8px',
                          borderRadius: '999px',
                          background: users[memberId]?.color ?? 'var(--color-accent)',
                          color: '#fff',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '10px',
                          fontWeight: 700,
                        }}
                      >
                        {users[memberId]?.initials ?? memberId.slice(0, 2).toUpperCase()}
                      </span>
                    ))}
                  </div>
                </button>
              )
            })}
          </div>
        </aside>

        <div style={{ flex: 1, minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div
            style={{
              padding: '16px',
              borderRadius: '16px',
              background: 'var(--color-surface-elevated)',
              border: '1px solid var(--color-border-subtle)',
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) auto',
              gap: '12px',
              alignItems: 'end',
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 120px', gap: '12px' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Nome da equipe</span>
                <input
                  type="text"
                  value={draftName}
                  onChange={(event) =>
                    setTeamDraft({
                      teamId: activeTeam.id,
                      name: event.target.value,
                      color: draftColor,
                    })}
                  style={TEXT_FIELD_STYLE}
                />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Cor</span>
                <input
                  type="color"
                  value={draftColor}
                  onChange={(event) =>
                    setTeamDraft({
                      teamId: activeTeam.id,
                      name: draftName,
                      color: event.target.value,
                    })}
                  style={{ ...TEXT_FIELD_STYLE, padding: '6px', minHeight: '44px' }}
                />
              </label>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <Button type="button" variant="ghost" onClick={() => setIsRemovingTeam(true)} disabled={teams.length <= 1}>
                Remover
              </Button>
              <Button type="button" variant="primary" onClick={() => void handleSaveTeam()} disabled={!draftName.trim() || !hasTeamDraftChanges}>
                Salvar equipe
              </Button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', gridColumn: '1 / -1' }}>
              <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{activeTeam.name}</span>
              <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>
                {activeTeam.memberIds.length} membro(s) • {activeTeam.permissions.length} recurso(s) configurado(s)
              </span>
              {teams.length <= 1 && <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>Mantenha ao menos uma equipe ativa no workspace.</span>}
              {error && <span style={{ fontSize: '12px', color: 'var(--color-danger)' }}>{error}</span>}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {Object.entries(resourceGroups)
              .filter(([, resources]) => resources.length > 0)
              .map(([resourceType, resources]) => (
                <section
                  key={resourceType}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    padding: '14px',
                    borderRadius: '16px',
                    border: '1px solid var(--color-border-subtle)',
                    background: 'var(--color-surface-elevated)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                      {RESOURCE_TYPE_LABELS[resourceType as ResourceType]}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>{resources.length} recurso(s)</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                    {resources.map((resource) => {
                      const permission: TeamPermission = getPermission(resource.resourceId, resource.resourceType) ?? {
                        resourceId: resource.resourceId,
                        resourceType: resource.resourceType,
                        actions: [],
                      }

                      return (
                        <article
                          key={`${resource.resourceType}:${resource.resourceId}`}
                          style={{
                            borderRadius: '14px',
                            border: `1px solid ${inspectedResource?.resourceId === resource.resourceId && inspectedResource?.resourceType === resource.resourceType ? 'var(--color-accent-border)' : 'var(--color-border-subtle)'}`,
                            background: inspectedResource?.resourceId === resource.resourceId && inspectedResource?.resourceType === resource.resourceType ? 'var(--color-accent-soft)' : 'var(--color-surface-strong)',
                            padding: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px',
                            cursor: 'pointer',
                          }}
                          onClick={() => setSelectedResourceKey(`${resource.resourceType}:${resource.resourceId}`)}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{resource.label}</span>
                            <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>{resource.resourceId}</span>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '8px' }}>
                            {PERMISSION_ACTIONS.map((action) => {
                              const checked = permission.actions.includes(action)
                              const key = `${activeTeam.id}:${resource.resourceType}:${resource.resourceId}:${action}`
                              return (
                                <button
                                  key={action}
                                  type="button"
                                  aria-pressed={checked}
                                  disabled={pendingKey === key}
                                  onClick={() => {
                                    void toggleAction(permission, action, !checked)
                                  }}
                                  style={{
                                    minHeight: '42px',
                                    borderRadius: '10px',
                                    border: `1px solid ${checked ? 'var(--color-accent-border)' : 'var(--color-border-subtle)'}`,
                                    background: checked ? 'var(--color-accent-soft)' : 'var(--color-surface-elevated)',
                                    color: checked ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    transition: 'background .18s ease, border-color .18s ease, color .18s ease',
                                    opacity: pendingKey === key ? 0.65 : 1,
                                  }}
                                >
                                  {PERMISSION_ACTION_LABELS[action]}
                                </button>
                              )
                            })}
                          </div>
                        </article>
                      )
                    })}
                  </div>
                </section>
              ))}
          </div>

          {inspectedResource && (
            <section
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                padding: '14px',
                borderRadius: '16px',
                border: '1px solid var(--color-border-subtle)',
                background: 'var(--color-surface-elevated)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', alignItems: 'baseline' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)' }}>Permissões efetivas por membro</span>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>
                    Recurso selecionado: {inspectedResource.label} · {RESOURCE_TYPE_LABELS[inspectedResource.resourceType]}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: effectiveMembers[0]?.resolved.restricted ? 'var(--color-accent)' : 'var(--color-text-tertiary)',
                  }}
                >
                  {effectiveMembers[0]?.resolved.restricted ? 'Recurso com regra explícita' : 'Acesso padrão do app'}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                {effectiveMembers.map(({ member, resolved, memberTeams }) => (
                  <article
                    key={member.id}
                    style={{
                      padding: '12px',
                      borderRadius: '14px',
                      border: '1px solid var(--color-border-subtle)',
                      background: 'var(--color-surface-strong)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: member.color,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '10px',
                          fontWeight: 700,
                          color: '#fff',
                          flexShrink: 0,
                        }}
                      >
                        {member.initials}
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{member.name}</span>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>{member.role || 'Membro'}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {resolved.actions.length > 0 ? resolved.actions.map((action) => (
                        <span
                          key={action}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '999px',
                            background: 'var(--color-accent-soft)',
                            border: '1px solid var(--color-accent-border)',
                            color: 'var(--color-accent)',
                            fontSize: '10px',
                            fontWeight: 700,
                          }}
                        >
                          {PERMISSION_ACTION_LABELS[action]}
                        </span>
                      )) : (
                        <span style={{ fontSize: '11px', color: 'var(--color-danger)' }}>Sem acesso</span>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {memberTeams.length > 0 ? memberTeams.map((team) => (
                        <span
                          key={team.id}
                          style={{
                            padding: '3px 8px',
                            borderRadius: '999px',
                            background: 'rgba(255,255,255,.72)',
                            border: '1px solid var(--color-border-subtle)',
                            color: 'var(--color-text-secondary)',
                            fontSize: '10px',
                            fontWeight: 600,
                          }}
                        >
                          {team.name}
                        </span>
                      )) : (
                        <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
                          {resolved.restricted ? 'Nenhuma equipe concede acesso' : 'Acesso herdado por padrão'}
                        </span>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={isRemovingTeam}
        onOpenChange={setIsRemovingTeam}
        title={`Remover equipe ${activeTeam.name}?`}
        description="A equipe será removida deste workspace. As permissões e a associação visual desta equipe também saem do app."
        confirmLabel="Remover equipe"
        variant="danger"
        onConfirm={handleRemoveTeam}
      />
    </div>
  )
}

export function SettingsModal() {
  const isOpen = useSettingsStore((s) => s.isOpen)
  const activeSection = useSettingsStore((s) => s.activeSection)
  const closeSettings = useSettingsStore((s) => s.closeSettings)

  return (
    <Modal
      open={isOpen}
      onClose={closeSettings}
      title="Configurações"
      description="Preferências pessoais de interface, voz e vídeo para o Kandro."
      size="xl"
      width="min(1080px, calc(100vw - 40px))"
      footer={<Button type="button" variant="primary" onClick={closeSettings}>Fechar</Button>}
    >
      <div style={{ display: 'flex', gap: '24px', minHeight: '420px', flexWrap: 'wrap' }}>
        <aside style={{ width: '180px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <SectionButton section="appearance" label="Aparência" />
          <SectionButton section="voice-video" label="Voz e vídeo" />
          <SectionButton section="teams" label="Equipes" />
        </aside>
        <div style={{ flex: 1, minWidth: 0 }}>
          {activeSection === 'appearance' && <AppearanceSettingsPanel />}
          {activeSection === 'voice-video' && <VoiceVideoSettingsPanel />}
          {activeSection === 'teams' && <TeamSettingsPanel />}
        </div>
      </div>
    </Modal>
  )
}
