import { describe, it, expect, beforeEach } from 'vitest'
import { useToastStore } from './store'

describe('toast store', () => {
  beforeEach(() => {
    useToastStore.setState({ toasts: [] })
  })

  it('adds a toast', () => {
    useToastStore.getState().add('success', 'Done')
    expect(useToastStore.getState().toasts.length).toBe(1)
    expect(useToastStore.getState().toasts[0].message).toBe('Done')
  })

  it('removes a toast', () => {
    useToastStore.getState().add('error', 'Oops')
    const id = useToastStore.getState().toasts[0].id
    useToastStore.getState().remove(id)
    expect(useToastStore.getState().toasts.length).toBe(0)
  })
})
