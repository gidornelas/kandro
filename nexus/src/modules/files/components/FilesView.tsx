import React from 'react'
import { FILES } from '../../../shared/mocks'
import { Skeleton } from '../../../design-system/Skeleton'
import { EmptyState } from '../../../design-system/EmptyState'

const FileItem = React.memo(function FileItem({ file }: { file: typeof FILES[0] }) {
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
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--color-surface-strong)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'var(--color-surface-elevated)'
      }}
    >
      <span style={{ fontSize: '20px' }}>{file.icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-primary)' }}>{file.name}</div>
        <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginTop: '2px' }}>
          {file.type === 'folder' ? `${file.itemCount} itens` : file.size}
          {file.uploadedAt && ` · ${file.uploadedAt}`}
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
    </div>
  )
})

export function FilesView() {
  const [isLoading] = React.useState(false)

  return (
    <div style={{ flex: 1, padding: '16px 20px', overflowY: 'auto' }}>
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Skeleton height={50} count={6} />
        </div>
      ) : FILES.length === 0 ? (
        <EmptyState
          icon="📁"
          title="Nenhum arquivo"
          description="Esta pasta está vazia. Arraste arquivos para upload."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {FILES.map((file) => (
            <FileItem key={file.id} file={file} />
          ))}
        </div>
      )}
    </div>
  )
}

export default FilesView
