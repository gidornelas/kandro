import React from 'react'
import { ConfirmDialog } from '../../../design-system/ConfirmDialog'
import { useBoardStore } from '../store'

export function ColumnHeader({ col, readOnly = false }: { col: { id: string; name: string; color: string }; readOnly?: boolean }) {
  const editColumnId = useBoardStore((s) => s.editColumnId)
  const openEditColumn = useBoardStore((s) => s.openEditColumn)
  const closeEditColumn = useBoardStore((s) => s.closeEditColumn)
  const updateColumn = useBoardStore((s) => s.updateColumn)
  const deleteColumn = useBoardStore((s) => s.deleteColumn)

  const [name, setName] = React.useState(col.name)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)

  if (editColumnId === col.id) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 10px 10px' }}>
        <input
          autoFocus
          type="text"
          value={name}
          disabled={readOnly}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') void updateColumn(col.id, name.trim() || col.name)
            if (e.key === 'Escape') closeEditColumn()
          }}
          onBlur={() => void updateColumn(col.id, name.trim() || col.name)}
          style={{
            flex: 1,
            minHeight: '36px',
            padding: '4px 8px',
            borderRadius: '6px',
            border: '1px solid var(--color-accent-border)',
            background: 'rgba(255,255,255,.82)',
            fontSize: '12px',
            fontFamily: 'var(--font-body)',
            color: 'var(--color-text-primary)',
            outline: 'none',
          }}
        />
      </div>
    )
  }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '8px 10px 10px' }}>
        <button
          type="button"
          onClick={() => {
            if (readOnly) return
            openEditColumn(col.id)
          }}
          aria-label={readOnly ? `Coluna ${col.name} em modo leitura` : `Editar coluna ${col.name}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            flex: 1,
            minHeight: '32px',
            cursor: readOnly ? 'default' : 'pointer',
            background: 'transparent',
            border: 'none',
            fontFamily: 'var(--font-body)',
            textAlign: 'left',
          }}
        >
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: col.color, opacity: 0.72, boxShadow: '0 0 0 4px rgba(255,255,255,.44)' }} />
          <span style={{ fontSize: '12px', fontWeight: 650, color: 'var(--color-text-secondary)', flex: 1 }}>{col.name}</span>
        </button>
        {!readOnly && (
          <button
            type="button"
            onClick={() => setIsDeleteDialogOpen(true)}
            aria-label={`Excluir coluna ${col.name}`}
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '4px',
              border: 'none',
              background: 'transparent',
              color: 'var(--color-text-tertiary)',
              fontSize: '11px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0.72,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.background = 'var(--color-danger-soft)'; e.currentTarget.style.color = 'var(--color-danger)' }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.72'; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-text-tertiary)' }}
          >
            ×
          </button>
        )}
      </div>
      {!readOnly && (
        <ConfirmDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          title="Excluir coluna"
          description={`A coluna "${col.name}" e todas as tarefas dela serão removidas permanentemente.`}
          confirmLabel="Excluir coluna"
          variant="danger"
          onConfirm={async () => {
            setIsDeleteDialogOpen(false)
            await deleteColumn(col.id)
          }}
        />
      )}
    </>
  )
}
