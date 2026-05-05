import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { apiClient, ApiError, configureAuthHooks } from '../client'
import { handlers, mockAccessToken, mockRefreshToken } from '../../test/msw-handlers'

const server = setupServer(...handlers)

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

// Configure auth hooks for tests
configureAuthHooks({
  getAccessToken: () => mockAccessToken,
  getRefreshToken: () => mockRefreshToken,
  onRefresh: async () => ({ accessToken: 'refreshed', refreshToken: 'new-refresh' }),
  onLogout: () => {},
})

describe('apiClient', () => {
  it('performs GET request', async () => {
    const result = await apiClient.get<{ data: Array<{ id: string; text: string }> }>('/api/channels/ch-1/messages')
    expect(result.data).toHaveLength(1)
    expect(result.data[0].text).toBe('Hello world')
  })

  it('performs POST request with body', async () => {
    const result = await apiClient.post<{ text: string }>('/api/channels/ch-1/messages', { text: 'New message' })
    expect(result.text).toBe('New message')
  })

  it('performs PATCH request with body', async () => {
    const result = await apiClient.patch<{ text: string }>('/api/messages/msg-1', { text: 'Updated' })
    expect(result.text).toBe('Updated')
  })

  it('performs DELETE request returning void on 204', async () => {
    const result = await apiClient.delete<void>('/api/messages/msg-1')
    expect(result).toBeUndefined()
  })

  it('injects Authorization header', async () => {
    let capturedHeaders: Record<string, string> = {}
    server.use(
      http.get('http://localhost:3000/api/auth/me', ({ request }) => {
        capturedHeaders = Object.fromEntries(request.headers.entries())
        return HttpResponse.json({ id: 'user-1' })
      })
    )

    await apiClient.get('/api/auth/me')
    expect(capturedHeaders.authorization).toBe(`Bearer ${mockAccessToken}`)
  })

  it('throws ApiError on non-ok responses', async () => {
    try {
      await apiClient.get('/api/error-test')
      expect.fail('should have thrown')
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError)
      if (err instanceof ApiError) {
        expect(err.statusCode).toBe(404)
        expect(err.message).toContain('Resource not found')
      }
    }
  })
})
