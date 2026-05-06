import { create } from 'zustand'
import { configureAuthHooks } from '../api/client'
import * as authApi from '../api/auth'
import { forceMockMode, isCurrentlyMockMode, resetMockMode } from '../api/auth'
import type { AuthUser } from '../types'
import { useToastStore } from './toastStore'

const REFRESH_KEY = 'nexus_refresh_token'

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
      const res = await authApi.login(email, password)
      localStorage.setItem(REFRESH_KEY, res.refreshToken)
      // Lock mock mode after first successful mock login
      if (isCurrentlyMockMode()) forceMockMode()
      set({
        user: res.user,
        accessToken: res.accessToken,
        isAuthenticated: true,
        isLoading: false,
        isMockMode: isCurrentlyMockMode(),
      })
      useToastStore.getState().add('success', 'Login realizado com sucesso')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao fazer login'
      set({ error: message, isLoading: false })
      useToastStore.getState().add('error', message)
    }
  },

  register: async (email: string, password: string, name: string) => {
    set({ isLoading: true, error: null })
    try {
      const res = await authApi.register(email, password, name)
      localStorage.setItem(REFRESH_KEY, res.refreshToken)
      if (isCurrentlyMockMode()) forceMockMode()
      set({
        user: res.user,
        accessToken: res.accessToken,
        isAuthenticated: true,
        isLoading: false,
        isMockMode: isCurrentlyMockMode(),
      })
      useToastStore.getState().add('success', 'Conta criada com sucesso')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao cadastrar'
      set({ error: message, isLoading: false })
      useToastStore.getState().add('error', message)
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
      const tokens = await authApi.refresh(refreshToken)
      localStorage.setItem(REFRESH_KEY, tokens.refreshToken)
      set({ accessToken: tokens.accessToken })

      const user = await authApi.getMe()
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
      const updated = await authApi.updateProfile(data)
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
      const tokens = await authApi.refresh(refreshToken)
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
    // Probe backend; update isMockMode reactively
    const mock = await import('../api/auth').then(m =>
      m.isCurrentlyMockMode() ? true : import('../lib/dev-mode').then(d => d.checkBackendHealth().then(r => !r))
    )
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
