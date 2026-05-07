import { create } from 'zustand'
import type { FolderItem } from '../../shared/types/domain'
import { FILES } from '../../shared/mocks'
import { useAppDataStore } from '../app-data/store'
import { useAuthStore } from '../auth/store'
import * as FilesApi from './api'

interface FilesState {
  items: FolderItem[]
  currentFolder: string | null
  isLoading: boolean
  error: string | null
  loadFiles: () => Promise<void>
  uploadFile: (file: File) => Promise<void>
  deleteFile: (id: string) => Promise<void>
  getCurrentItems: () => FolderItem[]
}

let fileIdCounter = 100

function formatSize(size?: string | number) {
  if (typeof size === 'string') return size
  if (!size) return undefined
  if (size >= 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} MB`
  return `${(size / 1024).toFixed(1)} KB`
}

function toFolderItem(file: FilesApi.FolderNode): FolderItem {
  return {
    id: file.id,
    name: file.name,
    type: file.type,
    icon: file.icon,
    size: formatSize(file.size),
    itemCount: file.itemCount,
    teamIds: file.teamIds ?? [],
    uploadedBy: file.uploadedBy,
    uploadedAt: file.uploadedAt ? new Date(file.uploadedAt).toLocaleDateString('pt-BR') : undefined,
    restricted: file.restricted,
    encrypted: file.encrypted,
  }
}

export const useFilesStore = create<FilesState>((set, get) => ({
  items: [],
  currentFolder: null,
  isLoading: false,
  error: null,

  loadFiles: async () => {
    const workspaceId = useAppDataStore.getState().activeWorkspaceId
    if (!workspaceId) {
      if (useAppDataStore.getState().error || !useAppDataStore.getState().isLoading) set({ items: [], isLoading: false })
      return
    }
    set({ isLoading: true, error: null })
    try {
      const response = await FilesApi.list(workspaceId, get().currentFolder)
      set({ items: response.data.map(toFolderItem), isLoading: false })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar arquivos'
      if (useAuthStore.getState().isMockMode) {
        set({ items: FILES, isLoading: false })
        return
      }
      set({ error: message, isLoading: false })
    }
  },

  uploadFile: async (file) => {
    const workspaceId = useAppDataStore.getState().activeWorkspaceId
    if (!workspaceId) {
      if (!useAuthStore.getState().isMockMode) {
        set({ error: 'Workspace indisponível para upload' })
        return
      }
      const size = formatSize(file.size) ?? ''
      const icon = file.name.endsWith('.fig') ? '🎨' : file.name.endsWith('.pdf') ? '📄' : file.name.endsWith('.png') || file.name.endsWith('.jpg') ? '🖼' : '📎'
      set({
        items: [...get().items, { id: `f${++fileIdCounter}`, name: file.name, type: 'file', icon, size, teamIds: [], restricted: false, encrypted: false, uploadedAt: 'Agora' }],
      })
      return
    }
    try {
      const uploaded = await FilesApi.upload(workspaceId, get().currentFolder, file)
      set({ items: [...get().items, toFolderItem(uploaded)] })
    } catch (err) {
      if (useAuthStore.getState().isMockMode) {
        const size = formatSize(file.size) ?? ''
        const icon = file.name.endsWith('.fig') ? '🎨' : file.name.endsWith('.pdf') ? '📄' : file.name.endsWith('.png') || file.name.endsWith('.jpg') ? '🖼' : '📎'
        set({
          items: [...get().items, { id: `f${++fileIdCounter}`, name: file.name, type: 'file', icon, size, teamIds: [], restricted: false, encrypted: false, uploadedAt: 'Agora' }],
        })
        return
      }
      const message = err instanceof Error ? err.message : 'Erro ao enviar arquivo'
      set({ error: message })
    }
  },

  deleteFile: async (id) => {
    try {
      await FilesApi.remove(id)
      set({ items: get().items.filter((item) => item.id !== id) })
    } catch (err) {
      if (useAuthStore.getState().isMockMode) {
        set({ items: get().items.filter((item) => item.id !== id) })
        return
      }
      const message = err instanceof Error ? err.message : 'Erro ao remover arquivo'
      set({ error: message })
    }
  },

  getCurrentItems() {
    return get().items
  },
}))
