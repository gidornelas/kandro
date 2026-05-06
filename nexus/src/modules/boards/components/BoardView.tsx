import React from 'react'
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { useBoardStore } from '../store'
import { useAppDataStore } from '../../app-data/store'
import { useUIStore } from '../../ui/store'
import { Skeleton } from '../../../design-system/Skeleton'
import { EmptyState } from '../../../design-system/EmptyState'
import { CardModal } from './CardModal'
import { AddCardInline } from './AddCardInline'
import { ColumnHeader } from './ColumnHeader'

function KanbanCardItem({ card }: { card: { id: string; title: string; labels: string[]; priority: string; priorityColor: string; assignees: string[]; dueType: string; progress: number; threadCount: number } }) {
  const openCardModal = useBoardStore((s) => s.openCardModal)
  const users = useAppDataStore((s) => s.users)
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: card.id })

  const isOverdue = card.dueType === 'overdue'
  const isWarning = card.dueType === 'warning'

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={() => openCardModal(card.id)}
      style={{
        background: 'var(--color-surface-elevated)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: '14px',
        padding: '12px 13px',
        cursor: 'grab',
        transition: 'all .2s',
        position: 'relative',
        opacity: isDragging ? 0.5 : 1,
        transform: isDragging ? 'scale(1.02)' : 'none',
        boxShadow: isDragging ? 'var(--shadow-soft)' : 'none',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget
        el.style.background = 'var(--color-surface-strong)'
        el.style.borderColor = 'var(--color-border)'
        el.style.transform = 'translateY(-1px)'
        el.style.boxShadow = 'var(--shadow-soft)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget
        el.style.background = 'var(--color-surface-elevated)'
        el.style.borderColor = 'var(--color-border-subtle)'
        el.style.transform = 'none'
        el.style.boxShadow = 'none'
      }}
    >
      {card.labels.length > 0 && (
        <div style={{ display: 'flex', gap: '5px', marginBottom: '7px', flexWrap: 'wrap' }}>
          {card.labels.map((label: string, i: number) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: 500, color: 'var(--color-text-tertiary)' }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#2f80ed', opacity: 0.72 }} />
              {label}
            </span>
          ))}
        </div>
      )}
      <div style={{ fontSize: '13px', fontWeight: 500, lineHeight: 1.45, color: 'var(--color-text-primary)', marginBottom: '10px' }}>
        {card.title}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <div style={{ display: 'flex' }}>
          {card.assignees.map((uid: string, i: number) => {
            const u = users[uid]
            return (
              <div
                key={uid}
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: u?.color || 'var(--color-accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '7px',
                  fontWeight: 700,
                  color: '#fff',
                  border: '1.5px solid var(--color-surface-elevated)',
                  marginLeft: i > 0 ? '-5px' : 0,
                }}
              >
                {u?.initials}
              </div>
            )
          })}
        </div>
        <div style={{ flex: 1, height: '5px', background: 'rgba(255,255,255,.72)', borderRadius: '999px', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              borderRadius: '999px',
              background: 'linear-gradient(90deg, #ff79b0, var(--color-accent))',
              width: `${card.progress}%`,
            }}
          />
        </div>
        <span
          style={{
            fontSize: '10px',
            fontWeight: 500,
            marginLeft: 'auto',
            color: isOverdue ? 'var(--color-danger)' : isWarning ? 'var(--color-warning)' : 'var(--color-text-tertiary)',
          }}
        >
          {card.priority === 'Alta' ? '↑ Alta' : card.priority}
        </span>
      </div>
      {card.threadCount > 0 && (
        <span
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            fontSize: '10px',
            color: 'var(--color-text-tertiary)',
          }}
        >
          {card.threadCount}
        </span>
      )}
    </div>
  )
}

const KanbanColumn = React.memo(function KanbanColumn({ colId }: { colId: string }) {
  const col = useBoardStore((s) => s.columns.find((c) => c.id === colId))
  const allCards = useBoardStore((s) => s.cards)
  const openAddCard = useBoardStore((s) => s.openAddCard)
  const { setNodeRef, isOver } = useDroppable({ id: colId })

  const columnCards = React.useMemo(() => {
    return allCards.filter((c) => c.col === colId)
  }, [allCards, colId])

  if (!col) return null

  return (
    <div
      ref={setNodeRef}
      style={{
        width: '260px',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        minHeight: 0,
        background: isOver ? 'rgba(47,128,237,.06)' : 'transparent',
        borderRadius: 'var(--radius-md)',
        transition: 'background .15s',
        padding: '0 4px',
      }}
    >
      <ColumnHeader col={col} />
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', minHeight: 0 }}>
        <AddCardInline columnId={col.id} />
        {columnCards.map((card) => (
          <KanbanCardItem key={card.id} card={card} />
        ))}
      </div>
      <button
        onClick={() => openAddCard(col.id)}
        style={{
          marginTop: '6px',
          padding: '7px 10px',
          border: '1px dashed var(--color-border)',
          borderRadius: '14px',
          color: 'var(--color-text-tertiary)',
          fontSize: '12px',
          cursor: 'pointer',
          transition: 'all .15s',
          textAlign: 'left',
          background: 'rgba(255,255,255,.32)',
          fontFamily: 'var(--font-body)',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,.62)'; e.currentTarget.style.borderColor = 'var(--color-border-subtle)' }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,.32)'; e.currentTarget.style.borderColor = 'var(--color-border)' }}
      >
        + Adicionar tarefa
      </button>
    </div>
  )
})

