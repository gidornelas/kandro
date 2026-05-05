import { describe, it, expect } from 'vitest'
import React from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useBoardData } from '../useBoardData'
import type { ReactNode } from 'react'

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: 0 } } })
  return function Wrapper({ children }: { children: ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

describe('useBoardData', () => {
  it('returns columns and cards when channelId is provided', async () => {
    const { result } = renderHook(() => useBoardData('ch-board'), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.columns).toHaveLength(3)
    expect(result.current.data?.cols).toHaveLength(2)
    expect(result.current.data?.cards).toHaveLength(2)
  })

  it('maps isTerminal on columns from cardsData', async () => {
    const { result } = renderHook(() => useBoardData('ch-board'), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    const terminalCol = result.current.data!.cols.find(c => c.isTerminal)
    expect(terminalCol).toBeDefined()
    expect(terminalCol!.name).toBe('Concluído')
  })

  it('does not fetch when channelId is null', () => {
    const { result } = renderHook(() => useBoardData(null), { wrapper: createWrapper() })
    expect(result.current.isFetching).toBe(false)
    expect(result.current.data).toBeUndefined()
  })
})
