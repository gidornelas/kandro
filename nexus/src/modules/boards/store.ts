import { create } from 'zustand'
import type { DueType, KanbanCard, KanbanColumn } from '../../shared/types/domain'
import { KANBAN_COLUMNS, KANBAN_CARDS } from '../../shared/mocks'
import { useAuthStore } from '../auth/store'
import * as BoardsApi from './api'

interface BoardState {
  columns: KanbanColumn[]
  cards: KanbanCard[]
  isLoading: boolean
  error: string | null
  editingCardId: string | null
  addingToColumn: string | null
  editColumnId: string | null

  loadBoard: (channelId: string) => Promise<void>
  addCard: (columnId: string, title: string) => Promise<void>
  updateCard: (cardId: string, updates: Partial<KanbanCard>) => Promise<void>
  deleteCard: (cardId: string) => Promise<void>
  moveCard: (cardId: string, toColumnId: string) => Promise<void>
  reorderCard: (cardId: string, overId: string) => void
  addCardComment: (cardId: string, text: string) => void

  addColumn: (channelId: string, name: string) => Promise<void>
  updateColumn: (columnId: string, name: string) => Promise<void>
  deleteColumn: (columnId: string) => Promise<void>

  openCardModal: (cardId: string) => void
  closeCardModal: () => void
  openAddCard: (columnId: string) => void
  closeAddCard: () => void
  openEditColumn: (columnId: string) => void
  closeEditColumn: () => void
}

let idCounter = KANBAN_CARDS.length + 1
let colCounter = KANBAN_COLUMNS.length + 1

