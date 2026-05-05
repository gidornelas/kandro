import { useState, useRef, useEffect, memo } from 'react'
import type { Message, User } from '../../types'
import { useAuthStore } from '../../stores/authStore'
import { useUIStore } from '../../stores/uiStore'
import { useToggleReaction } from '../../hooks/mutations/useToggleReaction'
import { useEditMessage } from '../../hooks/mutations/useEditMessage'
import { useDeleteMessage } from '../../hooks/mutations/useDeleteMessage'
import { queryClient } from '../../lib/queryClient'
import * as Dialog from '@radix-ui/react-dialog'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Tooltip } from '../ui/tooltip'

interface Props {
  message: Message
  user: User
}

const parseText = (text: string) => {
  const parts: (string | JSX.Element)[] = []
  const regex = /(@\w+(?:\s+\w+)*|`[^`]+`)/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }
    const m = match[0]
    if (m.startsWith('@')) {
      parts.push(
        <span key={match.index} style={{ color: 'var(--accent-light)', fontWeight: 500, background: 'rgba(124,106,247,0.12)', padding: '1px 4px', borderRadius: 4 }}>
          {m}
        </span>
      )
    } else if (m.startsWith('`')) {
      parts.push(
        <code key={match.index} style={{ fontFamily: 'var(--font-mono)', fontSize: 12, background: 'var(--bg-panel)', padding: '2px 6px', borderRadius: 4, color: 'var(--accent-light)' }}>
          {m.slice(1, -1)}
        </code>
      )
    }
    lastIndex = match.index + m.length
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }
  return parts
}

