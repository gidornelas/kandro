import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useCreateCard } from '../../hooks/mutations/useCreateCard'
import { TaskCard } from './TaskCard'
import type { KanbanColumn as KanbanColumnType, KanbanCard } from '../../types'

interface Props {
  column: KanbanColumnType
  cards: KanbanCard[]
}

export function KanbanColumn({ column, cards }: Props) {
  const createCardMutation = useCreateCard()
  const [isAddingCard, setIsAddingCard] = useState(false)
  const [newCardTitle, setNewCardTitle] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const { setNodeRef, isOver } = useDroppable({ id: column.id })

  const handleAddCard = async () => {
    if (!newCardTitle.trim()) return
    setIsCreating(true)
    await createCardMutation.mutateAsync({
      columnId: column.id,
      input: {
        title: newCardTitle.trim(),
        priority: 'Média',
        priorityColor: '#fbbf24',
      },
    })
    setNewCardTitle('')
    setIsAddingCard(false)
    setIsCreating(false)
  }

  return (
    <div className="w-[280px] flex-shrink-0 flex flex-col max-h-full">
      {/* Header */}
      <div className="flex items-center gap-2 pb-3 flex-shrink-0">
        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: column.color }} />
        <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-2)]">
          {column.name}
        </div>
        <div className="ml-auto px-2 py-0.5 bg-[var(--bg-card)] rounded-full text-[11px] font-bold text-[var(--text-3)]">
          {cards.length}
        </div>
      </div>

      {/* Cards list */}
      <div
        ref={setNodeRef}
        role="region"
        aria-label={`Coluna ${column.name}, ${cards.length} tarefas`}
        className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1 rounded-lg transition-all duration-200"
        style={{
          background: isOver ? 'rgba(124,106,247,0.04)' : 'transparent',
          boxShadow: isOver ? 'inset 0 0 0 1px var(--accent)' : 'none',
        }}
      >
        <SortableContext items={cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
          {cards.map(card => (
            <TaskCard key={card.id} card={card} />
          ))}
        </SortableContext>
      </div>

      {/* Add card */}
      {isAddingCard ? (
        <div className="mt-2 flex flex-col gap-2">
          <input
            type="text"
            value={newCardTitle}
            onChange={e => setNewCardTitle(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAddCard() }}
            placeholder="Título da tarefa"
            autoFocus
            disabled={isCreating}
            className="w-full px-3.5 py-2.5 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg text-[var(--text-1)] font-body text-sm outline-none"
          />
          <div className="flex gap-2">
            <button onClick={handleAddCard} disabled={isCreating} className="px-3 py-1.5 rounded-md bg-[var(--accent)] text-white border-none font-body text-xs font-semibold cursor-pointer disabled:opacity-50">
              {isCreating ? 'Criando…' : 'Criar'}
            </button>
            <button onClick={() => { setIsAddingCard(false); setNewCardTitle('') }} className="px-3 py-1.5 rounded-md bg-transparent text-[var(--text-3)] border-none font-body text-xs font-semibold cursor-pointer">
              ✕ Cancelar
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAddingCard(true)}
          className="flex items-center justify-center gap-1.5 p-2.5 border border-dashed border-[var(--border)] rounded-lg text-xs font-medium text-[var(--text-3)] cursor-pointer bg-transparent flex-shrink-0 mt-2 w-full"
        >
          + Adicionar tarefa
        </button>
      )}
    </div>
  )
}