function formatDue(due: string | null) {
  if (!due) return ''
  return new Date(due).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

function toDueDate(due: string | null) {
  if (!due) return ''
  return new Date(due).toISOString().slice(0, 10)
}

function toDueType(dueType: string): DueType {
  if (dueType === 'warning' || dueType === 'overdue') return dueType
  return 'normal'
}

function toCard(card: BoardsApi.BoardCard): KanbanCard {
  return {
    id: card.id,
    col: card.columnId,
    title: card.title,
    labels: card.labels.map((label) => label.name),
    priority: card.priority,
    priorityColor: card.priorityColor,
    assignees: card.assignees.map((assignee) => assignee.userId),
    due: formatDue(card.due),
    dueType: toDueType(card.dueType),
    comments: card.commentCount ?? 0,
    attachments: 0,
    progress: card.progress,
    threadCount: card.threadCount ?? 0,
    description: card.description ?? '',
    subtasks: [],
    dueDate: toDueDate(card.due),
    files: [],
    cardComments: [],
  }
}

export const useBoardStore = create<BoardState>((set, get) => ({
  columns: [],
  cards: [],
  isLoading: false,
  error: null,
  editingCardId: null,
  addingToColumn: null,
  editColumnId: null,

  loadBoard: async (channelId) => {
    set({ isLoading: true, error: null })
    try {
      const columns = await BoardsApi.listCards(channelId)
      set({
        columns: columns.map((column) => ({
          id: column.id,
          name: column.name,
          color: column.color,
          isTerminal: column.isTerminal,
        })),
        cards: columns.flatMap((column) => column.cards.map(toCard)),
        isLoading: false,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar board'
      if (useAuthStore.getState().isMockMode) {
        set({ columns: [...KANBAN_COLUMNS], cards: [...KANBAN_CARDS], isLoading: false })
        return
      }
      set({ error: message, isLoading: false })
    }
  },

  addCard: async (columnId, title) => {
    try {
      const created = await BoardsApi.createCard(columnId, { title })
      set({ cards: [...get().cards, toCard({ ...created, commentCount: 0, threadCount: 0 })], addingToColumn: null })
    } catch (err) {
      if (!useAuthStore.getState().isMockMode) {
        const message = err instanceof Error ? err.message : 'Erro ao criar card'
        set({ error: message, addingToColumn: null })
        return
      }
      const card: KanbanCard = {
        id: `c${++idCounter}`,
        col: columnId,
        title,
        labels: [],
        priority: 'Normal',
        priorityColor: '#8e8e93',
        assignees: [],
        due: '',
        dueType: 'normal',
        comments: 0,
        attachments: 0,
        progress: 0,
        threadCount: 0,
        description: '',
        subtasks: [],
        dueDate: '',
        files: [],
        cardComments: [],
      }
      set({ cards: [...get().cards, card], addingToColumn: null })
    }
  },

  addCardComment(cardId, text) {
    const comment = {
      id: `cc-${Date.now()}`,
      userId: 'me',
      text,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    }
    set({
      cards: get().cards.map((c) =>
        c.id === cardId
          ? { ...c, cardComments: [...(c.cardComments || []), comment], comments: (c.comments || 0) + 1 }
          : c
      ),
    })
  },

  updateCard: async (cardId, updates) => {
    const previousCards = get().cards
    const nextCards = get().cards.map((c) => (c.id === cardId ? { ...c, ...updates } : c))
    set({
      cards: nextCards,
      editingCardId: null,
    })
    try {
      await BoardsApi.updateCard(cardId, {
        title: updates.title,
        description: updates.description,
        priority: updates.priority,
        priorityColor: updates.priorityColor,
        due: updates.dueDate ? new Date(updates.dueDate).toISOString() : undefined,
      })
    } catch (err) {
      if (useAuthStore.getState().isMockMode) return
      const message = err instanceof Error ? err.message : 'Erro ao atualizar card'
      set({ error: message, cards: previousCards })
    }
  },

  deleteCard: async (cardId) => {
    const previousCards = get().cards
    set({ cards: previousCards.filter((card) => card.id !== cardId), editingCardId: null })
    try {
      await BoardsApi.deleteCard(cardId)
    } catch (err) {
      if (useAuthStore.getState().isMockMode) return
      const message = err instanceof Error ? err.message : 'Erro ao excluir card'
      set({ error: message, cards: previousCards })
      return
    }
  },

  moveCard: async (cardId, toColumnId) => {
    const previousCards = get().cards
    set({
      cards: previousCards.map((card) => (card.id === cardId ? { ...card, col: toColumnId } : card)),
    })
    try {
      await BoardsApi.moveCard(cardId, { toColumnId })
    } catch (err) {
      if (useAuthStore.getState().isMockMode) return
      const message = err instanceof Error ? err.message : 'Erro ao mover card'
      set({ error: message, cards: previousCards })
    }
  },

  reorderCard(activeId, overId) {
    const cards = [...get().cards]
    const oldIndex = cards.findIndex((c) => c.id === activeId)
    const newIndex = cards.findIndex((c) => c.id === overId)
    if (oldIndex === -1 || newIndex === -1) return
    const [moved] = cards.splice(oldIndex, 1)
    cards.splice(newIndex, 0, moved)
    set({ cards })
  },

  addColumn: async (channelId, name) => {
    try {
      const column = await BoardsApi.createColumn(channelId, { name })
      set({ columns: [...get().columns, { id: column.id, name: column.name, color: column.color }] })
    } catch (err) {
      if (!useAuthStore.getState().isMockMode) {
        const message = err instanceof Error ? err.message : 'Erro ao criar coluna'
        set({ error: message })
        return
      }
      const col: KanbanColumn = {
        id: `col${++colCounter}`,
        name,
        color: '#8e8e93',
      }
      set({ columns: [...get().columns, col] })
    }
  },

  updateColumn: async (columnId, name) => {
    const previousColumns = get().columns
    try {
      set({
        columns: previousColumns.map((column) => (column.id === columnId ? { ...column, name } : column)),
        editColumnId: null,
      })
      await BoardsApi.updateColumn(columnId, { name })
    } catch (err) {
      if (useAuthStore.getState().isMockMode) return
      const message = err instanceof Error ? err.message : 'Erro ao atualizar coluna'
      set({ error: message, columns: previousColumns, editColumnId: null })
    }
  },

  deleteColumn: async (columnId) => {
    const previousColumns = get().columns
    const previousCards = get().cards
    set({
      columns: previousColumns.filter((column) => column.id !== columnId),
      cards: previousCards.filter((card) => card.col !== columnId),
      editColumnId: null,
    })
    try {
      await Promise.all(previousCards.filter((card) => card.col === columnId).map((card) => BoardsApi.deleteCard(card.id)))
      await BoardsApi.deleteColumn(columnId)
    } catch (err) {
      if (useAuthStore.getState().isMockMode) return
      const message = err instanceof Error ? err.message : 'Erro ao excluir coluna'
      set({ error: message, columns: previousColumns, cards: previousCards, editColumnId: null })
    }
  },

  openCardModal(cardId) {
    set({ editingCardId: cardId })
  },
  closeCardModal() {
    set({ editingCardId: null })
  },
  openAddCard(columnId) {
    set({ addingToColumn: columnId })
  },
  closeAddCard() {
    set({ addingToColumn: null })
  },
  openEditColumn(columnId) {
    set({ editColumnId: columnId })
  },
  closeEditColumn() {
    set({ editColumnId: null })
  },
}))
