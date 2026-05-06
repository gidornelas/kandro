import { create } from 'zustand'
import { configureAuthHooks } from '../../core/api/client'
import { apiClient } from '../../core/api/client'
import { configureSocketAuth } from '../../core/socket'
import type { AuthUser } from '../../shared/types/domain'
import { checkBackendHealth } from './dev-mode'

const REFRESH_KEY = 'nexus_refresh_token'

// ── Dev-mode state ──
let _mockMode: boolean | null = null
let _checking = false

async function ensureMockMode(): Promise<boolean> {
  if (_mockMode !== null) return _mockMode

  const isMockAuthEnabled = import.meta.env.VITE_MOCK_AUTH === 'true'
  if (isMockAuthEnabled) { _mockMode = true; return true }
  if (!import.meta.env.DEV) { _mockMode = false; return false }

  if (_checking) {
    while (_checking) await new Promise((r) => setTimeout(r, 50))
    return _mockMode ?? false
  }

  _checking = true
  const reachable = await checkBackendHealth()
  _mockMode = !reachable
  _checking = false
  return _mockMode
}

export function forceMockMode() {
  _mockMode = true
}

export function isCurrentlyMockMode() {
  return _mockMode === true
}

export function resetMockMode() {
  _mockMode = null
}

// ── Mock auth helpers ──
const MOCK_USER: AuthUser = {
  id: 'dev-user-1',
  email: 'dev@nexus.local',
  name: 'Dev User',
  initials: 'DU',
  color: '#7c6af7',
  role: 'Membro',
  status: 'online',
  image: null,
}

async function mockLogin(email: string, _password: string) {
  await new Promise((r) => setTimeout(r, 400))
  return { user: { ...MOCK_USER, email }, accessToken: 'mock-access-token-dev', refreshToken: 'mock-refresh-token-dev' }
}

async function mockRegister(email: string, _password: string, name: string) {
  await new Promise((r) => setTimeout(r, 400))
  const initials = name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
  return { user: { ...MOCK_USER, email, name, initials }, accessToken: 'mock-access-token-dev', refreshToken: 'mock-refresh-token-dev' }
}

async function mockRefresh() {
  await new Promise((r) => setTimeout(r, 200))
  return { accessToken: 'mock-access-token-dev-refreshed', refreshToken: 'mock-refresh-token-dev-refreshed' }
}

async function mockGetMe() {
  await new Promise((r) => setTimeout(r, 200))
  return MOCK_USER
}

async function mockUpdateProfile(data: { name?: string; image?: string }) {
  await new Promise((r) => setTimeout(r, 200))
  return { ...MOCK_USER, ...data }
}

// ── API wrappers ──
async function apiLogin(email: string, password: string) {
  return apiClient.post<{ user: AuthUser; accessToken: string; refreshToken: string }>('/api/auth/login', { email, password })
}

async function apiRegister(email: string, password: string, name: string) {
  return apiClient.post<{ user: AuthUser; accessToken: string; refreshToken: string }>('/api/auth/register', { email, password, name })
}

async function apiRefresh(refreshToken: string) {
  return apiClient.post<{ accessToken: string; refreshToken: string }>('/api/auth/refresh', { refreshToken })
}

async function apiGetMe() {
  return apiClient.get<AuthUser>('/api/auth/me')
}

async function apiUpdateProfile(data: { name?: string; image?: string }) {
  return apiClient.patch<AuthUser>('/api/auth/me', data)
}

