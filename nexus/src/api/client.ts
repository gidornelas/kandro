import { API_URL } from '../lib/env'

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
    public details?: unknown[],
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

let getAccessToken: () => string | null = () => null
let getRefreshToken: () => string | null = () => null
let onRefresh: () => Promise<{ accessToken: string; refreshToken: string } | null> = async () => null
let onLogout: () => void = () => {}

export function configureAuthHooks(hooks: {
  getAccessToken: () => string | null
  getRefreshToken: () => string | null
  onRefresh: () => Promise<{ accessToken: string; refreshToken: string } | null>
  onLogout: () => void
}) {
  getAccessToken = hooks.getAccessToken
  getRefreshToken = hooks.getRefreshToken
  onRefresh = hooks.onRefresh
  onLogout = hooks.onLogout
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_URL}${path}`
  const token = getAccessToken()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (token) headers['Authorization'] = `Bearer ${token}`

  let response = await fetch(url, { ...options, headers })

  // On 401, try token refresh once
  if (response.status === 401 && getRefreshToken()) {
    const tokens = await onRefresh()
    if (tokens) {
      headers['Authorization'] = `Bearer ${tokens.accessToken}`
      response = await fetch(url, { ...options, headers })
    } else {
      onLogout()
    }
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new ApiError(
      response.status,
      body.message || `Request failed with status ${response.status}`,
      body.error,
      body.details,
    )
  }

  // Handle 204 No Content
  if (response.status === 204) return undefined as T

  return response.json() as Promise<T>
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(path: string) =>
    request<T>(path, { method: 'DELETE' }),
}
