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
import { AppIcon } from '../../../design-system/AppIcon'
import { CardModal } from './CardModal'
import { AddCardInline } from './AddCardInline'
import { ColumnHeader } from './ColumnHeader'
import { FilesView } from '../../files/components/FilesView'
import { useResolvedPermissions } from '../../permissions/hooks'
import { hasPermissionAction } from '../../permissions/utils'

const PROJECT_TABS = [
  { id: 'board', label: 'Board' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'list', label: 'Lista' },
  { id: 'files', label: 'Arquivos' },
] as const

function BoardListView({ columns, cards }: { columns: { id: string; name: string }[]; cards: { id: string; col: string; title: string; priority: string; dueType: string }[] }) {
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '18px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '920px' }}>
        {columns.map((column) => {
          const columnCards = cards.filter((card) => card.col === column.id)
          if (columnCards.length === 0) return null

          return (
            <section
              key={column.id}
              style={{
                borderRadius: '16px',
                border: '1px solid var(--color-border-subtle)',
                background: 'var(--color-surface-elevated)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--color-border-subtle)',
                }}
              >
                <strong style={{ fontSize: '13px', color: 'var(--color-text-primary)' }}>{column.name}</strong>
                <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>{columnCards.length} itens</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {columnCards.map((card, index) => (
                  <div
                    key={card.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'minmax(0,1fr) auto auto',
                      gap: '12px',
                      alignItems: 'center',
                      padding: '12px 16px',
                      borderTop: index === 0 ? 'none' : '1px solid var(--color-border-subtle)',
                    }}
                  >
                    <span style={{ fontSize: '13px', color: 'var(--color-text-primary)' }}>{card.title}</span>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>{card.priority}</span>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>{card.dueType === 'overdue' ? 'Atrasado' : card.dueType === 'warning' ? 'Em atenção' : 'No prazo'}</span>
                  </div>
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}

function BoardTimelineView({ cards }: { cards: { id: string; title: string; dueType: string; progress: number }[] }) {
  const overdueCards = cards.filter((card) => card.dueType === 'overdue')
  const warningCards = cards.filter((card) => card.dueType === 'warning')
  const onTrackCards = cards.filter((card) => card.dueType !== 'overdue' && card.dueType !== 'warning')
  const sections = [
    { id: 'overdue', title: 'Atrasado', tone: 'var(--color-danger)', items: overdueCards },
    { id: 'warning', title: 'Em atenção', tone: 'var(--color-warning)', items: warningCards },
    { id: 'healthy', title: 'No prazo', tone: 'var(--color-success)', items: onTrackCards },
  ]

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '18px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
        {sections.map((section) => (
          <section
            key={section.id}
            style={{
              borderRadius: '16px',
              border: '1px solid var(--color-border-subtle)',
              background: 'var(--color-surface-elevated)',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <strong style={{ fontSize: '13px', color: 'var(--color-text-primary)' }}>{section.title}</strong>
              <span style={{ fontSize: '12px', color: section.tone }}>{section.items.length}</span>
            </div>
            {section.items.length === 0 ? (
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-tertiary)' }}>Nenhuma tarefa nesta faixa.</p>
            ) : (
              section.items.map((card) => (
                <div
                  key={card.id}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,.56)',
                    border: '1px solid var(--color-border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <span style={{ fontSize: '13px', color: 'var(--color-text-primary)' }}>{card.title}</span>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,.72)', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${card.progress}%`, borderRadius: '999px', background: section.tone }} />
                  </div>
                </div>
              ))
            )}
          </section>
        ))}
      </div>
    </div>
  )
}

function KanbanCardItem({
  card,
  readOnly = false,
}: {
  card: { id: string; title: string; labels: string[]; priority: string; priorityColor: string; assignees: string[]; dueType: string; progress: number; threadCount: number }
  readOnly?: boolean
}) {
  const openCardModal = useBoardStore((s) => s.openCardModal)
  const users = useAppDataStore((s) => s.users)
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: card.id, disabled: readOnly })

  const isOverdue = card.dueType === 'overdue'
  const isWarning = card.dueType === 'warning'

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      role="button"
      tabIndex={0}
      aria-label={`Abrir tarefa ${card.title}`}
      onClick={() => openCardModal(card.id)}
      onKeyDown={(event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return
        event.preventDefault()
        openCardModal(card.id)
      }}
      style={{
        background: 'var(--color-surface-elevated)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: '14px',
        padding: '12px 13px',
        cursor: readOnly ? 'pointer' : 'grab',
        transition: 'background .2s ease, border-color .2s ease, box-shadow .2s ease, transform .2s ease',
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

const KanbanColumn = React.memo(function KanbanColumn({ colId, readOnly = false }: { colId: string; readOnly?: boolean }) {
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
      <ColumnHeader col={col} readOnly={readOnly} />
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', minHeight: 0 }}>
        <AddCardInline columnId={col.id} disabled={readOnly} />
        {columnCards.map((card) => (
          <KanbanCardItem key={card.id} card={card} readOnly={readOnly} />
        ))}
      </div>
      <button
        onClick={() => {
          if (readOnly) return
          openAddCard(col.id)
        }}
        disabled={readOnly}
        style={{
          marginTop: '6px',
          padding: '7px 10px',
          border: '1px dashed var(--color-border)',
          borderRadius: '14px',
          color: 'var(--color-text-tertiary)',
          fontSize: '12px',
          cursor: readOnly ? 'default' : 'pointer',
          transition: 'background .15s ease, border-color .15s ease, color .15s ease',
          textAlign: 'left',
          background: 'rgba(255,255,255,.32)',
          fontFamily: 'var(--font-body)',
        }}
        onMouseEnter={(e) => {
          if (readOnly) return
          e.currentTarget.style.background = 'rgba(255,255,255,.62)'
          e.currentTarget.style.borderColor = 'var(--color-border-subtle)'
        }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,.32)'; e.currentTarget.style.borderColor = 'var(--color-border)' }}
      >
        + Adicionar tarefa
      </button>
    </div>
  )
})

export function BoardView() {
  const activeProjectId = useUIStore((s) => s.activeProjectId)
  const projectView = useUIStore((s) => s.projectView)
  const setProjectView = useUIStore((s) => s.setProjectView)
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
  const permissions = useResolvedPermissions(activeProjectId, 'board')
  const canViewBoard = hasPermissionAction(permissions.actions, 'view')
  const canEditBoard = hasPermissionAction(permissions.actions, 'edit') || hasPermissionAction(permissions.actions, 'manage')
  const canCommentBoard = hasPermissionAction(permissions.actions, 'comment') || canEditBoard

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
    if (!canEditBoard) return
    setActiveId(String(event.active.id))
  }, [canEditBoard])

  const handleDragEnd = React.useCallback((event: { active: { id: string | number }; over: { id: string | number } | null }) => {
    setActiveId(null)
    if (!canEditBoard) return
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
  }, [canEditBoard, cards, columns, moveCard])

  const boardContent = (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div style={{ flex: 1, overflowX: 'auto', overflowY: 'hidden', padding: '16px 18px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
        {!canViewBoard ? (
          <EmptyState
            icon={<AppIcon name="lock" size={28} />}
            title="Board restrito"
            description="Sua equipe ainda não tem permissão para visualizar este projeto."
          />
        ) : isLoading ? (
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
            icon={<AppIcon name="checklist" size={28} />}
            title="Nenhuma coluna"
            description="Adicione uma coluna para começar a organizar."
          />
        ) : (
          <>
            {columns.map((col) => (
              <KanbanColumn key={col.id} colId={col.id} readOnly={!canEditBoard} />
            ))}
            <div style={{ width: '260px', flexShrink: 0 }}>
              {showAddCol && canEditBoard ? (
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
                      minHeight: '40px',
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
                  type="button"
                  onClick={() => {
                    if (!canEditBoard) return
                    setShowAddCol(true)
                  }}
                  disabled={!canEditBoard}
                  style={{
                    width: '100%',
                    minHeight: '40px',
                    padding: '10px',
                    border: '1px dashed var(--color-border)',
                    borderRadius: '14px',
                    color: 'var(--color-text-tertiary)',
                    fontSize: '12px',
                    cursor: canEditBoard ? 'pointer' : 'default',
                    background: 'rgba(255,255,255,.32)',
                    fontFamily: 'var(--font-body)',
                    transition: 'background .15s ease, border-color .15s ease, color .15s ease',
                    opacity: canEditBoard ? 1 : 0.5,
                  }}
                  onMouseEnter={(e) => { if (canEditBoard) e.currentTarget.style.background = 'rgba(255,255,255,.62)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,.32)' }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <AppIcon name="plus" size={14} />
                    Nova coluna
                  </span>
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
  )

  const currentView = !canViewBoard
    ? (
        <div style={{ flex: 1, display: 'flex' }}>
          <EmptyState
            icon={<AppIcon name="lock" size={28} />}
            title="Projeto restrito"
            description="Sua equipe ainda não tem permissão para visualizar este projeto."
          />
        </div>
      )
    : projectView === 'board'
      ? boardContent
      : projectView === 'files'
        ? <FilesView canView={canViewBoard} canManage={canEditBoard} />
        : projectView === 'list'
          ? <BoardListView columns={columns} cards={cards} />
          : <BoardTimelineView cards={cards} />

  return (
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0, height: '100%' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <div
          style={{
            minHeight: '44px',
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
            gap: '2px',
            borderBottom: '1px solid var(--color-border-subtle)',
            flexShrink: 0,
            background: 'var(--color-surface)',
          }}
          role="tablist"
          aria-label="Visualizações do projeto"
        >
          {PROJECT_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`project-tab-${tab.id}`}
              aria-selected={projectView === tab.id}
              aria-controls={`project-panel-${tab.id}`}
              onClick={() => setProjectView(tab.id)}
              style={{
                minHeight: '32px',
                padding: '0 12px',
                borderRadius: '10px',
                background: projectView === tab.id ? 'rgba(255,255,255,.82)' : 'transparent',
                color: projectView === tab.id ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
                fontSize: '12px',
                fontFamily: 'var(--font-body)',
                cursor: 'pointer',
                border: projectView === tab.id ? '1px solid var(--color-border-subtle)' : '1px solid transparent',
                transition: 'background .15s ease, border-color .15s ease, color .15s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div
          id={`project-panel-${projectView}`}
          role="tabpanel"
          aria-labelledby={`project-tab-${projectView}`}
          style={{ flex: 1, minHeight: 0, display: 'flex', overflow: 'hidden', position: 'relative' }}
        >
          {!canEditBoard && canViewBoard && (
            <div
              style={{
                position: 'absolute',
                top: '56px',
                right: '16px',
                zIndex: 2,
                padding: '6px 10px',
                borderRadius: '999px',
                background: 'var(--color-warning-soft)',
                border: '1px solid var(--color-warning-border)',
                color: 'var(--color-warning)',
                fontSize: '11px',
                fontWeight: 700,
              }}
            >
              Modo leitura
            </div>
          )}
          {currentView}
        </div>
      </div>
      {editingCardId && <CardModal readOnly={!canEditBoard} canComment={canCommentBoard} />}
    </div>
  )
}

export default BoardView
