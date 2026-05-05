import { describe, it, expect, beforeEach } from 'vitest'
import { usePresenceStore } from './presenceStore'

beforeEach(() => {
  usePresenceStore.setState({ onlineUsers: new Map() })
})

describe('presenceStore', () => {
  it('should initialize with empty map', () => {
    expect(usePresenceStore.getState().onlineUsers.size).toBe(0)
  })

  it('should set user online', () => {
    usePresenceStore.getState().setOnline('user-1', 'online')
    const user = usePresenceStore.getState().onlineUsers.get('user-1')
    expect(user?.status).toBe('online')
    expect(user?.userId).toBe('user-1')
  })

  it('should set user status', () => {
    usePresenceStore.getState().setOnline('user-1', 'online')
    usePresenceStore.getState().setStatus('user-1', 'busy', 'Em reunião')
    const user = usePresenceStore.getState().onlineUsers.get('user-1')
    expect(user?.status).toBe('busy')
    expect(user?.action).toBe('Em reunião')
  })

  it('should set user offline', () => {
    usePresenceStore.getState().setOnline('user-1', 'online')
    usePresenceStore.getState().setOffline('user-1')
    expect(usePresenceStore.getState().onlineUsers.has('user-1')).toBe(false)
  })

  it('should get status', () => {
    usePresenceStore.getState().setOnline('user-1', 'busy')
    expect(usePresenceStore.getState().getStatus('user-1')).toBe('busy')
    expect(usePresenceStore.getState().getStatus('unknown')).toBe('offline')
  })

  it('should set activity', () => {
    usePresenceStore.getState().setOnline('user-1', 'online')
    usePresenceStore.getState().setActivity('user-1', 'Digitando...', 'geral')
    const user = usePresenceStore.getState().onlineUsers.get('user-1')
    expect(user?.action).toBe('Digitando...')
    expect(user?.context).toBe('geral')
  })
})
