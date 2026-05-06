import React from 'react'
import { useBoardStore } from '../store'

export function ColumnHeader({ col }: { col: { id: string; name: string; color: string } }) {
  const editColumnId = useBoardStore((s) => s.editColumnId)
  const openEditColumn = useBoardStore((s) => s.openEditColumn)
  const closeEditColumn = useBoardStore((s) => s.closeEditColumn)
  const updateColumn = useBoardStore((s) => s.updateColumn)
  const deleteColumn = useBoardStore((s) => s.deleteColumn)

  const [name, setName] = React.useState(col.name)

  if (editColumnId === col.id) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 10px 10px' }}>
        <input
          autoFocus
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') updateColumn(col.id, name.trim() || col.name)
            if (e.key === 'Escape') closeEditColumn()
          }}
          onBlur={() => updateColumn(col.id, name.trim() || col.name)}
          style={{
            flex: 1,
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
    <div
      style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '8px 10px 10px', cursor: 'pointer' }}
      onClick={() => openEditColumn(col.id)}
      title="Clique para editar coluna"
    >
      <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: col.color, opacity: 0.72, boxShadow: '0 0 0 4px rgba(255,255,255,.44)' }} />
      <span style={{ fontSize: '12px', fontWeight: 650, color: 'var(--color-text-secondary)', flex: 1 }}>{col.name}</span>
      <button
        onClick={(e) => {
          e.stopPropagation()
          if (confirm(`Excluir coluna "${col.name}" e todas as tarefas?`)) deleteColumn(col.id)
        }}
        style={{
          width: '18px',
          height: '18px',
          borderRadius: '4px',
          border: 'none',
          background: 'transparent',
          color: 'var(--color-text-tertiary)',
          fontSize: '11px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.background = 'var(--color-danger-soft)'; e.currentTarget.style.color = 'var(--color-danger)' }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = '0'; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-text-tertiary)' }}
      >
        ×
      </button>
    </div>
  )
}
