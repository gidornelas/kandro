import React from 'react'
import { useFilesStore } from '../store'
import { TEAMS } from '../../../shared/mocks'
import { Skeleton } from '../../../design-system/Skeleton'
import { EmptyState } from '../../../design-system/EmptyState'

const FileItem = React.memo(function FileItem({ file, onDelete }: { file: { id: string; name: string; type: string; icon: string; size?: string; itemCount?: number; uploadedAt?: string; restricted: boolean; teamIds: string[] }; onDelete?: () => void }) {
  const teamNames = file.teamIds.map((tid) => TEAMS.find((t) => t.id === tid)?.name).filter(Boolean)

  return (
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
        transition: 'all .15s',
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--color-surface-strong)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'var(--color-surface-elevated)'
      }}
    >
      <span style={{ fontSize: '22px' }}>{file.icon}</span>
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
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          style={{
            width: '22px',
            height: '22px',
            borderRadius: '6px',
            border: 'none',
            background: 'transparent',
            color: 'var(--color-text-tertiary)',
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.background = 'var(--color-danger-soft)'; e.currentTarget.style.color = 'var(--color-danger)' }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '0'; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-text-tertiary)' }}
        >
          🗑
        </button>
      )}
    </div>
  )
})

export function FilesView() {
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
          style={{
            padding: '6px 14px',
            borderRadius: '10px',
            background: 'var(--color-accent)',
            color: '#fff',
            border: 'none',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          + Upload
        </button>
        <input ref={fileInputRef} type="file" multiple style={{ display: 'none' }} onChange={handleFileSelect} />
      </div>

      <div style={{ flex: 1, padding: '16px 20px', overflowY: 'auto' }}>
        {uploading && (
          <div style={{ marginBottom: '12px', padding: '8px 12px', background: 'var(--color-accent-soft)', borderRadius: '8px', fontSize: '12px', color: 'var(--color-accent)' }}>
            Uploading...
          </div>
        )}
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Skeleton height={50} count={6} />
          </div>
        ) : items.length === 0 ? (
          <EmptyState icon="📁" title="Nenhum arquivo" description="Esta pasta está vazia. Use o botão Upload para adicionar arquivos." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {items.map((file) => (
              <FileItem key={file.id} file={file} onDelete={() => void deleteFile(file.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default FilesView
