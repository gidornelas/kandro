import { describe, it, expect } from 'vitest'
import { usePresenceStore } from './store'

describe('presence store', () => {
  it('sets user online', () => {
    usePresenceStore.getState().setOnline('u1', 'online')
    const user = usePresenceStore.getState().onlineUsers.get('u1')
    expect(user?.status).toBe('online')
  })

  it('sets user offline', () => {
    usePresenceStore.getState().setOnline('u1', 'online')
    usePresenceStore.getState().setOffline('u1')
    expect(usePresenceStore.getState().onlineUsers.has('u1')).toBe(false)
  })

  it('gets status', () => {
    usePresenceStore.getState().setOnline('u1', 'busy')
    expect(usePresenceStore.getState().getStatus('u1')).toBe('busy')
    expect(usePresenceStore.getState().getStatus('u2')).toBe('offline')
  })
})
