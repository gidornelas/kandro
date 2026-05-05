import { describe, it, expect, afterEach } from 'vitest'
import React from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { useMoveCard } from '../useMoveCard'
import { server } from '../../../test/setup'
import type { ReactNode } from 'react'

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

afterEach(() => {
  server.resetHandlers()
})

describe('useMoveCard', () => {
  it('sets progress to 100 when target column is terminal', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: 0 } } })
    queryClient.setQueryData(['board', 'ch-board'], {
      cols: [{ id: 'col-3', name: 'Concluído', color: '#22c55e', isTerminal: true }],
      cards: [{ id: 'card-1', col: 'col-1', title: 'Tarefa 1', progress: 50 }],
    })
    const { result } = renderHook(() => useMoveCard('ch-board'), { wrapper: createWrapper(queryClient) })
    result.current.mutate({ cardId: 'card-1', toColumnId: 'col-3' })
    await waitFor(() => {
      const state = queryClient.getQueryData(['board', 'ch-board']) as { cards: Array<{ id: string; progress: number }> }
      expect(state.cards[0].progress).toBe(100)
    })
  })

  it('keeps progress when target column is not terminal', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: 0 } } })
    queryClient.setQueryData(['board', 'ch-board'], {
      cols: [{ id: 'col-2', name: 'Em Andamento', color: '#3b82f6', isTerminal: false }],
      cards: [{ id: 'card-1', col: 'col-1', title: 'Tarefa 1', progress: 50 }],
    })
    const { result } = renderHook(() => useMoveCard('ch-board'), { wrapper: createWrapper(queryClient) })
    result.current.mutate({ cardId: 'card-1', toColumnId: 'col-2' })
    await waitFor(() => {
      const state = queryClient.getQueryData(['board', 'ch-board']) as { cards: Array<{ id: string; progress: number }> }
      expect(state.cards[0].progress).toBe(50)
    })
  })

  it('rolls back on error', async () => {
    server.use(
      http.patch('http://localhost:3000/api/cards/:cardId/move', () => {
        return HttpResponse.json({ error: 'SERVER_ERROR', message: 'Erro interno' }, { status: 500 })
      }),
    )
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: 0 } } })
    const initialData = {
      cols: [{ id: 'col-3', name: 'Concluído', color: '#22c55e', isTerminal: true }],
      cards: [{ id: 'card-1', col: 'col-1', title: 'Tarefa 1', progress: 50 }],
    }
    queryClient.setQueryData(['board', 'ch-board'], initialData)
    const { result } = renderHook(() => useMoveCard('ch-board'), { wrapper: createWrapper(queryClient) })
    result.current.mutate({ cardId: 'card-1', toColumnId: 'col-3' })

    await waitFor(() => {
      const state = queryClient.getQueryData(['board', 'ch-board']) as { cards: Array<{ id: string; progress: number }> }
      expect(state.cards[0].progress).toBe(50)
    })
  })
})
