import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useSocketStore } from './socketStore'

vi.mock('../lib/socket', () => ({
  connectSocket: vi.fn(() => ({
    on: vi.fn(),
    io: { on: vi.fn() },
    connected: false,
  })),
  disconnectSocket: vi.fn(),
  getSocket: vi.fn(() => null),
}))

beforeEach(() => {
  useSocketStore.setState({ connectionState: 'disconnected' })
})

describe('socketStore', () => {
  it('should initialize with disconnected state', () => {
    expect(useSocketStore.getState().connectionState).toBe('disconnected')
  })

  it('should disconnect and reset state', () => {
    useSocketStore.setState({ connectionState: 'connected' })
    useSocketStore.getState().disconnect()
    expect(useSocketStore.getState().connectionState).toBe('disconnected')
  })
})