export function BoardView() {
  const activeProjectId = useUIStore((s) => s.activeProjectId)
  const columns = useBoardStore((s) => s.columns)
  const cards = useBoardStore((s) => s.cards)
  const moveCard = useBoardStore((s) => s.moveCard)
  const addColumn = useBoardStore((s) => s.addColumn)
  const loadBoard = useBoardStore((s) => s.loadBoard)
  const editingCardId = useBoardStore((s) => s.editingCardId)
  const isLoading = useBoardStore((s) => s.isLoading)
  const [newColName, setNewColName] = React.useState('')
  const [showAddCol, setShowAddCol] = React.useState(false)
  const [activeId, setActiveId] = React.useState<string | null>(null)

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  )

  const activeCard = React.useMemo(() => {
    if (!activeId) return null
    return cards.find((c) => c.id === activeId) ?? null
  }, [activeId, cards])

  React.useEffect(() => {
    if (!activeProjectId) return
    void loadBoard(activeProjectId)
  }, [activeProjectId, loadBoard])

  const handleDragStart = React.useCallback((event: { active: { id: string | number } }) => {
    setActiveId(String(event.active.id))
  }, [])

  const handleDragEnd = React.useCallback((event: { active: { id: string | number }; over: { id: string | number } | null }) => {
    setActiveId(null)
    if (!event.over) return
    const activeIdStr = String(event.active.id)
    const overIdStr = String(event.over.id)
    const card = cards.find((c) => c.id === activeIdStr)
    if (!card) return
    const targetCol = columns.find((c) => c.id === overIdStr)
    if (targetCol) {
      moveCard(card.id, targetCol.id)
      return
    }
    const overCard = cards.find((c) => c.id === overIdStr)
    if (overCard && overCard.col !== card.col) {
      moveCard(card.id, overCard.col)
    }
  }, [cards, columns, moveCard])

  return (
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0, height: '100%' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <div
          style={{
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
            gap: '2px',
            borderBottom: '1px solid var(--color-border-subtle)',
            flexShrink: 0,
            background: 'var(--color-surface)',
          }}
        >
          {['Board', 'Timeline', 'Lista', 'Arquivos'].map((tab) => (
            <button
              key={tab}
              style={{
                height: '26px',
                padding: '0 12px',
                borderRadius: '10px',
                background: tab === 'Board' ? 'rgba(255,255,255,.82)' : 'transparent',
                color: tab === 'Board' ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
                fontSize: '12px',
                fontFamily: 'var(--font-body)',
                cursor: 'pointer',
                border: tab === 'Board' ? '1px solid var(--color-border-subtle)' : '1px solid transparent',
              }}
            >
              {tab}
            </button>
          ))}
        </div>
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div style={{ flex: 1, overflowX: 'auto', overflowY: 'hidden', padding: '16px 18px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            {isLoading ? (
              <>
                <div style={{ width: '236px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <Skeleton height={24} />
                  <Skeleton height={80} count={3} />
                </div>
                <div style={{ width: '236px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <Skeleton height={24} />
                  <Skeleton height={80} count={3} />
                </div>
              </>
            ) : columns.length === 0 ? (
              <EmptyState
                icon="📋"
                title="Nenhuma coluna"
                description="Adicione uma coluna para começar a organizar."
              />
            ) : (
              <>
                {columns.map((col) => (
                  <KanbanColumn key={col.id} colId={col.id} />
                ))}
                <div style={{ width: '260px', flexShrink: 0 }}>
                  {showAddCol ? (
                    <div style={{ padding: '8px 10px' }}>
                      <input
                        autoFocus
                        type="text"
                        placeholder="Nome da coluna..."
                        value={newColName}
                        onChange={(e) => setNewColName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const name = newColName.trim()
                            if (name && activeProjectId) void addColumn(activeProjectId, name)
                            setNewColName('')
                            setShowAddCol(false)
                          }
                          if (e.key === 'Escape') {
                            setNewColName('')
                            setShowAddCol(false)
                          }
                        }}
                        onBlur={() => {
                          const name = newColName.trim()
                          if (name && activeProjectId) void addColumn(activeProjectId, name)
                          setNewColName('')
                          setShowAddCol(false)
                        }}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          borderRadius: '10px',
                          border: '1px solid var(--color-accent-border)',
                          background: 'rgba(255,255,255,.82)',
                          fontSize: '13px',
                          fontFamily: 'var(--font-body)',
                          color: 'var(--color-text-primary)',
                          outline: 'none',
                        }}
                      />
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowAddCol(true)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px dashed var(--color-border)',
                        borderRadius: '14px',
                        color: 'var(--color-text-tertiary)',
                        fontSize: '12px',
                        cursor: 'pointer',
                        background: 'rgba(255,255,255,.32)',
                        fontFamily: 'var(--font-body)',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,.62)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,.32)' }}
                    >
                      + Nova coluna
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
          <DragOverlay dropAnimation={null}>
            {activeCard ? (
              <div
                style={{
                  background: 'var(--color-surface-strong)',
                  border: '1px solid var(--color-accent-border)',
                  borderRadius: '14px',
                  padding: '12px 13px',
                  boxShadow: 'var(--shadow-soft)',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'var(--color-text-primary)',
                  cursor: 'grabbing',
                  opacity: 0.95,
                  transform: 'rotate(2deg)',
                }}
              >
                {activeCard.title}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
      {editingCardId && <CardModal />}
    </div>
  )
}

export default BoardView
