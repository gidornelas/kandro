import { http, HttpResponse } from 'msw'

const API_URL = 'http://localhost:3000'

export const mockUser = {
  id: 'user-1',
  email: 'test@nexus.test',
  name: 'Test User',
  initials: 'TU',
  color: '#7c6af7',
  role: 'Membro',
  status: 'online',
}

export const mockAccessToken = 'mock-access-token-123'
export const mockRefreshToken = 'mock-refresh-token-456'

// ── Column metadata (all columns, including ones not in boardCards) ──
const allColumnMeta: Record<string, { name: string; color: string; isTerminal: boolean }> = {
  'col-1': { name: 'A Fazer', color: '#6b7280', isTerminal: false },
  'col-2': { name: 'Em Andamento', color: '#3b82f6', isTerminal: false },
  'col-3': { name: 'Concluído', color: '#22c55e', isTerminal: true },
}

// ── Mutable board card state ──
const boardCards = [
  {
    id: 'col-1', channelId: 'ch-board', name: 'A Fazer', color: '#6b7280', position: 0, isTerminal: false,
    _count: { cards: 1 },
    cards: [
      {
        id: 'card-1', columnId: 'col-1', title: 'Tarefa 1', description: null,
        priority: 'medium', priorityColor: '#f59e0b', due: null, dueType: 'normal',
        progress: 0, position: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        labels: [], assignees: [], commentCount: 0, threadCount: 0,
      },
    ],
  },
  {
    id: 'col-3', channelId: 'ch-board', name: 'Concluído', color: '#22c55e', position: 2, isTerminal: true,
    _count: { cards: 1 },
    cards: [
      {
        id: 'card-2', columnId: 'col-3', title: 'Tarefa 2', description: null,
        priority: 'high', priorityColor: '#ef4444', due: null, dueType: 'normal',
        progress: 100, position: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        labels: [], assignees: [], commentCount: 0, threadCount: 0,
      },
    ],
  },
]

