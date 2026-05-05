import { create } from 'zustand'

export interface PresenceUser {
  userId: string
  status: string
  action?: string
  context?: string
  lastSeen: number
}

interface PresenceState {
  onlineUsers: Map<string, PresenceUser>

  setOnline: (userId: string, status: string) => void
  setStatus: (userId: string, status: string, action?: string, context?: string) => void
  setOffline: (userId: string) => void
  setActivity: (userId: string, action: string, context?: string) => void
  getStatus: (userId: string) => string
}

export const usePresenceStore = create<PresenceState>((set, get) => ({
  onlineUsers: new Map(),

  setOnline: (userId, status) => set(s => {
    const next = new Map(s.onlineUsers)
    next.set(userId, {
      userId,
      status,
      lastSeen: Date.now(),
    })
    return { onlineUsers: next }
  }),

  setStatus: (userId, status, action, context) => set(s => {
    const next = new Map(s.onlineUsers)
    const existing = next.get(userId)
    if (existing) {
      next.set(userId, { ...existing, status, action, context, lastSeen: Date.now() })
    } else {
      next.set(userId, { userId, status, action, context, lastSeen: Date.now() })
    }
    return { onlineUsers: next }
  }),

  setOffline: (userId) => set(s => {
    const next = new Map(s.onlineUsers)
    next.delete(userId)
    return { onlineUsers: next }
  }),

  setActivity: (userId, action, context) => set(s => {
    const next = new Map(s.onlineUsers)
    const existing = next.get(userId)
    if (existing) {
      next.set(userId, { ...existing, action, context, lastSeen: Date.now() })
    }
    return { onlineUsers: next }
  }),

  getStatus: (userId) => {
    const user = get().onlineUsers.get(userId)
    return user?.status || 'offline'
  },
}))
