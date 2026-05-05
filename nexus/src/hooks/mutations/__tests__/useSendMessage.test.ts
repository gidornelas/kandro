import { describe, it, expect, afterEach, beforeEach } from 'vitest'
import React from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { useSendMessage } from '../useSendMessage'
import { useAuthStore } from '../../../stores/authStore'
import { server } from '../../../test/setup'
import type { ReactNode } from 'react'

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

beforeEach(() => {
  useAuthStore.setState({
    user: {
      id: 'user-1',
      name: 'Test User',
      initials: 'TU',
      color: '#7c6af7',
      email: 'test@test.com',
      status: 'online',
      image: null,
      role: 'Membro',
    },
  })
})

afterEach(() => {
  server.resetHandlers()
})

describe('useSendMessage', () => {
  it('adds optimistic message to the cache', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: 0 } } })
    queryClient.setQueryData(['messages', 'ch-1'], [])
    const { result } = renderHook(() => useSendMessage(), { wrapper: createWrapper(queryClient) })
    result.current.mutate({ channelId: 'ch-1', text: 'Nova mensagem' })

    await waitFor(() => {
      const messages = queryClient.getQueryData(['messages', 'ch-1']) as Array<{ text: string }>
      expect(messages).toHaveLength(1)
      expect(messages[0].text).toBe('Nova mensagem')
    })
  })

  it('optimistic message has correct structure', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: 0 } } })
    queryClient.setQueryData(['messages', 'ch-1'], [])
    const { result } = renderHook(() => useSendMessage(), { wrapper: createWrapper(queryClient) })
    result.current.mutate({ channelId: 'ch-1', text: 'Teste' })

    await waitFor(() => {
      const messages = queryClient.getQueryData(['messages', 'ch-1']) as Array<Record<string, unknown>>
      const optimistic = messages[0]
      expect(optimistic).toHaveProperty('id')
      expect(optimistic).toHaveProperty('text', 'Teste')
      expect(optimistic).toHaveProperty('channel')
      expect(optimistic).toHaveProperty('reactions')
    })
  })

  it('rolls back on error', async () => {
    server.use(
      http.post('http://localhost:3000/api/channels/:channelId/messages', () => {
        return HttpResponse.json({ error: 'SERVER_ERROR', message: 'Erro interno' }, { status: 500 })
      }),
    )
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: 0 } } })
    const initialMessages = [{ id: 'msg-1', text: 'Original', channel: 'ch-1', reactions: [], time: '10:00', user: 'user-1', userId: 'user-1', createdAt: new Date().toISOString() }]
    queryClient.setQueryData(['messages', 'ch-1'], initialMessages)
    const { result } = renderHook(() => useSendMessage(), { wrapper: createWrapper(queryClient) })
    result.current.mutate({ channelId: 'ch-1', text: 'Falha' })

    await waitFor(() => {
      const messages = queryClient.getQueryData(['messages', 'ch-1']) as Array<{ text: string }>
      expect(messages).toHaveLength(1)
      expect(messages[0].text).toBe('Original')
    })
  })
})
