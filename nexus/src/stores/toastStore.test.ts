import { describe, it, expect, beforeEach } from 'vitest'
import { useToastStore } from './toastStore'

beforeEach(() => {
  useToastStore.setState({ toasts: [] })
})

describe('toastStore', () => {
  it('should initialize with empty toasts', () => {
    expect(useToastStore.getState().toasts).toEqual([])
  })

  it('should add a toast', () => {
    useToastStore.getState().add('success', 'Operação concluída', 0)
    const state = useToastStore.getState()
    expect(state.toasts).toHaveLength(1)
    expect(state.toasts[0].type).toBe('success')
    expect(state.toasts[0].message).toBe('Operação concluída')
  })

  it('should remove a toast', () => {
    useToastStore.getState().add('error', 'Erro', 0)
    const id = useToastStore.getState().toasts[0].id
    useToastStore.getState().remove(id)
    expect(useToastStore.getState().toasts).toHaveLength(0)
  })

  it('should add multiple toasts', () => {
    useToastStore.getState().add('info', 'Info 1', 0)
    useToastStore.getState().add('success', 'Sucesso', 0)
    expect(useToastStore.getState().toasts).toHaveLength(2)
  })
})