export const handlers = [
  http.get(`${API_URL}/api/health`, () => {
    return HttpResponse.json({ status: 'ok' })
  }),

  // Auth
  http.post(`${API_URL}/api/auth/login`, () => {
    return HttpResponse.json({
      user: mockUser,
      accessToken: mockAccessToken,
      refreshToken: mockRefreshToken,
    })
  }),

  http.post(`${API_URL}/api/auth/register`, () => {
    return HttpResponse.json({
      user: mockUser,
      accessToken: mockAccessToken,
      refreshToken: mockRefreshToken,
    })
  }),

  http.get(`${API_URL}/api/auth/me`, () => {
    return HttpResponse.json(mockUser)
  }),

  http.patch(`${API_URL}/api/auth/me`, () => {
    return HttpResponse.json(mockUser)
  }),

  http.post(`${API_URL}/api/auth/refresh`, () => {
    return HttpResponse.json({
      accessToken: 'refreshed-access-token',
      refreshToken: 'refreshed-refresh-token',
    })
  }),

  // Workspaces
  http.get(`${API_URL}/api/workspaces`, () => {
    return HttpResponse.json([
      { id: 'ws-1', name: 'My Workspace', initials: 'MW', color: '#7c6af7' },
    ])
  }),

  http.get(`${API_URL}/api/workspaces/:workspaceId/channels`, () => {
    return HttpResponse.json([
      { id: 'ch-1', name: 'geral', type: 'text', workspaceId: 'ws-1' },
      { id: 'ch-2', name: 'random', type: 'text', workspaceId: 'ws-1' },
    ])
  }),

  // Messages
  http.get(`${API_URL}/api/channels/:channelId/messages`, () => {
    return HttpResponse.json({
      data: [
        {
          id: 'msg-1',
          channelId: 'ch-1',
          userId: 'user-1',
          text: 'Hello world',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          user: { id: 'user-1', name: 'Test User', initials: 'TU', color: '#7c6af7' },
          reactions: [],
          attachment: null,
          taskCard: null,
        },
      ],
      nextCursor: null,
      hasMore: false,
    })
  }),

  http.post(`${API_URL}/api/channels/:channelId/messages`, async ({ request }) => {
    const body = await request.json() as { text: string }
    return HttpResponse.json({
      id: 'msg-new',
      channelId: 'ch-1',
      userId: 'user-1',
      text: body.text,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      user: { id: 'user-1', name: 'Test User', initials: 'TU', color: '#7c6af7' },
      reactions: [],
      attachment: null,
      taskCard: null,
    })
  }),

  http.patch(`${API_URL}/api/messages/:messageId`, async ({ request }) => {
    const body = await request.json() as { text: string }
    return HttpResponse.json({
      id: 'msg-1',
      text: body.text,
    })
  }),

  http.delete(`${API_URL}/api/messages/:messageId`, () => {
    return new HttpResponse(null, { status: 204 })
  }),

  // Board
  http.get(`${API_URL}/api/channels/:channelId/columns`, () => {
    return HttpResponse.json([
      { id: 'col-1', channelId: 'ch-board', name: 'A Fazer', color: '#6b7280', position: 0, isTerminal: false },
      { id: 'col-2', channelId: 'ch-board', name: 'Em Andamento', color: '#3b82f6', position: 1, isTerminal: false },
      { id: 'col-3', channelId: 'ch-board', name: 'Concluído', color: '#22c55e', position: 2, isTerminal: true },
    ])
  }),

  http.get(`${API_URL}/api/channels/:channelId/cards`, () => {
    return HttpResponse.json(boardCards)
  }),

  http.patch(`${API_URL}/api/cards/:cardId/move`, async ({ params, request }) => {
    const body = await request.json() as { toColumnId: string }
    const cardId = params.cardId as string

    // Find and remove card from its current column
    let foundColIdx = -1
    let foundCardIdx = -1
    for (let ci = 0; ci < boardCards.length; ci++) {
      const idx = boardCards[ci].cards.findIndex(c => c.id === cardId)
      if (idx !== -1) {
        foundColIdx = ci
        foundCardIdx = idx
        break
      }
    }

    if (foundCardIdx === -1) {
      return HttpResponse.json(
        { error: 'NOT_FOUND', message: 'Card not found', statusCode: 404 },
        { status: 404 }
      )
    }

    const removed = boardCards[foundColIdx].cards.splice(foundCardIdx, 1)[0]
    boardCards[foundColIdx]._count.cards = boardCards[foundColIdx].cards.length

    // Find or create target column in boardCards
    const targetMeta = allColumnMeta[body.toColumnId] ?? { name: 'Unknown', color: '#6b7280', isTerminal: false }
    let targetCol = boardCards.find(c => c.id === body.toColumnId)

    if (!targetCol) {
      targetCol = {
        id: body.toColumnId, channelId: 'ch-board', name: targetMeta.name, color: targetMeta.color,
        position: boardCards.length, isTerminal: targetMeta.isTerminal,
        _count: { cards: 0 },
        cards: [],
      }
      boardCards.push(targetCol)
    }

    const isTerminal = targetCol.isTerminal
    const now = new Date().toISOString()

    targetCol.cards.push({
      ...removed,
      columnId: body.toColumnId,
      progress: isTerminal ? 100 : removed.progress,
      updatedAt: now,
    })
    targetCol._count.cards = targetCol.cards.length

    return HttpResponse.json({
      ...targetCol.cards[targetCol.cards.length - 1],
      column: { id: targetCol.id, name: targetCol.name, color: targetCol.color },
      subtasks: [],
      comments: [],
    })
  }),

  // Errors
  http.get(`${API_URL}/api/error-test`, () => {
    return HttpResponse.json(
      { error: 'NOT_FOUND', message: 'Resource not found', statusCode: 404 },
      { status: 404 }
    )
  }),

  http.get(`${API_URL}/api/auth/me-unauthorized`, () => {
    return HttpResponse.json(
      { error: 'UNAUTHORIZED', message: 'Não autorizado', statusCode: 401 },
      { status: 401 }
    )
  }),
]