const MessageGroup = memo(function MessageGroup({ message, user }: Props) {
  const toggleReactionMutation = useToggleReaction()
  const editMessageMutation = useEditMessage()
  const deleteMessageMutation = useDeleteMessage()
  const currentUserId = useAuthStore(s => s.user?.id)
  const { openModal } = useUIStore()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [taskTitle, setTaskTitle] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(message.text)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const editInputRef = useRef<HTMLInputElement>(null)

  const isOwnMessage = currentUserId === message.userId

  useEffect(() => {
    if (isEditing) {
      editInputRef.current?.focus()
      editInputRef.current?.select()
    }
  }, [isEditing])

  const handleCreateTask = () => {
    if (!taskTitle.trim()) return
    // Update React Query cache directly for optimistic local task card attachment
    const updateMessages = (msgs: Message[] | null) => {
      if (!msgs) return msgs
      return msgs.map(m => m.id === message.id ? {
        ...m,
        taskCard: {
          label: 'Sprint 12',
          labelColor: '#7c6af7',
          title: taskTitle.trim(),
          due: 'Sem data',
          priority: 'Média',
          priorityColor: '#fbbf24',
        }
      } : m)
    }
    queryClient.setQueryData(['messages', message.channel], updateMessages)
    queryClient.setQueryData(['dm-messages', message.channel], (old: { data: Message[] } | null) => {
      if (!old) return old
      return { ...old, data: updateMessages(old.data) }
    })
    setTaskTitle('')
    setCreateDialogOpen(false)
  }

  const handleEditSave = () => {
    const trimmed = editText.trim()
    if (!trimmed || trimmed === message.text) {
      setIsEditing(false)
      setEditText(message.text)
      return
    }
    editMessageMutation.mutate({ messageId: message.id, text: trimmed })
    setIsEditing(false)
  }

  const handleEditCancel = () => {
    setIsEditing(false)
    setEditText(message.text)
  }

  const handleDelete = () => {
    deleteMessageMutation.mutate(message.id)
    setShowDeleteConfirm(false)
  }

  return (
    <DropdownMenu.Root>
      <div
        style={{
          display: 'flex',
          gap: 12,
          padding: '8px 12px',
          borderRadius: 8,
          animation: 'msgFadeIn 0.3s ease',
        }}
        data-msg={message.id}
        onContextMenu={(e) => {
          if (isOwnMessage) {
            e.preventDefault()
            const target = e.currentTarget.querySelector('[data-dropdown-trigger]') as HTMLElement
            target?.click()
          }
        }}
      >
        {/* Avatar */}
        <div style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: user.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 14,
          fontWeight: 700,
          color: '#fff',
          flexShrink: 0,
          marginTop: 2,
        }}>
          {user.initials}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Header with context menu */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-1)' }}>{user.name}</span>
            <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{message.time}</span>
            {isOwnMessage && (
              <div style={{ marginLeft: 'auto' }} data-dropdown-trigger>
                <DropdownMenu.Trigger asChild>
                    <Tooltip content="Mais opções">
                      <button
                        aria-label="Mais opções"
                        className="w-[44px] h-[44px] rounded border-none bg-transparent text-[var(--text-3)] cursor-pointer text-sm flex items-center justify-center opacity-60"
                      >
                        ⋯
                      </button>
                    </Tooltip>
                </DropdownMenu.Trigger>
              </div>
            )}
          </div>

          {/* Edit mode */}
          {isEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <input
                ref={editInputRef}
                type="text"
                value={editText}
                onChange={e => setEditText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleEditSave()
                  if (e.key === 'Escape') handleEditCancel()
                }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--accent)',
                  borderRadius: 6,
                  color: 'var(--text-1)',
                  fontFamily: 'var(--font-body)',
                  fontSize: 14,
                  outline: 'none',
                }}
              />
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={handleEditSave}
                  style={{
                    padding: '4px 12px', borderRadius: 6,
                    background: 'var(--accent)', color: '#fff',
                    border: 'none', fontSize: 12, fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'var(--font-body)',
                  }}
                >
                  Salvar
                </button>
                <button
                  onClick={handleEditCancel}
                  style={{
                    padding: '4px 12px', borderRadius: 6,
                    background: 'var(--bg-card)', color: 'var(--text-2)',
                    border: '1px solid var(--border)', fontSize: 12,
                    fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)',
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            /* Text */
            <div style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text-2)', wordWrap: 'break-word' }}>
              {parseText(message.text)}
            </div>
          )}

          {/* Dropdown menu */}
          {isOwnMessage && (
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                side="bottom"
                align="end"
                style={{
                  minWidth: 160,
                  background: 'var(--bg-panel)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  padding: 4,
                  boxShadow: 'var(--shadow-modal)',
                  zIndex: 5000,
                }}
              >
                <DropdownMenu.Item
                  onSelect={() => {
                    setEditText(message.text)
                    setIsEditing(true)
                  }}
                  style={{
                    padding: '6px 12px', borderRadius: 4, fontSize: 13,
                    color: 'var(--text-1)', cursor: 'pointer', outline: 'none',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}
                >
                  ✏️ Editar
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onSelect={() => setShowDeleteConfirm(true)}
                  style={{
                    padding: '6px 12px', borderRadius: 4, fontSize: 13,
                    color: 'var(--red)', cursor: 'pointer', outline: 'none',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}
                >
                  🗑️ Excluir
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          )}

          {/* Attachment */}
          {message.attachment && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginTop: 8,
              padding: '12px 16px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              maxWidth: 400,
              cursor: 'pointer',
            }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                background: 'rgba(124,106,247,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
                flexShrink: 0,
              }}>
                {message.attachment.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {message.attachment.name}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
                  {message.attachment.size}
                  {message.attachment.encrypted && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '2px 6px', background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.15)', borderRadius: 4, fontSize: 10, fontWeight: 600, color: 'var(--green)', marginLeft: 6 }}>
                      🔒 Criptografado
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Task card */}
          {message.taskCard && (
            <div
              onClick={() => openModal('taskDetail')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                marginTop: 8,
                padding: '12px 16px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderLeft: '3px solid var(--accent)',
                borderRadius: 8,
                maxWidth: 420,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '2px 8px',
                borderRadius: 4,
                fontSize: 10,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                width: 'fit-content',
                background: `${message.taskCard.labelColor}20`,
                color: message.taskCard.labelColor,
              }}>
                {message.taskCard.label}
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)' }}>{message.taskCard.title}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: 'var(--text-3)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: message.taskCard.priorityColor }}>● {message.taskCard.priority}</span>
                <span>📅 {message.taskCard.due}</span>
              </div>
            </div>
          )}

          {/* Create task badge */}
          {!message.taskCard && (
            <Dialog.Root open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <Dialog.Trigger asChild>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    marginTop: 6,
                    padding: '4px 10px',
                    background: 'rgba(124,106,247,0.1)',
                    border: '1px solid rgba(124,106,247,0.2)',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--accent-light)',
                    cursor: 'pointer',
                    width: 'fit-content',
                  }}
                >
                  + Criar tarefa
                </div>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay style={{
                  position: 'fixed',
                  inset: 0,
                  background: 'rgba(0,0,0,0.5)',
                  backdropFilter: 'blur(8px)',
                  zIndex: 5000,
                }} />
                <Dialog.Content style={{
                  position: 'fixed',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  background: 'var(--bg-panel)',
                  border: '1px solid var(--border)',
                  borderRadius: 16,
                  padding: 24,
                  minWidth: 400,
                  maxWidth: '90vw',
                  boxShadow: 'var(--shadow-modal)',
                  zIndex: 5001,
                }}>
                  <Dialog.Title style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, marginBottom: 16, color: 'var(--text-1)' }}>
                    Criar Tarefa
                  </Dialog.Title>
                  <Dialog.Description style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 12 }}>
                    Criar uma tarefa a partir desta mensagem?
                  </Dialog.Description>
                  <input
                    type="text"
                    value={taskTitle}
                    onChange={e => setTaskTitle(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleCreateTask() }}
                    placeholder="Título da tarefa"
                    autoFocus
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                      color: 'var(--text-1)',
                      fontFamily: 'var(--font-body)',
                      fontSize: 14,
                      outline: 'none',
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
                    <Dialog.Close asChild>
                      <button style={{ padding: '8px 16px', borderRadius: 8, background: 'var(--bg-card)', color: 'var(--text-2)', border: '1px solid var(--border)', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                        Cancelar
                      </button>
                    </Dialog.Close>
                    <button onClick={handleCreateTask} style={{ padding: '8px 16px', borderRadius: 8, background: 'var(--accent)', color: '#fff', border: 'none', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                      Criar Tarefa
                    </button>
                  </div>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          )}

          {/* Reactions */}
          {message.reactions.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
              {message.reactions.map((r, i) => (
                <div
                  key={i}
                  onClick={() => toggleReactionMutation.mutate({ messageId: message.id, emoji: r.emoji })}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '3px 8px',
                    background: r.me ? 'rgba(124,106,247,0.12)' : 'var(--bg-panel)',
                    border: `1px solid ${r.me ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: 12,
                    fontSize: 13,
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  <span>{r.emoji}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: r.me ? 'var(--accent-light)' : 'var(--text-2)' }}>{r.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog.Root open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <Dialog.Portal>
          <Dialog.Overlay style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(8px)', zIndex: 5000,
          }} />
          <Dialog.Content style={{
            position: 'fixed', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'var(--bg-panel)', border: '1px solid var(--border)',
            borderRadius: 16, padding: 24, minWidth: 360, maxWidth: '90vw',
            boxShadow: 'var(--shadow-modal)', zIndex: 5001,
          }}>
            <Dialog.Title style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, marginBottom: 12, color: 'var(--text-1)' }}>
              Excluir Mensagem
            </Dialog.Title>
            <Dialog.Description style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 20 }}>
              Tem certeza que deseja excluir esta mensagem? Esta ação não pode ser desfeita.
            </Dialog.Description>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  padding: '8px 16px', borderRadius: 8,
                  background: 'var(--bg-card)', color: 'var(--text-2)',
                  border: '1px solid var(--border)', fontFamily: 'var(--font-body)',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                style={{
                  padding: '8px 16px', borderRadius: 8,
                  background: 'var(--red)', color: '#fff',
                  border: 'none', fontFamily: 'var(--font-body)',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}
              >
                Excluir
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </DropdownMenu.Root>
  )
})

export { MessageGroup }
