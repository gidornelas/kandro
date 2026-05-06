import { io, Socket } from 'socket.io-client'
import { useAuthStore } from '../stores/authStore'
import { WS_URL } from './env'

const REFRESH_INTERVAL_MS = 14 * 60 * 1000 // 14 minutes (1 min before 15-min token expiry)

let socket: Socket | null = null
let refreshTimer: ReturnType<typeof setInterval> | null = null

export function getSocket(): Socket | null {
  return socket
}

function startRefreshTimer() {
  stopRefreshTimer()
  refreshTimer = setInterval(() => {
    const refreshToken = localStorage.getItem('nexus_refresh_token')
    if (!refreshToken || !socket?.connected) return

    socket.emit('auth:refresh', { refreshToken }, (res: { ok: boolean; accessToken?: string; refreshToken?: string }) => {
      if (res.ok && res.accessToken) {
        useAuthStore.getState().setTokens(res.accessToken, res.refreshToken ?? refreshToken)
      }
    })
  }, REFRESH_INTERVAL_MS)
}

function stopRefreshTimer() {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
}

export function connectSocket(): Socket {
  if (socket?.connected) return socket

  const token = useAuthStore.getState().accessToken

  socket = io(WS_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  })

  socket.on('connect', () => {
    console.log('[Socket] Connected', socket?.id)
    startRefreshTimer()
  })

  socket.on('disconnect', (reason) => {
    console.log('[Socket] Disconnected', reason)
    stopRefreshTimer()
  })

  socket.on('connect_error', (err) => {
    console.error('[Socket] Connection error', err.message)
  })

  // Update auth token before reconnecting
  socket.io.on('reconnect_attempt', () => {
    const token = useAuthStore.getState().accessToken
    if (socket && token) {
      socket.auth = { token }
    }
  })

  return socket
}

export function disconnectSocket() {
  stopRefreshTimer()
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export function subscribeWorkspace(workspaceId: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (!socket?.connected) {
      resolve(false)
      return
    }
    socket.emit('subscribe:workspace', workspaceId, (res: { ok: boolean }) => {
      resolve(res.ok)
    })
  })
}

export function subscribeChannel(channelId: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (!socket?.connected) {
      resolve(false)
      return
    }
    socket.emit('subscribe:channel', channelId, (res: { ok: boolean }) => {
      resolve(res.ok)
    })
  })
}

export function unsubscribeChannel(channelId: string) {
  socket?.emit('unsubscribe:channel', channelId)
}
