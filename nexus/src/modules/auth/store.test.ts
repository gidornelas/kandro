import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAuthStore } from './store'

describe('auth store', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      isMockMode: false,
    })
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    })
  })

  it('initializes with no user', () => {
    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.isAuthenticated).toBe(false)
  })

  it('sets tokens', () => {
    useAuthStore.getState().setTokens('access', 'refresh')
    const state = useAuthStore.getState()
    expect(state.accessToken).toBe('access')
    expect(localStorage.getItem('nexus_refresh_token')).toBe('refresh')
  })

  it('logs out', () => {
    useAuthStore.setState({ user: { id: '1', email: 'a@b', name: 'A', initials: 'A', color: '#000', status: 'online', role: 'Membro', image: null }, isAuthenticated: true })
    useAuthStore.getState().logout()
    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.isAuthenticated).toBe(false)
  })
})
