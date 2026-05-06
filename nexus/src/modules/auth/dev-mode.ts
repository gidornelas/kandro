/**
 * Dev-mode utilities for frontend-only development.
 */

import { API_URL } from '../../core/env'

let backendReachable: boolean | null = null
let backendCheck: Promise<boolean> | null = null

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

export const isMockAuthEnabled = import.meta.env.VITE_MOCK_AUTH === 'true'
export const isDevMode = import.meta.env.DEV

export async function isMockAuthActive(): Promise<boolean> {
  if (isMockAuthEnabled) return true
  if (!isDevMode) return false
  return !(await checkBackendHealth())
}

export function resetBackendCheck() {
  backendReachable = null
  backendCheck = null
}
