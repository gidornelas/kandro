import { describe, it, expect } from 'vitest'
import { http, HttpResponse } from 'msw'
import { login, register, getMe } from '../auth'
import { mockUser } from '../../test/msw-handlers'
import { server } from '../../test/setup'

describe('Auth API', () => {
  it('login returns user and tokens', async () => {
    const result = await login('test@nexus.test', 'password123')

    expect(result.user.email).toBe(mockUser.email)
    expect(result.accessToken).toBeTruthy()
    expect(result.refreshToken).toBeTruthy()
  })

  it('register returns user and tokens', async () => {
    const result = await register('new@nexus.test', 'password123', 'New User')

    expect(result.user.name).toBe('Test User')
    expect(result.accessToken).toBeTruthy()
  })

  it('getMe returns current user', async () => {
    const result = await getMe()

    expect(result.email).toBe(mockUser.email)
    expect(result.name).toBe(mockUser.name)
  })

  it('handles 401 from getMe', async () => {
    server.use(
      http.get('http://localhost:3000/api/auth/me', () => {
        return HttpResponse.json(
          { error: 'UNAUTHORIZED', message: 'Não autorizado', statusCode: 401 },
          { status: 401 }
        )
      })
    )

    // The client will try to refresh the token, so we need to handle that too
    server.use(
      http.post('http://localhost:3000/api/auth/refresh', () => {
        return HttpResponse.json(
          { error: 'UNAUTHORIZED', message: 'Refresh token inválido', statusCode: 401 },
          { status: 401 }
        )
      })
    )

    await expect(getMe()).rejects.toThrow()
  })
})
