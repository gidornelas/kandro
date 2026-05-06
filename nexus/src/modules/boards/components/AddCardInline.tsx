import React from 'react'
import { useBoardStore } from '../store'

export function AddCardInline({ columnId }: { columnId: string }) {
  const addingToColumn = useBoardStore((s) => s.addingToColumn)
  const addCard = useBoardStore((s) => s.addCard)
  const closeAddCard = useBoardStore((s) => s.closeAddCard)

  const [title, setTitle] = React.useState('')

  if (addingToColumn !== columnId) return null

  const submit = () => {
    const t = title.trim()
    if (t) addCard(columnId, t)
    setTitle('')
  }

  return (
    <div style={{ padding: '0 2px', marginBottom: '6px' }}>
      <input
        autoFocus
        type="text"
        placeholder="Título da tarefa..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') submit()
          if (e.key === 'Escape') closeAddCard()
        }}
        onBlur={() => {
          if (title.trim()) submit()
          else closeAddCard()
        }}
        style={{
          width: '100%',
          padding: '9px 11px',
          borderRadius: '10px',
          border: '1px solid var(--color-accent-border)',
          background: 'rgba(255,255,255,.82)',
          fontSize: '13px',
          fontFamily: 'var(--font-body)',
          color: 'var(--color-text-primary)',
          outline: 'none',
          boxShadow: '0 0 0 2px rgba(47,128,237,.12)',
        }}
      />
    </div>
  )
}
