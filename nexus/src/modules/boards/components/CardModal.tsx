import React from 'react'
import { Modal } from '../../../design-system/Modal'
import { useBoardStore } from '../store'
import { USERS } from '../../../shared/mocks'

const PRIORITIES = [
  { label: 'Baixa', color: '#8e8e93' },
  { label: 'Normal', color: '#2f80ed' },
  { label: 'Alta', color: '#cc4b4b' },
]

let subtaskId = 0

function SectionTitle({ icon, label }: { icon: string; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
      <span style={{ fontSize: '14px' }}>{icon}</span>
      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{label}</span>
    </div>
  )
}

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
  const [description, setDescription] = React.useState(() => card?.description ?? '')
  const [subtasks, setSubtasks] = React.useState(() => card?.subtasks ?? [])
  const [dueDate, setDueDate] = React.useState(() => card?.dueDate ?? '')
  const [files, setFiles] = React.useState(() => card?.files ?? [])
  const [descFocused, setDescFocused] = React.useState(false)
  const [newSubtask, setNewSubtask] = React.useState('')
  const [newLabel, setNewLabel] = React.useState('')
  const [labels, setLabels] = React.useState(() => card?.labels ?? [])
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  if (!card) return null

  const priorityColor = PRIORITIES.find((p) => p.label === priority)?.color || '#8e8e93'

  const toggleSubtask = (id: string) => {
    setSubtasks((prev) => prev.map((st) => (st.id === id ? { ...st, done: !st.done } : st)))
  }

  const addSubtask = () => {
    const text = newSubtask.trim()
    if (!text) return
    setSubtasks((prev) => [...prev, { id: `st-${++subtaskId}`, text, done: false }])
    setNewSubtask('')
  }

  const removeSubtask = (id: string) => {
    setSubtasks((prev) => prev.filter((st) => st.id !== id))
  }

  const addLabel = () => {
    const text = newLabel.trim()
    if (!text || labels.includes(text)) return
    setLabels((prev) => [...prev, text])
    setNewLabel('')
  }

  const removeLabel = (label: string) => {
    setLabels((prev) => prev.filter((l) => l !== label))
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files
    if (!uploaded) return
    Array.from(uploaded).forEach((f) => {
      const icon = f.name.endsWith('.fig') ? '🎨' : f.name.endsWith('.pdf') ? '📄' : '📎'
      const size = f.size > 1024 * 1024 ? `${(f.size / 1024 / 1024).toFixed(1)} MB` : `${(f.size / 1024).toFixed(1)} KB`
      setFiles((prev) => [...prev, { name: f.name, size, icon }])
    })
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSave = () => {
    const doneCount = subtasks.filter((st) => st.done).length
    const total = subtasks.length
    const computedProgress = total > 0 ? Math.round((doneCount / total) * 100) : progress

    updateCard(card.id, {
      title,
      priority,
      priorityColor,
      progress: computedProgress,
      assignees,
      description,
      subtasks,
      dueDate,
      files,
      labels,
      attachments: files.length,
    })
  }

  const completedSubtasks = subtasks.filter((s) => s.done).length

  return (
    <Modal open onClose={close} title="">
      <div style={{ display: 'flex', gap: '20px', minWidth: '600px', maxWidth: '760px' }}>
        {/* Main column */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Title */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 10px',
              borderRadius: '8px',
              border: '1px solid transparent',
              background: 'transparent',
              fontSize: '18px',
              fontWeight: 700,
              fontFamily: 'var(--font-body)',
              color: 'var(--color-text-primary)',
              outline: 'none',
            }}
            onFocus={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,.72)'; e.currentTarget.style.borderColor = 'var(--color-accent-border)' }}
            onBlur={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent' }}
          />

          {/* Labels */}
          {labels.length > 0 && (
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
              {labels.map((l) => (
                <span
                  key={l}
                  style={{
                    padding: '3px 10px',
                    borderRadius: '6px',
                    background: 'var(--color-accent-soft)',
                    border: '1px solid var(--color-accent-border)',
                    color: 'var(--color-accent)',
                    fontSize: '11px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  {l}
                  <button onClick={() => removeLabel(l)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', color: 'inherit', padding: 0 }}>×</button>
                </span>
              ))}
            </div>
          )}

          {/* Description */}
          <div>
            <SectionTitle icon="📝" label="Descrição" />
            <div
              style={{
                background: descFocused ? 'rgba(255,255,255,.78)' : 'rgba(255,255,255,.45)',
                border: `1px solid ${descFocused ? 'var(--color-accent-border)' : 'var(--color-border-subtle)'}`,
                borderRadius: '10px',
                padding: '10px 12px',
                transition: 'all .15s',
              }}
            >
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onFocus={() => setDescFocused(true)}
                onBlur={() => setDescFocused(false)}
                placeholder="Adicione uma descrição mais detalhada..."
                style={{
                  width: '100%',
                  minHeight: '80px',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  resize: 'vertical',
                  fontSize: '13px',
                  fontFamily: 'var(--font-body)',
                  color: 'var(--color-text-primary)',
                  lineHeight: 1.6,
                }}
              />
            </div>
          </div>

          {/* Checklist */}
          <div>
            <SectionTitle icon="✅" label={`Checklist ${completedSubtasks}/${subtasks.length}`} />
            {subtasks.length > 0 && (
              <div style={{ marginBottom: '10px' }}>
                <div style={{ height: '6px', background: 'rgba(255,255,255,.5)', borderRadius: '999px', overflow: 'hidden', marginBottom: '10px' }}>
                  <div
                    style={{
                      height: '100%',
                      background: 'linear-gradient(90deg, var(--color-success), var(--color-accent))',
                      width: `${subtasks.length > 0 ? (completedSubtasks / subtasks.length) * 100 : 0}%`,
                      borderRadius: '999px',
                      transition: 'width .3s',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {subtasks.map((st) => (
                    <div
                      key={st.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 8px',
                        borderRadius: '8px',
                        background: st.done ? 'rgba(53,183,121,.08)' : 'rgba(255,255,255,.35)',
                        border: `1px solid ${st.done ? 'rgba(53,183,121,.2)' : 'var(--color-border-subtle)'}`,
                        transition: 'all .15s',
                      }}
                    >
                      <button
                        onClick={() => toggleSubtask(st.id)}
                        style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '5px',
                          border: `2px solid ${st.done ? 'var(--color-success)' : 'var(--color-border)'}`,
                          background: st.done ? 'var(--color-success)' : 'transparent',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '10px',
                          color: '#fff',
                          flexShrink: 0,
                        }}
                      >
                        {st.done ? '✓' : ''}
                      </button>
                      <span
                        style={{
                          flex: 1,
                          fontSize: '13px',
                          color: st.done ? 'var(--color-text-tertiary)' : 'var(--color-text-primary)',
                          textDecoration: st.done ? 'line-through' : 'none',
                        }}
                      >
                        {st.text}
                      </span>
                      <button
                        onClick={() => removeSubtask(st.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: 'var(--color-text-tertiary)', padding: '2px' }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div style={{ display: 'flex', gap: '6px' }}>
              <input
                type="text"
                placeholder="Adicionar item..."
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') addSubtask() }}
                style={{
                  flex: 1,
                  padding: '7px 10px',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border)',
                  background: 'rgba(255,255,255,.72)',
                  fontSize: '13px',
                  fontFamily: 'var(--font-body)',
                  color: 'var(--color-text-primary)',
                  outline: 'none',
                }}
              />
              <button
                onClick={addSubtask}
                style={{
                  padding: '7px 14px',
                  borderRadius: '8px',
                  background: 'var(--color-accent)',
                  color: '#fff',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ width: '180px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Actions header */}
          <div>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', marginBottom: '8px' }}>
              Ações
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <button
                onClick={handleSave}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: 'var(--color-accent)',
                  color: '#fff',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                💾 Salvar
              </button>
              <button
                onClick={() => { if (confirm('Excluir esta tarefa?')) deleteCard(card.id) }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: 'var(--color-danger-soft)',
                  color: 'var(--color-danger)',
                  border: '1px solid var(--color-danger-border)',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                🗑 Excluir
              </button>
            </div>
          </div>

          {/* Assignees */}
          <div>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', marginBottom: '8px' }}>
              Responsáveis
            </span>
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
                    title={u.name}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: u.color,
                      border: `2px solid ${selected ? 'var(--color-accent)' : 'transparent'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      fontWeight: 700,
                      color: '#fff',
                      cursor: 'pointer',
                      opacity: selected ? 1 : 0.5,
                      transition: 'opacity .15s',
                    }}
                  >
                    {u.initials}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Priority */}
          <div>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', marginBottom: '8px' }}>
              Prioridade
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {PRIORITIES.map((p) => (
                <button
                  key={p.label}
                  onClick={() => setPriority(p.label)}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '8px',
                    border: `1px solid ${priority === p.label ? p.color : 'var(--color-border-subtle)'}`,
                    background: priority === p.label ? `${p.color}14` : 'rgba(255,255,255,.52)',
                    fontSize: '12px',
                    cursor: 'pointer',
                    color: priority === p.label ? p.color : 'var(--color-text-secondary)',
                    fontWeight: priority === p.label ? 600 : 400,
                    textAlign: 'left',
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Progress */}
          <div>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', marginBottom: '8px' }}>
              Progresso: {progress}%
            </span>
            <input
              type="range"
              min={0}
              max={100}
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--color-accent)' }}
            />
          </div>

          {/* Due date */}
          <div>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', marginBottom: '8px' }}>
              Data de vencimento
            </span>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 8px',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                background: 'rgba(255,255,255,.72)',
                fontSize: '12px',
                fontFamily: 'var(--font-body)',
                color: 'var(--color-text-primary)',
                outline: 'none',
              }}
            />
          </div>

          {/* Labels */}
          <div>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', marginBottom: '8px' }}>
              Etiquetas
            </span>
            <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
              <input
                type="text"
                placeholder="Nova etiqueta"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') addLabel() }}
                style={{
                  flex: 1,
                  padding: '5px 8px',
                  borderRadius: '6px',
                  border: '1px solid var(--color-border)',
                  background: 'rgba(255,255,255,.72)',
                  fontSize: '11px',
                  fontFamily: 'var(--font-body)',
                  color: 'var(--color-text-primary)',
                  outline: 'none',
                }}
              />
              <button
                onClick={addLabel}
                style={{
                  padding: '5px 8px',
                  borderRadius: '6px',
                  background: 'var(--color-accent)',
                  color: '#fff',
                  border: 'none',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                +
              </button>
            </div>
          </div>

          {/* Attachments */}
          <div>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', marginBottom: '8px' }}>
              Anexos
            </span>
            <input ref={fileInputRef} type="file" multiple style={{ display: 'none' }} onChange={handleFileUpload} />
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: '100%',
                padding: '7px 10px',
                borderRadius: '8px',
                border: '1px dashed var(--color-border)',
                background: 'rgba(255,255,255,.32)',
                color: 'var(--color-text-tertiary)',
                fontSize: '12px',
                cursor: 'pointer',
                textAlign: 'left',
                marginBottom: '6px',
              }}
            >
              📎 Anexar arquivo
            </button>
            {files.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {files.map((f, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '5px 8px',
                      borderRadius: '6px',
                      background: 'rgba(255,255,255,.45)',
                      border: '1px solid var(--color-border-subtle)',
                    }}
                  >
                    <span style={{ fontSize: '14px' }}>{f.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '11px', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.name}</div>
                      <div style={{ fontSize: '10px', color: 'var(--color-text-tertiary)' }}>{f.size}</div>
                    </div>
                    <button
                      onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: 'var(--color-text-tertiary)', padding: 0 }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}