// ── Store ──
interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  isMockMode: boolean

  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
  setTokens: (accessToken: string, refreshToken: string) => void
  loadFromStorage: () => Promise<void>
  initialize: () => Promise<void>
  refreshAccessToken: () => Promise<{ accessToken: string; refreshToken: string } | null>
  updateProfile: (data: { name?: string; image?: string }) => Promise<void>
  clearError: () => void
  detectMockMode: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  isMockMode: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null })
    try {
      const useMock = await ensureMockMode()
      const res = useMock ? await mockLogin(email, password) : await apiLogin(email, password)
      localStorage.setItem(REFRESH_KEY, res.refreshToken)
      if (isCurrentlyMockMode()) forceMockMode()
      set({
        user: res.user,
        accessToken: res.accessToken,
        isAuthenticated: true,
        isLoading: false,
        isMockMode: isCurrentlyMockMode(),
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao fazer login'
      set({ error: message, isLoading: false })
    }
  },

  register: async (email: string, password: string, name: string) => {
    set({ isLoading: true, error: null })
    try {
      const useMock = await ensureMockMode()
      const res = useMock ? await mockRegister(email, password, name) : await apiRegister(email, password, name)
      localStorage.setItem(REFRESH_KEY, res.refreshToken)
      if (isCurrentlyMockMode()) forceMockMode()
      set({
        user: res.user,
        accessToken: res.accessToken,
        isAuthenticated: true,
        isLoading: false,
        isMockMode: isCurrentlyMockMode(),
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao cadastrar'
      set({ error: message, isLoading: false })
    }
  },

  clearError: () => set({ error: null }),

  logout: () => {
    localStorage.removeItem(REFRESH_KEY)
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    })
  },

  setTokens: (accessToken: string, refreshToken: string) => {
    localStorage.setItem(REFRESH_KEY, refreshToken)
    set({ accessToken })
  },

  loadFromStorage: async () => {
    set({ error: null })
    const refreshToken = localStorage.getItem(REFRESH_KEY)
    if (!refreshToken) {
      set({ isLoading: false })
      return
    }

    try {
      const useMock = await ensureMockMode()
      const tokens = useMock ? await mockRefresh() : await apiRefresh(refreshToken)
      localStorage.setItem(REFRESH_KEY, tokens.refreshToken)
      set({ accessToken: tokens.accessToken })

      const user = useMock ? await mockGetMe() : await apiGetMe()
      set({ user, isAuthenticated: true, isLoading: false, isMockMode: isCurrentlyMockMode() })
    } catch {
      localStorage.removeItem(REFRESH_KEY)
      resetMockMode()
      set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false, isMockMode: false })
    }
  },

  initialize: async () => {
    return get().loadFromStorage()
  },

  updateProfile: async (data) => {
    try {
      const useMock = await ensureMockMode()
      const updated = useMock ? await mockUpdateProfile(data) : await apiUpdateProfile(data)
      set({ user: updated })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar perfil'
      set({ error: message })
    }
  },

  refreshAccessToken: async () => {
    const refreshToken = localStorage.getItem(REFRESH_KEY)
    if (!refreshToken) return null

    try {
      const useMock = await ensureMockMode()
      const tokens = useMock ? await mockRefresh() : await apiRefresh(refreshToken)
      localStorage.setItem(REFRESH_KEY, tokens.refreshToken)
      set({ accessToken: tokens.accessToken })
      return tokens
    } catch {
      localStorage.removeItem(REFRESH_KEY)
      set({ user: null, accessToken: null, isAuthenticated: false, error: null })
      return null
    }
  },

  detectMockMode: async () => {
    const mock = isCurrentlyMockMode() ? true : !(await checkBackendHealth())
    set({ isMockMode: mock })
  },
}))

// Wire up the auth hooks for the API client
configureAuthHooks({
  getAccessToken: () => useAuthStore.getState().accessToken,
  getRefreshToken: () => localStorage.getItem(REFRESH_KEY),
  onRefresh: () => useAuthStore.getState().refreshAccessToken(),
  onLogout: () => useAuthStore.getState().logout(),
})

// Wire up socket auth
configureSocketAuth({
  getAccessToken: () => useAuthStore.getState().accessToken,
  setTokens: (accessToken: string, refreshToken: string) => {
    localStorage.setItem(REFRESH_KEY, refreshToken)
    useAuthStore.getState().setTokens(accessToken, refreshToken)
  },
})
