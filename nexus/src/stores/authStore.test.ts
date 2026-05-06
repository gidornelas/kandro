// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAuthStore } from './authStore'
import type { AuthUser } from '../types'

// Mock API
vi.mock('../api/auth', () => ({
  login: vi.fn(),
  register: vi.fn(),
  refresh: vi.fn(),
  getMe: vi.fn(),
  updateProfile: vi.fn(),
  forceMockMode: vi.fn(),
  isCurrentlyMockMode: vi.fn(() => false),
  resetMockMode: vi.fn(),
}))

const mockUser: AuthUser = {
  id: '1',
  email: 'test@test.com',
  name: 'Test',
  image: null,
  initials: 'T',
  color: '#7c6af7',
  status: 'online',
  role: 'Membro',
}

beforeEach(() => {
  useAuthStore.setState({
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  })
  localStorage.clear()
})

describe('authStore', () => {
  it('should initialize with correct default state', () => {
    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.accessToken).toBeNull()
    expect(state.isAuthenticated).toBe(false)
    expect(state.isLoading).toBe(true)
    expect(state.error).toBeNull()
  })

  it('should clear error', () => {
    useAuthStore.setState({ error: 'Some error' })
    useAuthStore.getState().clearError()
    expect(useAuthStore.getState().error).toBeNull()
  })

  it('should handle logout', () => {
    useAuthStore.setState({
      user: mockUser,
      accessToken: 'token123',
      isAuthenticated: true,
    })
    useAuthStore.getState().logout()
    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.accessToken).toBeNull()
    expect(state.isAuthenticated).toBe(false)
  })

  it('should set tokens', () => {
    useAuthStore.getState().setTokens('access123', 'refresh123')
    expect(useAuthStore.getState().accessToken).toBe('access123')
    expect(localStorage.getItem('nexus_refresh_token')).toBe('refresh123')
  })
})
