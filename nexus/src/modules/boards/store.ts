import { create } from 'zustand'
import type { KanbanCard, KanbanColumn } from '../../shared/types/domain'
import { KANBAN_COLUMNS, KANBAN_CARDS } from '../../shared/mocks'

interface BoardState {
  columns: KanbanColumn[]
  cards: KanbanCard[]
  editingCardId: string | null
  addingToColumn: string | null
  editColumnId: string | null

  addCard: (columnId: string, title: string) => void
  updateCard: (cardId: string, updates: Partial<KanbanCard>) => void
  deleteCard: (cardId: string) => void
  moveCard: (cardId: string, toColumnId: string) => void
  reorderCard: (cardId: string, overId: string) => void

  addColumn: (name: string) => void
  updateColumn: (columnId: string, name: string) => void
  deleteColumn: (columnId: string) => void

  openCardModal: (cardId: string) => void
  closeCardModal: () => void
  openAddCard: (columnId: string) => void
  closeAddCard: () => void
  openEditColumn: (columnId: string) => void
  closeEditColumn: () => void
}

let idCounter = KANBAN_CARDS.length + 1
let colCounter = KANBAN_COLUMNS.length + 1

export const useBoardStore = create<BoardState>((set, get) => ({
  columns: [...KANBAN_COLUMNS],
  cards: [...KANBAN_CARDS],
  editingCardId: null,
  addingToColumn: null,
  editColumnId: null,

  addCard(columnId, title) {
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
    }
    set({ cards: [...get().cards, card], addingToColumn: null })
  },

  updateCard(cardId, updates) {
    set({
      cards: get().cards.map((c) => (c.id === cardId ? { ...c, ...updates } : c)),
      editingCardId: null,
    })
  },

  deleteCard(cardId) {
    set({ cards: get().cards.filter((c) => c.id !== cardId), editingCardId: null })
  },

  moveCard(cardId, toColumnId) {
    set({
      cards: get().cards.map((c) => (c.id === cardId ? { ...c, col: toColumnId } : c)),
    })
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

  addColumn(name) {
    const col: KanbanColumn = {
      id: `col${++colCounter}`,
      name,
      color: '#8e8e93',
    }
    set({ columns: [...get().columns, col] })
  },

  updateColumn(columnId, name) {
    set({
      columns: get().columns.map((c) => (c.id === columnId ? { ...c, name } : c)),
      editColumnId: null,
    })
  },

  deleteColumn(columnId) {
    set({
      columns: get().columns.filter((c) => c.id !== columnId),
      cards: get().cards.filter((c) => c.col !== columnId),
      editColumnId: null,
    })
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
