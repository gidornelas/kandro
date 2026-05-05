import { useState, useMemo, useRef } from 'react'
import { useTeamsStore } from '../../stores/teamsStore'
import { useFilesStore } from '../../stores/filesStore'
import { useAuthStore } from '../../stores/authStore'
import { useWorkspaces } from '../../hooks/queries/useWorkspaces'
import { useFiles } from '../../hooks/queries/useFiles'
import { useUploadFile } from '../../hooks/mutations/useUploadFile'
import { useCreateFolder } from '../../hooks/mutations/useCreateFolder'
import * as filesApi from '../../api/files'
import { TeamBadges } from '../teams/TeamBadge'
import PermissionModal from '../teams/PermissionModal'
import { SkeletonList } from '../ui/Skeleton'
import { QueryError } from '../ui/QueryError'
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog'

export function FilesView() {
  const { teams, openPermModal } = useTeamsStore()
  const { currentFolderId, breadcrumb, navigateToFolder } = useFilesStore()
  const currentUser = useAuthStore(s => s.user)
  const [activeTeamFilter, setActiveTeamFilter] = useState<string | null>(null)
  const [onlyMine, setOnlyMine] = useState(false)
  const [requestAccessId, setRequestAccessId] = useState<string | null>(null)
  const [requestText, setRequestText] = useState('')
  const { data: workspaces } = useWorkspaces()
  const workspaceId = workspaces?.[0]?.id ?? null
  const [showNewFolder, setShowNewFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadMutation = useUploadFile()
  const createFolderMutation = useCreateFolder()

  const { data: items, isLoading, error, refetch } = useFiles(workspaceId, currentFolderId)

  const filtered = useMemo(() => {
    if (!items) return []
    return items.filter(f => {
      if (activeTeamFilter && !f.teamIds.includes(activeTeamFilter)) return false
      if (onlyMine && f.uploadedBy && f.uploadedBy !== currentUser?.id) return false
      return true
    })
  }, [items, activeTeamFilter, onlyMine, currentUser])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (a.type === 'folder' && b.type !== 'folder') return -1
      if (a.type !== 'folder' && b.type === 'folder') return 1
      return 0
    })
  }, [filtered])

  const handleUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !workspaceId) return
    await uploadMutation.mutateAsync({ workspaceId, file, parentId: currentFolderId })
    e.target.value = ''
  }

  const handleNewFolder = () => {
    setShowNewFolder(true)
    setNewFolderName('')
  }

  const confirmNewFolder = async () => {
    if (!newFolderName.trim() || !workspaceId) return
    await createFolderMutation.mutateAsync({ workspaceId, name: newFolderName.trim(), parentId: currentFolderId })
    setShowNewFolder(false)
    setNewFolderName('')
  }

  const handleItemClick = (item: typeof sorted[0]) => {
    if (item.restricted) return
    if (item.type === 'folder') {
      navigateToFolder(item.id, item.name)
    } else {
      filesApi.getDownloadUrl(item.id).then(res => {
        if (res.downloadUrl) {
          window.open(res.downloadUrl, '_blank')
        }
      }).catch(() => {})
    }
  }

  return (
    <div className="flex flex-col h-full">

      {/* Header filtros */}
      <div className="px-5 py-3 border-b border-[var(--border)] flex items-center gap-3 flex-wrap">

        {/* Filtros de equipe */}
        <div className="flex gap-1.5">
          {teams.map(team => (
            <button
              key={team.id}
              onClick={() => setActiveTeamFilter(activeTeamFilter === team.id ? null : team.id)}
              aria-pressed={activeTeamFilter === team.id}
              className="min-h-[44px] px-3 rounded-full text-[11px] font-semibold cursor-pointer font-body transition-all duration-150"
              style={{
                border: activeTeamFilter === team.id ? `1px solid ${team.color}` : '1px solid var(--border)',
                background: activeTeamFilter === team.id ? team.color + '22' : 'transparent',
                color: activeTeamFilter === team.id ? team.color : 'var(--text-3)',
              }}
            >
              {team.name}
            </button>
          ))}
        </div>

        {/* Separador */}
        <div className="w-px h-5 bg-[var(--border)]" />

        {/* Toggle só os meus */}
        <button
          onClick={() => setOnlyMine(v => !v)}
          aria-pressed={onlyMine}
          className="min-h-[44px] px-3 rounded-full text-[11px] cursor-pointer font-body transition-all duration-150"
          style={{
            border: onlyMine ? '1px solid var(--accent)' : '1px solid var(--border)',
            background: onlyMine ? 'rgba(124,106,247,0.12)' : 'transparent',
            color: onlyMine ? 'var(--accent)' : 'var(--text-3)',
          }}
        >
          Apenas os meus
        </button>

        {/* Ações */}
        <div className="ml-auto flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelected}
          />
          <button onClick={handleUpload} aria-label="Upload arquivo" className="min-h-[44px] px-3 rounded-md border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-2)] text-xs cursor-pointer font-body">📤 Upload</button>
          <button onClick={handleNewFolder} aria-label="Nova pasta" className="min-h-[44px] px-3 rounded-md border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-2)] text-xs cursor-pointer font-body">📁 Nova Pasta</button>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="px-5 py-2 flex gap-1.5 text-xs text-[var(--text-3)]">
        {breadcrumb.map((crumb, i) => (
          <span key={i} className={i < breadcrumb.length - 1 ? 'cursor-pointer' : ''}
            onClick={() => i < breadcrumb.length - 1 && navigateToFolder(crumb.id, crumb.name)}>
            {i > 0 && <span className="mr-1.5">›</span>}
            <span style={{
              color: i === breadcrumb.length - 1 ? 'var(--text-1)' : 'var(--text-3)',
              borderBottom: i < breadcrumb.length - 1 ? '1px dotted var(--text-3)' : 'none',
            }}>
              {crumb.name}
            </span>
          </span>
        ))}
      </div>

      {/* Loading / Error states */}
      {isLoading && (
        <div className="px-5 py-2">
          <SkeletonList count={5} />
        </div>
      )}
      {!isLoading && error && (
        <div className="px-5 py-2">
          <QueryError message={error.message} onRetry={() => refetch()} />
        </div>
      )}

      {/* Lista de itens */}
      {!isLoading && !error && (
        <div className="flex-1 overflow-y-auto px-5 py-2">
          {sorted.length === 0 && (
            <div className="p-10 text-center text-[var(--text-3)] text-sm">Nenhum arquivo encontrado</div>
          )}
          {sorted.map(item => (
            <div
              key={item.id}
              onClick={() => handleItemClick(item)}
              className="flex items-center gap-3.5 p-3 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg mb-1.5 transition-all duration-200 cursor-pointer hover:border-[var(--text-3)] hover:bg-[var(--bg-hover)]"
              style={{ opacity: item.restricted ? 0.5 : 1 }}
            >
              {/* Ícone */}
              <div className="w-10 h-10 rounded-lg bg-[rgba(124,106,247,0.08)] flex items-center justify-center text-xl flex-shrink-0">
                {item.restricted ? '🔒' : item.icon}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate" style={{ color: item.restricted ? 'var(--text-3)' : 'var(--text-1)' }}>
                  {item.name}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] text-[var(--text-3)]">
                    {item.type === 'folder' ? `${item.itemCount ?? 0} itens` : item.size}
                    {item.uploadedBy && ` · ${item.uploadedBy}`}
                    {item.uploadedAt && ` · ${item.uploadedAt}`}
                  </span>
                  {item.encrypted && (
                    <span className="text-[10px] px-1.5 py-px rounded bg-[rgba(74,222,128,0.08)] border border-[rgba(74,222,128,0.15)] text-[var(--green)] font-semibold">🔒 Criptografado</span>
                  )}
                </div>
              </div>

              {/* Badges de equipe */}
              <TeamBadges teamIds={item.teamIds} size={10} />

              {/* Solicitar acesso ou menu */}
              {item.restricted ? (
                <button onClick={(e) => { e.stopPropagation(); setRequestAccessId(item.id) }} className="min-h-[44px] px-2.5 rounded-md text-[11px] border border-[var(--border)] bg-transparent text-[var(--text-2)] cursor-pointer font-body">
                  Solicitar acesso
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    openPermModal({ id: item.id, name: item.name, type: item.type === 'folder' ? 'folder' : 'folder' })
                  }}
                  aria-label="Mais opções"
                  className="bg-none border-none text-[var(--text-3)] cursor-pointer text-base p-1 transition-colors duration-150 hover:text-[var(--text-1)]"
                >⋯</button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal nova pasta */}
      <Dialog open={showNewFolder} onOpenChange={setShowNewFolder}>
        <DialogContent className="w-[360px]" style={{ maxWidth: '90vw' }}>
          <DialogTitle id="new-folder-title" className="font-display font-bold text-base mb-4 text-[var(--text-1)]">Nova Pasta</DialogTitle>
          <input
            value={newFolderName}
            onChange={e => setNewFolderName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') confirmNewFolder() }}
            placeholder="Nome da pasta..."
            autoFocus
            className="w-full px-3 py-2.5 bg-[var(--bg-panel)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-1)] font-body outline-none box-border"
          />
          <div className="flex gap-2 mt-4 justify-end">
            <button onClick={() => setShowNewFolder(false)} className="min-h-[44px] px-3.5 rounded-md border border-[var(--border)] bg-transparent text-[var(--text-2)] text-xs cursor-pointer font-body">Cancelar</button>
            <button onClick={confirmNewFolder} className="min-h-[44px] px-3.5 rounded-md border-none bg-[var(--accent)] text-white text-xs cursor-pointer font-body font-semibold">Criar</button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal solicitar acesso */}
      <Dialog open={!!requestAccessId} onOpenChange={(open) => { if (!open) setRequestAccessId(null) }}>
        <DialogContent className="w-[400px]" style={{ maxWidth: '90vw' }}>
          <DialogTitle id="request-access-title" className="font-display font-bold text-base mb-3 text-[var(--text-1)]">Solicitar acesso</DialogTitle>
          <p className="text-sm text-[var(--text-2)] mb-3">Deixe uma mensagem para o administrador explicando por que precisa de acesso.</p>
          <textarea
            value={requestText}
            onChange={e => setRequestText(e.target.value)}
            placeholder="Motivo do acesso..."
            rows={3}
            className="w-full px-3 py-2.5 bg-[var(--bg-panel)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-1)] font-body resize-none outline-none box-border"
          />
          <div className="flex gap-2 mt-3 justify-end">
            <button onClick={() => setRequestAccessId(null)} className="min-h-[44px] px-3.5 rounded-md border border-[var(--border)] bg-transparent text-[var(--text-2)] text-xs cursor-pointer font-body">Cancelar</button>
            <button onClick={() => { setRequestAccessId(null); setRequestText('') }} className="min-h-[44px] px-3.5 rounded-md border-none bg-[var(--accent)] text-white text-xs cursor-pointer font-body font-semibold">Enviar</button>
          </div>
        </DialogContent>
      </Dialog>

      <PermissionModal />
    </div>
  )
}
