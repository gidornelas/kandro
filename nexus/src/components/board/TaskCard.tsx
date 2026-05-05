import { useState, memo } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useUIStore } from '../../stores/uiStore'
import type { KanbanCard } from '../../types'

interface Props {
  card: KanbanCard
  isDragOverlay?: boolean
}

const LABEL_COLORS: Record<string, string> = {
  Design: 'var(--accent)',
  UX: '#f472b6',
  Dev: '#34d399',
}

const DUE_COLORS: Record<string, string> = {
  normal: 'var(--text-3)',
  warning: 'var(--yellow)',
  overdue: 'var(--red)',
}

const TaskCard = memo(function TaskCard({ card, isDragOverlay }: Props) {
  const { openThread } = useUIStore()
  const [isHovered, setIsHovered] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  }

  const isInteractive = !isDragOverlay && !isDragging

  return (
    <div
      ref={setNodeRef}
      className={`rounded-xl p-3.5 relative flex flex-col gap-2.5 ${
        isDragOverlay
          ? 'border border-[var(--accent)]'
          : 'border border-[var(--border)] hover:border-[var(--accent)] hover:shadow-[0_8px_32px_rgba(124,106,247,0.15)]'
      }`}
      style={{
        ...style,
        background: 'var(--bg-card)',
        transition: isDragOverlay ? undefined : 'all 0.2s ease',
        ...(isDragOverlay ? { boxShadow: '0 8px 32px rgba(124,106,247,0.15)' } : {}),
        ...(isInteractive && isHovered ? { transform: `${style.transform ? style.transform + ' ' : ''}translateY(-2px)`.trim() } : {}),
      }}
      {...attributes}
      {...listeners}
      aria-label={`Tarefa: ${card.title}. Prioridade: ${card.priority}. Pressione espaço para mover.`}
      role="button"
      tabIndex={0}
      onClick={() => {
        if (!isDragOverlay) openThread(card.id)
      }}
      onKeyDown={e => {
        if (e.key === 'Enter' && !isDragOverlay) openThread(card.id)
      }}
      onMouseEnter={() => isInteractive && setIsHovered(true)}
      onMouseLeave={() => isInteractive && setIsHovered(false)}
    >
      {/* Labels */}
      {card.labels.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {card.labels.map(l => {
            const color = LABEL_COLORS[l] || '#9899b0'
            return (
              <span
                key={l}
                className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                style={{ background: `${color}18`, color }}
              >
                {l}
              </span>
            )
          })}
        </div>
      )}

      {/* Title */}
      <div className="text-sm font-semibold text-[var(--text-1)] leading-tight">
        {card.title}
      </div>

      {/* Meta */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-[11px] font-semibold" style={{ color: card.priorityColor }}>
          ● {card.priority}
        </div>
        <div className="flex items-center">
          {card.assignees.map((_pid, i) => (
            <div
              key={i}
              className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-[var(--bg-card)]"
              style={{
                background: 'var(--accent)',
                marginLeft: i === 0 ? 0 : -6,
                zIndex: card.assignees.length - i,
              }}
            >
              {_pid.slice(0, 2).toUpperCase()}
            </div>
          ))}
        </div>
      </div>

      {/* Thread badge */}
      <div className="absolute top-2.5 right-2.5 text-[11px] font-semibold" style={{ color: card.threadCount === 0 ? 'var(--text-3)' : 'var(--accent)' }}>
        💬 {card.threadCount}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
        <div className="flex items-center gap-1 text-[11px] font-medium" style={{ color: DUE_COLORS[card.dueType] || 'var(--text-3)' }}>
          📅 {card.due}
        </div>
        <div className="flex items-center gap-2.5 text-[11px] text-[var(--text-3)]">
          {card.attachments > 0 && <span>📎 {card.attachments}</span>}
        </div>
      </div>

      {/* Progress bar */}
      {card.progress > 0 && (
        <div className="h-0.5 bg-[var(--bg-panel)] rounded overflow-hidden">
          <div
            className="h-full rounded transition-width duration-300"
            style={{ background: 'var(--accent)', width: `${card.progress}%` }}
          />
        </div>
      )}
    </div>
  )
})

export { TaskCard }
