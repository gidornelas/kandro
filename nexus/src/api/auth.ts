import { apiClient } from './client'
import type { AuthUser } from '../types'

interface AuthResponse {
  user: AuthUser
  accessToken: string
  refreshToken: string
}

interface RefreshResponse {
  accessToken: string
  refreshToken: string
}

export function login(email: string, password: string) {
  return apiClient.post<AuthResponse>('/api/auth/login', { email, password })
}

export function register(email: string, password: string, name: string) {
  return apiClient.post<AuthResponse>('/api/auth/register', { email, password, name })
}

export function refresh(refreshToken: string) {
  return apiClient.post<RefreshResponse>('/api/auth/refresh', { refreshToken })
}

export function getMe() {
  return apiClient.get<AuthUser>('/api/auth/me')
}

export function updateProfile(data: { name?: string; image?: string }) {
  return apiClient.patch<AuthUser>('/api/auth/me', data)
}
