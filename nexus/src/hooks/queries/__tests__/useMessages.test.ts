import { describe, it, expect, beforeEach } from 'vitest'
import React from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useMessages } from '../useMessages'
import { useAuthStore } from '../../../stores/authStore'
import type { ReactNode } from 'react'

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: 0 } } })
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

describe('useMessages', () => {
  it('returns messages when channelId is provided', async () => {
    const { result } = renderHook(() => useMessages('ch-1'), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(1)
    expect(result.current.data![0].text).toBe('Hello world')
  })

  it('does not fetch when channelId is null', () => {
    const { result } = renderHook(() => useMessages(null), { wrapper: createWrapper() })
    expect(result.current.isFetching).toBe(false)
    expect(result.current.data).toBeUndefined()
  })

  it('transforms message correctly', async () => {
    const { result } = renderHook(() => useMessages('ch-1'), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    const msg = result.current.data![0]
    expect(msg).toHaveProperty('id')
    expect(msg).toHaveProperty('channel')
    expect(msg).toHaveProperty('text')
    expect(msg).toHaveProperty('reactions')
    expect(msg).toHaveProperty('time')
  })
})
