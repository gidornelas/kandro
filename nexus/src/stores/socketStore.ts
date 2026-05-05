import { create } from 'zustand'
import { connectSocket, disconnectSocket, getSocket } from '../lib/socket'

export type SocketConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting'

interface SocketState {
  connectionState: SocketConnectionState
  connect: () => void
  disconnect: () => void
}

export const useSocketStore = create<SocketState>((set) => ({
  connectionState: 'disconnected',

  connect: () => {
    const existing = getSocket()
    if (existing?.connected) {
      set({ connectionState: 'connected' })
      return
    }

    set({ connectionState: 'connecting' })
    const socket = connectSocket()

    socket.on('connect', () => {
      set({ connectionState: 'connected' })
    })

    socket.on('disconnect', () => {
      set({ connectionState: 'disconnected' })
    })

    socket.io.on('reconnect_attempt', () => {
      set({ connectionState: 'reconnecting' })
    })

    socket.on('connect_error', () => {
      set({ connectionState: 'disconnected' })
    })
  },

  disconnect: () => {
    disconnectSocket()
    set({ connectionState: 'disconnected' })
  },
}))
