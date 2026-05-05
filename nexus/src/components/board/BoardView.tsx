import { useState } from 'react'
import { DndContext, DragOverlay, closestCorners, PointerSensor, KeyboardSensor, useSensor, useSensors, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { useUIStore } from '../../stores/uiStore'
import { useBoardData } from '../../hooks/queries/useBoardData'
import { useMoveCard } from '../../hooks/mutations/useMoveCard'
import { useCreateColumn } from '../../hooks/mutations/useCreateColumn'
import { KanbanColumn } from './KanbanColumn'
import { TaskCard } from './TaskCard'
import type { KanbanCard } from '../../types'
import { SkeletonList } from '../ui/Skeleton'
import { QueryError } from '../ui/QueryError'
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog'

export function BoardView() {
  const { closeThread, activeProjectId } = useUIStore()
  const { data: boardData, isLoading: boardsLoading, error, refetch } = useBoardData(activeProjectId)
  const moveCardMutation = useMoveCard(activeProjectId)
  const createColumnMutation = useCreateColumn()
  const [activeCard, setActiveCard] = useState<KanbanCard | null>(null)
  const [showColumnModal, setShowColumnModal] = useState(false)
  const [newColumnName, setNewColumnName] = useState('')
  const [newColumnColor, setNewColumnColor] = useState('var(--accent)')
  const [liveMessage, setLiveMessage] = useState('')

  const kanbanColumns = boardData?.cols ?? []
  const kanbanCards = boardData?.cards ?? []

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const card = kanbanCards.find(c => c.id === event.active.id)
    setActiveCard(card || null)
    setLiveMessage(`Movendo tarefa: ${card?.title ?? ''}`)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveCard(null)
    if (!over) {
      setLiveMessage('Movimento cancelado')
      return
    }
    const cardId = String(active.id)
    const overId = String(over.id)

    const isColumn = kanbanColumns.some(c => c.id === overId)
    if (isColumn) {
      if (cardId !== overId) {
        await moveCardMutation.mutateAsync({ cardId, toColumnId: overId })
        const colName = kanbanColumns.find(c => c.id === overId)?.name ?? overId
        setLiveMessage(`Tarefa movida para ${colName}`)
      }
      return
    }

    const targetCard = kanbanCards.find(c => c.id === overId)
    if (targetCard) {
      const dragged = kanbanCards.find(c => c.id === cardId)
      if (dragged && dragged.col !== targetCard.col) {
        await moveCardMutation.mutateAsync({ cardId, toColumnId: targetCard.col })
        const colName = kanbanColumns.find(c => c.id === targetCard.col)?.name ?? targetCard.col
        setLiveMessage(`Tarefa movida para ${colName}`)
      }
    }
  }

  const handleAddColumn = async () => {
    if (!newColumnName.trim() || !activeProjectId) return
    await createColumnMutation.mutateAsync({
      channelId: activeProjectId,
      name: newColumnName.trim(),
      color: newColumnColor,
    })
    setNewColumnName('')
    setNewColumnColor('var(--accent)')
    setShowColumnModal(false)
  }

  const COLORS = ['var(--accent)', '#f472b6', '#34d399', '#fbbf24', '#60a5fa', '#ef4444']

  if (boardsLoading && kanbanColumns.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <SkeletonList count={5} />
      </div>
    )
  }

  if (error && kanbanColumns.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <QueryError message={error.message} onRetry={() => refetch()} />
      </div>
    )
  }

  return (
    <div
      className="flex flex-row h-full overflow-hidden"
      onClick={(e) => {
        if (e.currentTarget === e.target) closeThread()
      }}
    >
      <div
        className="flex flex-col gap-4 h-full p-5 overflow-x-auto overflow-y-hidden flex-1 min-w-0"
        onClick={(e) => {
          if (e.currentTarget === e.target) closeThread()
        }}
      >
        <div aria-live="polite" aria-atomic="true" className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0" style={{ clip: 'rect(0,0,0,0)' }}>
          {liveMessage}
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 h-full">
            {kanbanColumns.map(col => {
              const cards = kanbanCards.filter(c => c.col === col.id)
              return <KanbanColumn key={col.id} column={col} cards={cards} />
            })}
          </div>

          <DragOverlay>
            {activeCard && (
              <div className="opacity-90">
                <TaskCard card={activeCard} isDragOverlay />
              </div>
            )}
          </DragOverlay>
        </DndContext>

        {/* Add column button */}
        <div
          onClick={() => setShowColumnModal(true)}
          role="button"
          tabIndex={0}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setShowColumnModal(true) }}
          className="w-[280px] flex-shrink-0 flex items-center justify-center gap-2 p-4 border-2 border-dashed border-[var(--border)] rounded-xl text-sm font-semibold text-[var(--text-3)] cursor-pointer h-fit self-start"
        >
          + Nova Coluna
        </div>

        {/* Column creation modal */}
        <Dialog open={showColumnModal} onOpenChange={setShowColumnModal}>
          <DialogContent className="min-w-[400px]" style={{ maxWidth: '90vw' }}>
            <DialogTitle id="col-modal-title" className="font-display font-bold text-lg mb-4 text-[var(--text-1)]">
              Nova Coluna
            </DialogTitle>
            <input
              type="text"
              value={newColumnName}
              onChange={e => setNewColumnName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAddColumn() }}
              placeholder="Nome da coluna"
              autoFocus
              className="w-full px-3.5 py-2.5 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg text-[var(--text-1)] font-body text-sm outline-none mb-4"
            />
            <div className="flex gap-2 mb-5 flex-wrap">
              {COLORS.map(c => (
                <button
                  key={c}
                  aria-label={`Cor ${c}`}
                  onClick={() => setNewColumnColor(c)}
                  className="w-8 h-8 rounded-full cursor-pointer transition-border duration-200 p-0"
                  style={{
                    background: c,
                    border: newColumnColor === c ? '3px solid var(--text-1)' : '3px solid transparent',
                  }}
                />
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowColumnModal(false)} className="px-4 py-2 rounded-lg bg-[var(--bg-card)] text-[var(--text-2)] border border-[var(--border)] font-body text-xs font-semibold cursor-pointer">
                Cancelar
              </button>
              <button onClick={handleAddColumn} className="px-4 py-2 rounded-lg bg-[var(--accent)] text-white border-none font-body text-xs font-semibold cursor-pointer">
                Criar
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
