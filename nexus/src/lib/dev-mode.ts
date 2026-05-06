/**
 * Dev-mode utilities for frontend-only development.
 * When backend is unreachable, provides mock auth and clear feedback.
 */

import { API_URL } from './env'

let backendReachable: boolean | null = null
let backendCheck: Promise<boolean> | null = null

/** Check if backend is reachable */
export async function checkBackendHealth(): Promise<boolean> {
  if (backendReachable !== null) return backendReachable
  if (backendCheck) return backendCheck

  backendCheck = (async () => {
    try {
      const res = await fetch(`${API_URL}/api/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(3000),
      })
      backendReachable = res.ok
      return backendReachable
    } catch {
      backendReachable = false
      return false
    } finally {
      backendCheck = null
    }
  })()

  return backendCheck
}

/** Whether mock auth is explicitly enabled via env */
export const isMockAuthEnabled = import.meta.env.VITE_MOCK_AUTH === 'true'

/** Whether we're in Vite dev mode */
export const isDevMode = import.meta.env.DEV

/** Combined flag: mock auth active when enabled OR when backend is unreachable in dev */
export async function isMockAuthActive(): Promise<boolean> {
  if (isMockAuthEnabled) return true
  if (!isDevMode) return false
  return !(await checkBackendHealth())
}

/** Reset cached health check (useful for retry) */
export function resetBackendCheck() {
  backendReachable = null
  backendCheck = null
}
