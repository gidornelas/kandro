import { useState } from 'react'
import * as Sheet from '@radix-ui/react-dialog'
import { useUIStore } from '../../stores/uiStore'
import { useCardDetail } from '../../hooks/queries/useCardDetail'
import { useCreateComment } from '../../hooks/mutations/useCreateComment'
import { useUpdateSubtask } from '../../hooks/mutations/useUpdateSubtask'
import { SkeletonList } from '../ui/Skeleton'
import { QueryError } from '../ui/QueryError'

const DUE_COLORS: Record<string, string> = {
  normal: 'var(--text-2)',
  warning: 'var(--yellow)',
  overdue: 'var(--red)',
}

export default function TaskModal() {
  const { activeCardId, closeModal } = useUIStore()
  const { data: detail, isLoading, error, refetch } = useCardDetail(activeCardId)
  const [title, setTitle] = useState('')
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [newComment, setNewComment] = useState('')

  const createCommentMutation = useCreateComment()
  const updateSubtaskMutation = useUpdateSubtask()

  const toggleSubtask = async (subtaskId: string, done: boolean) => {
    await updateSubtaskMutation.mutateAsync({ subtaskId, input: { done: !done } })
  }

  const handleSendComment = async () => {
    if (!newComment.trim() || !activeCardId) return
    await createCommentMutation.mutateAsync({ cardId: activeCardId, text: newComment.trim() })
    setNewComment('')
  }

  if (!activeCardId) return null

  return (
    <Sheet.Root open onOpenChange={(open) => { if (!open) closeModal() }}>
      <Sheet.Portal>
        <Sheet.Overlay className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[5000]" />
        <Sheet.Content className="fixed right-0 top-0 bottom-0 w-[420px] max-w-[90vw] bg-[var(--bg-panel)] border-l border-[var(--border)] shadow-[var(--shadow-modal)] flex flex-col overflow-hidden z-[5001] outline-none">
          {isLoading && (
            <div className="flex-1 flex items-center justify-center">
              <SkeletonList count={5} />
            </div>
          )}
          {!isLoading && error && (
            <div className="flex-1 flex items-center justify-center p-6">
              <QueryError message={error.message} onRetry={() => refetch()} />
            </div>
          )}
          {!isLoading && !error && detail && (
            <>
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border)] flex-shrink-0">
                {isEditingTitle ? (
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    onBlur={() => setIsEditingTitle(false)}
                    onKeyDown={e => { if (e.key === 'Enter') setIsEditingTitle(false) }}
                    autoFocus
                    className="flex-1 font-display font-bold text-lg text-[var(--text-1)] bg-[var(--bg-card)] border border-[var(--accent)] rounded-md px-2 py-1 outline-none mr-3"
                  />
                ) : (
                  <div
                    onClick={() => { setTitle(detail.title); setIsEditingTitle(true) }}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTitle(detail.title); setIsEditingTitle(true) } }}
                    tabIndex={0}
                    role="button"
                    aria-label="Editar título"
                    className="flex-1 font-display font-bold text-lg cursor-text px-2 py-1 -mx-2 -my-1 rounded-md border border-transparent text-[var(--text-1)] mr-3 hover:bg-[var(--bg-hover)] hover:border-[var(--border)] outline-none focus-visible:border-[var(--accent)]"
                  >
                    {detail.title}
                  </div>
                )}
                <Sheet.Close asChild>
                  <button aria-label="Fechar modal" className="w-8 h-8 rounded-lg border-none bg-transparent text-[var(--text-3)] cursor-pointer flex items-center justify-center text-xl">
                    ×
                  </button>
                </Sheet.Close>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                {/* Details */}
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-3)] mb-2.5">
                    Detalhes
                  </div>
                  <div className="flex items-center gap-4 flex-wrap">
                    {(detail.labels ?? []).map(l => (
                      <div
                        key={l.id}
                        className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider"
                        style={{ background: `${l.color}18`, color: l.color }}
                      >
                        {l.name}
                      </div>
                    ))}
                    {detail.priority && (
                      <div className="flex items-center gap-1.5 text-xs" style={{ color: detail.priorityColor }}>
                        ● {detail.priority}
                      </div>
                    )}
                    {detail.due && (
                      <div className="flex items-center gap-1.5 text-xs" style={{ color: DUE_COLORS[detail.dueType] || 'var(--text-2)' }}>
                        📅 {new Date(detail.due).toLocaleDateString('pt-BR')}
                      </div>
                    )}
                  </div>
                  {(detail.assignees ?? []).length > 0 && (
                    <div className="flex items-center gap-4 mt-3 text-xs text-[var(--text-2)]">
                      👤 {detail.assignees.map(a => a.user?.name || a.userId).join(', ')}
                    </div>
                  )}
                </div>

                {/* Description */}
                {detail.description && (
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-3)] mb-2.5">
                      Descrição
                    </div>
                    <div className="text-sm leading-relaxed text-[var(--text-2)] p-3.5 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg min-h-[100px]">
                      {detail.description}
                    </div>
                  </div>
                )}

                {/* Subtasks */}
                {(detail.subtasks ?? []).length > 0 && (
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-3)] mb-2.5">
                      Subtarefas
                    </div>
                    <div className="flex flex-col gap-2">
                      {detail.subtasks.map(st => (
                        <label
                          key={st.id}
                          className="flex items-center gap-2.5 px-3 py-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-md text-xs cursor-pointer"
                          style={{
                            color: st.done ? 'var(--text-3)' : 'var(--text-2)',
                            textDecoration: st.done ? 'line-through' : 'none',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={st.done}
                            onChange={() => toggleSubtask(st.id, st.done)}
                            className="w-4 h-4 accent-[var(--accent)] cursor-pointer"
                          />
                          <span>{st.text}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Comments */}
                {(detail.comments ?? []).length > 0 && (
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-3)] mb-2.5">
                      Comentários
                    </div>
                    <div className="flex flex-col gap-3">
                      {detail.comments.map(c => (
                        <div key={c.id} className="flex gap-2.5">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
                            style={{ background: c.user?.color || 'var(--accent)' }}
                          >
                            {c.user?.initials || '?'}
                          </div>
                          <div className="flex-1 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg px-3 py-2.5">
                            <div className="text-xs font-semibold text-[var(--text-1)] mb-0.5">
                              {c.user?.name || c.userId}
                            </div>
                            <div className="text-xs text-[var(--text-2)] leading-relaxed">
                              {c.text}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Comment input */}
              <div className="flex-shrink-0 border-t border-[var(--border)] p-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendComment() } }}
                    placeholder="Adicionar comentário…"
                    disabled={createCommentMutation.isPending}
                    className="flex-1 px-3 py-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg text-xs text-[var(--text-1)] font-body outline-none disabled:opacity-50"
                  />
                  <button
                    onClick={handleSendComment}
                    disabled={!newComment.trim() || createCommentMutation.isPending}
                    className="px-3 py-2 rounded-lg bg-[var(--accent)] text-white border-none text-xs font-semibold cursor-pointer disabled:opacity-50"
                  >
                    {createCommentMutation.isPending ? '…' : 'Enviar'}
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 px-6 py-4 border-t border-[var(--border)] flex-shrink-0">
                <button
                  onClick={() => closeModal()}
                  aria-label="Ir para conversa"
                  className="px-4 py-2 rounded-lg bg-[var(--bg-card)] text-[var(--text-2)] border border-[var(--border)] font-body text-xs font-semibold cursor-pointer"
                >
                  💬 Ir para conversa
                </button>
                <button
                  onClick={closeModal}
                  className="px-4 py-2 rounded-lg bg-[var(--accent)] text-white border-none font-body text-xs font-semibold cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </>
          )}
        </Sheet.Content>
      </Sheet.Portal>
    </Sheet.Root>
  )
}
