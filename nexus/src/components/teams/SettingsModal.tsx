import { useState } from 'react'
import { Dialog, DialogContent } from '../ui/dialog'
import { useTeamsStore, TEAM_COLORS } from '../../stores/teamsStore'
import { PermissionToggle } from './PermissionToggle'
import { TeamColorPicker } from './TeamColorPicker'
import { USERS, CHANNELS } from '../../data/mock'
import type { ResourceType } from '../../types'

// Todos os recursos disponíveis para configurar permissão
const ALL_RESOURCES = [
  // Canais
  ...CHANNELS.filter(c => c.type === 'text').map(c => ({
    id: c.id, name: '#' + c.name, type: 'channel' as ResourceType, icon: '#',
  })),
  // Boards
  ...CHANNELS.filter(c => c.type === 'board').map(c => ({
    id: c.id, name: c.name, type: 'board' as ResourceType, icon: '⊞',
  })),
  // Pastas mock
  { id: 'design-assets',  name: 'Design Assets',  type: 'folder' as ResourceType, icon: '📁' },
  { id: 'brand-guide',    name: 'Brand Guidelines',type: 'folder' as ResourceType, icon: '📁' },
  { id: 'research',       name: 'Research',        type: 'folder' as ResourceType, icon: '📁' },
  { id: 'campanhas',      name: 'Campanhas',       type: 'folder' as ResourceType, icon: '📁' },
  { id: 'specs-tecnicas', name: 'Specs Técnicas',  type: 'folder' as ResourceType, icon: '📁' },
]

const RESOURCE_GROUPS = [
  { label: 'Canais',  filter: (r: typeof ALL_RESOURCES[0]) => r.type === 'channel' },
  { label: 'Boards',  filter: (r: typeof ALL_RESOURCES[0]) => r.type === 'board'   },
  { label: 'Pastas',  filter: (r: typeof ALL_RESOURCES[0]) => r.type === 'folder'  },
]

const SETTINGS_TABS = ['Perfil', 'Notificações', 'Equipes', 'Segurança']

