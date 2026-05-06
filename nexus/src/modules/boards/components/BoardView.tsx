import React from 'react'
import { useUIStore } from '../../ui/store'
import { KANBAN_COLUMNS, KANBAN_CARDS, USERS } from '../../../shared/mocks'
import { Skeleton } from '../../../design-system/Skeleton'
import { EmptyState } from '../../../design-system/EmptyState'

const KanbanCardItem = React.memo(function KanbanCardItem({ card }: { card: typeof KANBAN_CARDS[0] }) {
  const openThread = useUIStore((s) => s.openThread)
  const isOverdue = card.dueType === 'overdue'
  const isWarning = card.dueType === 'warning'

  return (
    <div
      onClick={() => openThread(card.id)}
      style={{
        background: 'var(--color-surface-elevated)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: '14px',
        padding: '12px 13px',
        cursor: 'pointer',
        transition: 'all .2s',
        position: 'relative',
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
          {card.labels.map((label, i) => (
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
          {card.assignees.map((uid, i) => {
            const u = USERS[uid]
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
})

export function BoardView() {
  const cards = KANBAN_CARDS
  const [isLoading] = React.useState(false)

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
        <div style={{ flex: 1, overflowX: 'auto', overflowY: 'hidden', padding: '16px 18px', display: 'flex', gap: '14px' }}>
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
          ) : cards.length === 0 ? (
            <EmptyState
              icon="📋"
              title="Nenhuma tarefa"
              description="Este board está vazio. Adicione uma coluna e comece a organizar."
            />
          ) : (
            KANBAN_COLUMNS.map((col) => {
              const colCards = cards.filter((c) => c.col === col.id)
              return (
                <div key={col.id} style={{ width: '236px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 0, minHeight: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '8px 10px 10px' }}>
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: col.color, opacity: 0.72, boxShadow: '0 0 0 4px rgba(255,255,255,.44)' }} />
                    <span style={{ fontSize: '12px', fontWeight: 650, color: 'var(--color-text-secondary)', flex: 1 }}>{col.name}</span>
                    <span
                      style={{
                        fontSize: '10px',
                        color: 'var(--color-text-tertiary)',
                        background: 'var(--color-surface-elevated)',
                        padding: '1px 6px',
                        borderRadius: '8px',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {colCards.length}
                    </span>
                  </div>
                  <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {colCards.map((card) => (
                      <KanbanCardItem key={card.id} card={card} />
                    ))}
                  </div>
                  <div
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
                    }}
                  >
                    + Adicionar tarefa
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
