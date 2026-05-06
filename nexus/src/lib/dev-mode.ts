/**
 * Dev-mode utilities for frontend-only development.
 * When backend is unreachable, provides mock auth and clear feedback.
 */

import { API_URL } from './env'

/** Check if backend is reachable */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/api/auth/me`, {
      method: 'GET',
      signal: AbortSignal.timeout(3000),
    })
    return res.status !== 404 || res.ok
  } catch {
    return false
  }
}

/** Whether mock auth is explicitly enabled via env */
export const isMockAuthEnabled = import.meta.env.VITE_MOCK_AUTH === 'true'

/** Whether we're in Vite dev mode */
export const isDevMode = import.meta.env.DEV

/** Combined flag: mock auth active when enabled OR when backend is unreachable in dev */
let _backendReachable: boolean | null = null

export async function isMockAuthActive(): Promise<boolean> {
  if (isMockAuthEnabled) return true
  if (!isDevMode) return false
  if (_backendReachable !== null) return !_backendReachable
  _backendReachable = await checkBackendHealth()
  return !_backendReachable
}

/** Reset cached health check (useful for retry) */
export function resetBackendCheck() {
  _backendReachable = null
}