export default function SettingsModal() {
  const {
    settingsOpen, closeSettings,
    teams, selectedTeamId, selectTeam,
    createTeam, deleteTeam, renameTeam, setTeamColor,
    addMember, removeMember, setPermission,
  } = useTeamsStore()

  const [activeTab, setActiveTab] = useState('Equipes')
  const [isCreating, setIsCreating] = useState(false)
  const [newTeamName, setNewTeamName] = useState('')
  const [newTeamColor, setNewTeamColor] = useState(TEAM_COLORS[0])

  const selectedTeam = teams.find(t => t.id === selectedTeamId) ?? null

  function handleCreateTeam() {
    if (!newTeamName.trim()) return
    createTeam(newTeamName.trim(), newTeamColor)
    setNewTeamName('')
    setNewTeamColor(TEAM_COLORS[0])
    setIsCreating(false)
  }

  // Membros que ainda não estão na equipe selecionada
  const availableMembers = selectedTeam
    ? Object.values(USERS).filter(u => !selectedTeam.memberIds.includes(u.id))
    : []

  return (
    <Dialog open={settingsOpen} onOpenChange={closeSettings}>
      <DialogContent className="bg-[var(--bg-panel)] border border-[var(--border)] rounded-2xl w-[90vw] max-w-[900px] h-[80vh] flex flex-col p-0 overflow-hidden gap-0">

        {/* Header */}
        <div className="px-6 py-5 border-b border-[var(--border)] flex items-center justify-between">
          <span className="font-display font-bold text-lg">Configurações</span>
          <button onClick={closeSettings} className="bg-none border-none text-[var(--text-2)] cursor-pointer text-xl leading-none" aria-label="Fechar">✕</button>
        </div>

        <div className="flex flex-1 overflow-hidden">

          {/* Tabs verticais */}
          <div className="w-40 border-r border-[var(--border)] p-3 pr-2 flex flex-col gap-0.5">
            {SETTINGS_TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className="min-h-[44px] px-3 py-2 rounded-md border-none text-left text-sm font-body cursor-pointer transition-all duration-150" style={{
                background: activeTab === tab ? 'var(--bg-active)' : 'transparent',
                color: activeTab === tab ? 'var(--text-1)' : 'var(--text-2)',
                fontWeight: activeTab === tab ? 600 : 400,
              }}>
                {tab}
              </button>
            ))}
          </div>

          {/* Conteúdo */}
          <div className="flex-1 overflow-hidden flex flex-col">

            {/* ── ABA EQUIPES ── */}
            {activeTab === 'Equipes' && (
              <div className="flex flex-1 overflow-hidden">

                {/* Coluna esquerda: lista de equipes */}
                <div className="w-[220px] border-r border-[var(--border)] flex flex-col overflow-hidden">
                  <div className="px-3 pb-2 pt-3 flex-shrink-0">
                    <button onClick={() => setIsCreating(true)} className="w-full min-h-[44px] px-3 rounded-md border border-dashed border-[var(--border)] bg-transparent text-[var(--text-2)] text-xs cursor-pointer font-body transition-all duration-150">
                      + Nova Equipe
                    </button>
                  </div>

                  {/* Inline form de criação */}
                  {isCreating && (
                    <div className="px-3 pb-3">
                      <input
                        autoFocus
                        value={newTeamName}
                        onChange={e => setNewTeamName(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleCreateTeam(); if (e.key === 'Escape') setIsCreating(false) }}
                        placeholder="Nome da equipe"
                        className="w-full px-2.5 py-1.5 bg-[var(--bg-card)] border border-[var(--accent)] rounded-md text-sm text-[var(--text-1)] font-body outline-none mb-2"
                      />
                      <TeamColorPicker value={newTeamColor} onChange={setNewTeamColor} />
                      <div className="flex gap-1.5 mt-2">
                        <button onClick={handleCreateTeam} className="flex-1 min-h-[44px] rounded-md border-none bg-[var(--accent)] text-white text-xs cursor-pointer font-body">Criar</button>
                        <button onClick={() => setIsCreating(false)} className="flex-1 min-h-[44px] rounded-md border border-[var(--border)] bg-transparent text-[var(--text-2)] text-xs cursor-pointer font-body">Cancelar</button>
                      </div>
                    </div>
                  )}

                  {/* Lista de equipes */}
                  <div className="flex-1 overflow-y-auto px-2">
                    {teams.map(team => (
                      <div key={team.id} onClick={() => selectTeam(team.id)} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer mb-1 transition-all duration-150" style={{
                        background: selectedTeamId === team.id ? 'var(--bg-active)' : 'transparent',
                        border: selectedTeamId === team.id ? `1px solid ${team.color}44` : '1px solid transparent',
                      }}>
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: team.color }} />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-[var(--text-1)]">{team.name}</div>
                          <div className="text-[11px] text-[var(--text-3)]">{team.memberIds.length} membros · {team.permissions.filter(p => p.level !== 'none').length} recursos</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Coluna direita: detalhe da equipe */}
                <div className="flex-1 overflow-y-auto p-5">
                  {!selectedTeam ? (
                    <div className="flex items-center justify-center h-full text-[var(--text-3)] text-sm">
                      Selecione uma equipe para editar
                    </div>
                  ) : (
                    <div className="flex flex-col gap-6">

                      {/* Header da equipe */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <input
                            value={selectedTeam.name}
                            onChange={e => renameTeam(selectedTeam.id, e.target.value)}
                            className="font-display font-bold text-xl bg-transparent border-b-2 border-transparent text-[var(--text-1)] outline-none w-full pb-0.5 transition-colors duration-200 focus:border-[var(--accent)]"
                          />
                          <div className="mt-2.5">
                            <TeamColorPicker
                              value={selectedTeam.color}
                              onChange={c => setTeamColor(selectedTeam.id, c)}
                            />
                          </div>
                        </div>
                        <button onClick={() => {
                          if (confirm(`Excluir a equipe "${selectedTeam.name}"?`)) {
                            deleteTeam(selectedTeam.id)
                          }
                        }} className="min-h-[44px] px-3 rounded-md border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.08)] text-[var(--red)] text-xs cursor-pointer font-body whitespace-nowrap">
                          Excluir Equipe
                        </button>
                      </div>

                      {/* Seção Membros */}
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-[var(--text-3)] mb-3">Membros</p>

                        <div className="flex flex-col gap-1.5">
                          {selectedTeam.memberIds.map(userId => {
                            const user = USERS[userId]
                            if (!user) return null
                            return (
                              <div key={userId} className="flex items-center gap-2.5 p-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg">
                                <div className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0" style={{ background: user.color }}>
                                  {user.initials}
                                </div>
                                <div className="flex-1">
                                  <div className="text-sm font-medium">{user.name}</div>
                                  <div className="text-[11px] text-[var(--text-3)]">{user.role}</div>
                                </div>
                                <button
                                  onClick={() => removeMember(selectedTeam.id, userId)}
                                  className="bg-none border-none text-[var(--text-3)] cursor-pointer text-base leading-none transition-colors duration-150 hover:text-[var(--red)]"
                                  aria-label={`Remover ${user.name}`}
                                >✕</button>
                              </div>
                            )
                          })}
                        </div>

                        {/* Dropdown para adicionar membro */}
                        {availableMembers.length > 0 && (
                          <div className="mt-2">
                            <select
                              defaultValue=""
                              onChange={e => {
                                if (e.target.value) addMember(selectedTeam.id, e.target.value)
                                e.target.value = ''
                              }}
                              className="w-full min-h-[44px] px-3 bg-[var(--bg-card)] border border-dashed border-[var(--border)] rounded-md text-sm text-[var(--text-2)] cursor-pointer font-body outline-none"
                            >
                              <option value="" disabled>+ Adicionar membro...</option>
                              {availableMembers.map(u => (
                                <option key={u.id} value={u.id}>{u.name}</option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>

                      {/* Seção Recursos */}
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-[var(--text-3)] mb-3">Recursos com Acesso</p>

                        {RESOURCE_GROUPS.map(group => (
                          <div key={group.label} className="mb-4">
                            <p className="text-[11px] text-[var(--text-3)] mb-1.5">{group.label}</p>
                            <div className="flex flex-col gap-1">
                              {ALL_RESOURCES.filter(group.filter).map(resource => {
                                const perm = selectedTeam.permissions.find(p => p.resourceId === resource.id)
                                return (
                                  <div key={resource.id} className="flex items-center gap-2.5 p-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-md">
                                    <span className="text-sm w-5 text-center">{resource.icon}</span>
                                    <span className="flex-1 text-sm text-[var(--text-2)]">{resource.name}</span>
                                    <PermissionToggle
                                      value={perm?.level ?? 'none'}
                                      onChange={(level) =>
                                        setPermission(selectedTeam.id, resource.id, resource.type, level)
                                      }
                                    />
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        ))}
                      </div>

                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Outras abas (placeholder) */}
            {activeTab !== 'Equipes' && (
              <div className="flex-1 flex items-center justify-center text-[var(--text-3)] text-sm">
                {activeTab} — Em breve
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}