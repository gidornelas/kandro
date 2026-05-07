import React from 'react'
import { ConfirmDialog } from '../../../design-system/ConfirmDialog'
import { useFilesStore } from '../store'
import { useAppDataStore } from '../../app-data/store'
import { Skeleton } from '../../../design-system/Skeleton'
import { EmptyState } from '../../../design-system/EmptyState'
import { AppIcon } from '../../../design-system/AppIcon'
import { getFileIconName } from '../../../design-system/app-icon.utils'

const FileItem = React.memo(function FileItem({
  file,
  onDelete,
  canDelete,
}: {
  file: { id: string; name: string; type: string; icon: string; size?: string; itemCount?: number; uploadedAt?: string; restricted: boolean; teamIds: string[] }
  onDelete?: () => void | Promise<void>
  canDelete?: boolean
}) {
  const teams = useAppDataStore((s) => s.teams)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const teamNames = file.teamIds.map((tid) => teams.find((team) => team.id === tid)?.name).filter(Boolean)

  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '10px 14px',
          borderRadius: '10px',
          background: 'var(--color-surface-elevated)',
          border: '1px solid var(--color-border-subtle)',
          cursor: 'pointer',
          transition: 'background .15s ease, border-color .15s ease',
          position: 'relative',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--color-surface-strong)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'var(--color-surface-elevated)'
        }}
      >
        <span style={{ display: 'inline-flex', color: 'var(--color-text-secondary)' }}>
          <AppIcon name={getFileIconName(file.icon, file.type)} size={22} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-primary)' }}>{file.name}</div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginTop: '2px' }}>
            {file.type === 'folder' ? `${file.itemCount} itens` : file.size}
            {file.uploadedAt && ` · ${file.uploadedAt}`}
            {teamNames.length > 0 && ` · ${teamNames.join(', ')}`}
          </div>
        </div>
        {file.restricted && (
          <span
            style={{
              fontSize: '10px',
              padding: '2px 8px',
              borderRadius: '999px',
              background: 'var(--color-danger-soft)',
              border: '1px solid var(--color-danger-border)',
              color: 'var(--color-danger)',
            }}
          >
            Restrito
          </span>
        )}
        {onDelete && canDelete && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setIsDeleteDialogOpen(true)
            }}
            aria-label={`Excluir arquivo ${file.name}`}
            title="Excluir arquivo"
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              border: '1px solid var(--color-danger-border)',
              background: 'var(--color-danger-soft)',
              color: 'var(--color-danger)',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'background .18s ease, border-color .18s ease, color .18s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(204,75,75,.2)'
              e.currentTarget.style.borderColor = 'var(--color-danger)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--color-danger-soft)'
              e.currentTarget.style.borderColor = 'var(--color-danger-border)'
            }}
          >
            <AppIcon name="trash" size={14} />
          </button>
        )}
      </div>
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Excluir arquivo"
        description={`O arquivo "${file.name}" será removido permanentemente.`}
        confirmLabel="Excluir arquivo"
        variant="danger"
        onConfirm={async () => {
          setIsDeleteDialogOpen(false)
          await onDelete?.()
        }}
      />
    </>
  )
})

export function FilesView({ canView = true, canManage = true }: { canView?: boolean; canManage?: boolean }) {
  const items = useFilesStore((s) => s.items)
  const uploadFile = useFilesStore((s) => s.uploadFile)
  const deleteFile = useFilesStore((s) => s.deleteFile)
  const loadFiles = useFilesStore((s) => s.loadFiles)
  const isLoading = useFilesStore((s) => s.isLoading)
  const [uploading, setUploading] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    void loadFiles()
  }, [loadFiles])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canManage) return
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    await Promise.all(Array.from(files).map((file) => uploadFile(file)))
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%' }}>
      {/* Header */}
      <div
        style={{
          height: '48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          borderBottom: '1px solid var(--color-border-subtle)',
          flexShrink: 0,
          background: 'var(--color-surface)',
        }}
      >
        <span style={{ fontSize: '14px', fontWeight: 600 }}>Arquivos</span>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={!canManage}
          style={{
            padding: '6px 14px',
            borderRadius: '10px',
            background: canManage ? 'var(--color-accent)' : 'var(--color-border-subtle)',
            color: '#fff',
            border: 'none',
            fontSize: '12px',
            fontWeight: 600,
            cursor: canManage ? 'pointer' : 'default',
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <AppIcon name="upload" size={14} />
            Upload
          </span>
        </button>
        <input ref={fileInputRef} type="file" multiple style={{ display: 'none' }} onChange={handleFileSelect} />
      </div>

      <div style={{ flex: 1, padding: '16px 20px', overflowY: 'auto' }}>
        {!canView ? (
          <EmptyState icon={<AppIcon name="lock" size={28} />} title="Arquivos restritos" description="Sua equipe ainda não pode visualizar os arquivos deste projeto." />
        ) : uploading ? (
          <div style={{ marginBottom: '12px', padding: '8px 12px', background: 'var(--color-accent-soft)', borderRadius: '8px', fontSize: '12px', color: 'var(--color-accent)' }}>
            Uploading...
          </div>
        ) : isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Skeleton height={50} count={6} />
          </div>
        ) : items.length === 0 ? (
          <EmptyState icon={<AppIcon name="folder" size={28} />} title="Nenhum arquivo" description="Esta pasta está vazia. Use o botão Upload para adicionar arquivos." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {items.map((file) => (
              <FileItem key={file.id} file={file} canDelete={canManage} onDelete={() => void deleteFile(file.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default FilesView
