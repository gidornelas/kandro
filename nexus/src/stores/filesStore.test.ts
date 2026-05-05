import { describe, it, expect, beforeEach } from 'vitest'
import { useFilesStore } from './filesStore'

beforeEach(() => {
  useFilesStore.setState({
    currentFolderId: null,
    breadcrumb: [{ id: null, name: 'Arquivos' }],
  })
})

describe('filesStore', () => {
  it('should initialize with default state', () => {
    const state = useFilesStore.getState()
    expect(state.currentFolderId).toBeNull()
    expect(state.breadcrumb).toHaveLength(1)
  })

  it('should navigate to folder', () => {
    useFilesStore.getState().navigateToFolder('folder-1', 'Documentos')
    const state = useFilesStore.getState()
    expect(state.currentFolderId).toBe('folder-1')
    expect(state.breadcrumb).toHaveLength(2)
    expect(state.breadcrumb[1].name).toBe('Documentos')
  })

  it('should navigate to root', () => {
    useFilesStore.setState({ currentFolderId: 'folder-1', breadcrumb: [{ id: null, name: 'Arquivos' }, { id: 'folder-1', name: 'Docs' }] })
    useFilesStore.getState().navigateToFolder(null)
    const state = useFilesStore.getState()
    expect(state.currentFolderId).toBeNull()
    expect(state.breadcrumb).toHaveLength(1)
  })
})
