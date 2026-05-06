import React from 'react'
import { Modal } from '../../../design-system/Modal'
import { useBoardStore } from '../store'
import { USERS } from '../../../shared/mocks'

const PRIORITIES = [
  { label: 'Baixa', color: '#8e8e93' },
  { label: 'Normal', color: '#8e8e93' },
  { label: 'Alta', color: '#cc4b4b' },
]

export function CardModal() {
  const cardId = useBoardStore((s) => s.editingCardId)
  const card = useBoardStore((s) => s.cards.find((c) => c.id === cardId))
  const updateCard = useBoardStore((s) => s.updateCard)
  const deleteCard = useBoardStore((s) => s.deleteCard)
  const close = useBoardStore((s) => s.closeCardModal)

  const [title, setTitle] = React.useState(() => card?.title ?? '')
  const [priority, setPriority] = React.useState(() => card?.priority ?? 'Normal')
  const [progress, setProgress] = React.useState(() => card?.progress ?? 0)
  const [assignees, setAssignees] = React.useState(() => card?.assignees ?? [])

  if (!card) return null

  const priorityColor = PRIORITIES.find((p) => p.label === priority)?.color || '#8e8e93'

  return (
    <Modal open onClose={close} title="Editar tarefa">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', marginBottom: '6px' }}>
            Título
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 10px',
              borderRadius: '8px',
              border: '1px solid var(--color-border)',
              background: 'rgba(255,255,255,.72)',
              fontSize: '13px',
              fontFamily: 'var(--font-body)',
              color: 'var(--color-text-primary)',
              outline: 'none',
            }}
          />
        </div>

        <div>
          <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', marginBottom: '6px' }}>
            Prioridade
          </label>
          <div style={{ display: 'flex', gap: '6px' }}>
            {PRIORITIES.map((p) => (
              <button
                key={p.label}
                onClick={() => setPriority(p.label)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '8px',
                  border: `1px solid ${priority === p.label ? p.color : 'var(--color-border-subtle)'}`,
                  background: priority === p.label ? `${p.color}14` : 'rgba(255,255,255,.52)',
                  fontSize: '12px',
                  cursor: 'pointer',
                  color: priority === p.label ? p.color : 'var(--color-text-secondary)',
                  fontWeight: priority === p.label ? 600 : 400,
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', marginBottom: '6px' }}>
            Progresso: {progress}%
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={progress}
            onChange={(e) => setProgress(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--color-accent)' }}
          />
        </div>

        <div>
          <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', marginBottom: '6px' }}>
            Responsáveis
          </label>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {Object.values(USERS).map((u) => {
              const selected = assignees.includes(u.id)
              return (
                <button
                  key={u.id}
                  onClick={() => {
                    setAssignees((prev) =>
                      selected ? prev.filter((id) => id !== u.id) : [...prev, u.id]
                    )
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '4px 8px',
                    borderRadius: '8px',
                    border: `1px solid ${selected ? u.color : 'var(--color-border-subtle)'}`,
                    background: selected ? `${u.color}14` : 'rgba(255,255,255,.52)',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  <div
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      background: u.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '7px',
                      fontWeight: 700,
                      color: '#fff',
                    }}
                  >
                    {u.initials}
                  </div>
                  <span style={{ color: selected ? u.color : 'var(--color-text-secondary)' }}>{u.name}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
          <button
            onClick={() =>
              updateCard(card.id, { title, priority, priorityColor, progress, assignees })
            }
            style={{
              flex: 1,
              padding: '9px 14px',
              borderRadius: '10px',
              background: 'var(--color-accent)',
              color: '#fff',
              border: 'none',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Salvar
          </button>
          <button
            onClick={() => {
              if (confirm('Excluir esta tarefa?')) deleteCard(card.id)
            }}
            style={{
              padding: '9px 14px',
              borderRadius: '10px',
              background: 'var(--color-danger-soft)',
              color: 'var(--color-danger)',
              border: '1px solid var(--color-danger-border)',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Excluir
          </button>
        </div>
      </div>
    </Modal>
  )
}
