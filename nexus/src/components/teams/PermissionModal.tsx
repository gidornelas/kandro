import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog'
import { useTeamsStore } from '../../stores/teamsStore'
import { PermissionToggle } from './PermissionToggle'
import type { PermissionLevel } from '../../types'

function PermissionModalContent() {
  const { permModalResource, closePermModal, teams, setPermission } = useTeamsStore()
  const [saving, setSaving] = useState(false)
  const [localPerms, setLocalPerms] = useState<Record<string, PermissionLevel>>(() => {
    const init: Record<string, PermissionLevel> = {}
    if (permModalResource) {
      teams.forEach(team => {
        const perm = team.permissions.find(p => p.resourceId === permModalResource.id)
        init[team.id] = perm?.level ?? 'none'
      })
    }
    return init
  })

  if (!permModalResource) return null

  const resourceId = permModalResource.id
  const resourceType = permModalResource.type

  const peopleWithAccess = new Set<string>()
  teams.forEach(team => {
    if (localPerms[team.id] !== 'none') {
      team.memberIds.forEach(id => peopleWithAccess.add(id))
    }
  })

  function handleSave() {
    setSaving(true)
    setTimeout(() => {
      teams.forEach(team => {
        setPermission(
          team.id,
          resourceId,
          resourceType,
          localPerms[team.id] ?? 'none'
        )
      })
      setSaving(false)
      closePermModal()
    }, 800)
  }

  const TYPE_LABELS: Record<string, string> = {
    channel: 'Canal', board: 'Board', folder: 'Pasta', doc: 'Doc',
  }

  return (
    <Dialog open={!!permModalResource} onOpenChange={closePermModal}>
      <DialogContent className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl max-w-[520px] max-h-[80vh] overflow-hidden flex flex-col gap-0">
        <DialogHeader className="px-6 pt-5">
          <div className="flex items-center gap-2.5 mb-1">
            <DialogTitle className="font-display text-base text-[var(--text-1)]">
              Acesso a {permModalResource.name}
            </DialogTitle>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[rgba(124,106,247,0.12)] border border-[rgba(124,106,247,0.3)] text-[var(--accent)] font-semibold uppercase tracking-wide">
              {TYPE_LABELS[permModalResource.type]}
            </span>
          </div>
          <p className="text-xs text-[var(--text-3)]">
            {peopleWithAccess.size} {peopleWithAccess.size === 1 ? 'pessoa terá' : 'pessoas terão'} acesso com estas configurações
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <p className="text-[10px] uppercase tracking-widest text-[var(--text-3)] mb-2.5">Equipes</p>
          <div className="flex flex-col gap-2">
            {teams.map(team => (
              <div key={team.id} className="flex items-center gap-3 p-2.5 bg-[var(--bg-panel)] border border-[var(--border)] rounded-lg">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: team.color }} />
                <div className="flex-1">
                  <div className="text-sm font-medium">{team.name}</div>
                  <div className="text-[11px] text-[var(--text-3)]">{team.memberIds.length} {team.memberIds.length === 1 ? 'membro' : 'membros'}</div>
                </div>
                <PermissionToggle
                  value={localPerms[team.id] ?? 'none'}
                  onChange={(level) => setLocalPerms(prev => ({ ...prev, [team.id]: level }))}
                />
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-[var(--border)] flex justify-end gap-2">
          <button onClick={closePermModal} className="min-h-[44px] px-4 rounded-md border border-[var(--border)] bg-transparent text-[var(--text-2)] text-sm cursor-pointer font-body transition-all duration-200">
            Cancelar
          </button>
          <button onClick={handleSave} disabled={saving} className="min-h-[44px] px-4 rounded-md border-none text-white text-sm cursor-pointer font-semibold transition-all duration-200 min-w-[120px]" style={{ background: saving ? 'var(--bg-active)' : 'var(--accent)' }}>
            {saving ? '⏳ Salvando...' : 'Salvar Permissões'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function PermissionModal() {
  const { permModalResource } = useTeamsStore()
  if (!permModalResource) return null
  return <PermissionModalContent key={permModalResource.id} />
}

export default PermissionModal
