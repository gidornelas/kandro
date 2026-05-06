/**
 * Mock authentication for frontend-only dev mode.
 * Returns predictable mock data so developers can navigate the app locally.
 */

import type { AuthUser } from '../types'

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

const MOCK_ACCESS_TOKEN = 'mock-access-token-dev'
const MOCK_REFRESH_TOKEN = 'mock-refresh-token-dev'

export interface MockAuthResponse {
  user: AuthUser
  accessToken: string
  refreshToken: string
}

/** Simulate login — accepts any valid-looking credentials */
export async function mockLogin(email: string, _password: string): Promise<MockAuthResponse> {
  // Simulate network latency
  await new Promise(r => setTimeout(r, 400))

  return {
    user: { ...MOCK_USER, email },
    accessToken: MOCK_ACCESS_TOKEN,
    refreshToken: MOCK_REFRESH_TOKEN,
  }
}

/** Simulate register */
export async function mockRegister(
  email: string,
  _password: string,
  name: string,
): Promise<MockAuthResponse> {
  await new Promise(r => setTimeout(r, 400))

  const initials = name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return {
    user: { ...MOCK_USER, email, name, initials },
    accessToken: MOCK_ACCESS_TOKEN,
    refreshToken: MOCK_REFRESH_TOKEN,
  }
}

/** Simulate token refresh */
export async function mockRefresh(): Promise<{ accessToken: string; refreshToken: string }> {
  await new Promise(r => setTimeout(r, 200))
  return {
    accessToken: 'mock-access-token-dev-refreshed',
    refreshToken: 'mock-refresh-token-dev-refreshed',
  }
}

/** Simulate getMe */
export async function mockGetMe(): Promise<AuthUser> {
  await new Promise(r => setTimeout(r, 200))
  return MOCK_USER
}

/** Simulate updateProfile */
export async function mockUpdateProfile(data: {
  name?: string
  image?: string
}): Promise<AuthUser> {
  await new Promise(r => setTimeout(r, 200))
  return { ...MOCK_USER, ...data }
}
