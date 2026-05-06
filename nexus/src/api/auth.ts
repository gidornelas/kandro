import { apiClient } from './client'
import type { AuthUser } from '../types'
import {
  isMockAuthEnabled,
  isDevMode,
  checkBackendHealth,
} from '../lib/dev-mode'
import {
  mockLogin,
  mockRegister,
  mockRefresh,
  mockGetMe,
  mockUpdateProfile,
} from './mock-auth'

interface AuthResponse {
  user: AuthUser
  accessToken: string
  refreshToken: string
}

interface RefreshResponse {
  accessToken: string
  refreshToken: string
}

// ── Dev-mode state ──
let _mockMode: boolean | null = null
let _checking = false

async function ensureMockMode(): Promise<boolean> {
  if (_mockMode !== null) return _mockMode
  if (isMockAuthEnabled) { _mockMode = true; return true }
  if (!isDevMode) { _mockMode = false; return false }

  // Avoid concurrent health checks
  if (_checking) {
    while (_checking) await new Promise(r => setTimeout(r, 50))
    return _mockMode ?? false
  }

  _checking = true
  const reachable = await checkBackendHealth()
  _mockMode = !reachable
  _checking = false
  return _mockMode
}

/** Force mock mode on (called after first successful mock login) */
export function forceMockMode() {
  _mockMode = true
}

/** Check if currently in mock mode */
export function isCurrentlyMockMode() {
  return _mockMode === true
}

/** Reset mock mode detection */
export function resetMockMode() {
  _mockMode = null
}

export async function login(email: string, password: string) {
  const useMock = await ensureMockMode()
  if (useMock) return mockLogin(email, password)
  return apiClient.post<AuthResponse>('/api/auth/login', { email, password })
}

export async function register(email: string, password: string, name: string) {
  const useMock = await ensureMockMode()
  if (useMock) return mockRegister(email, password, name)
  return apiClient.post<AuthResponse>('/api/auth/register', { email, password, name })
}

export async function refresh(refreshToken: string) {
  const useMock = await ensureMockMode()
  if (useMock) return mockRefresh()
  return apiClient.post<RefreshResponse>('/api/auth/refresh', { refreshToken })
}

export async function getMe() {
  const useMock = await ensureMockMode()
  if (useMock) return mockGetMe()
  return apiClient.get<AuthUser>('/api/auth/me')
}

export async function updateProfile(data: { name?: string; image?: string }) {
  const useMock = await ensureMockMode()
  if (useMock) return mockUpdateProfile(data)
  return apiClient.patch<AuthUser>('/api/auth/me', data)
}
