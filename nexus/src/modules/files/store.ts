import { create } from 'zustand'
import type { FolderItem } from '../../shared/types/domain'
import { FILES } from '../../shared/mocks'

interface FilesState {
  items: FolderItem[]
  currentFolder: string | null
  uploadFile: (file: { name: string; size: string; icon: string }) => void
  deleteFile: (id: string) => void
  getCurrentItems: () => FolderItem[]
}

let fileIdCounter = 100

export const useFilesStore = create<FilesState>((set, get) => ({
  items: [...FILES],
  currentFolder: null,

  uploadFile(file) {
    const newFile: FolderItem = {
      id: `f${++fileIdCounter}`,
      name: file.name,
      type: 'file',
      icon: file.icon,
      size: file.size,
      teamIds: [],
      restricted: false,
      encrypted: false,
      uploadedAt: 'Agora',
    }
    set({ items: [...get().items, newFile] })
  },

  deleteFile(id) {
    set({ items: get().items.filter((i) => i.id !== id) })
  },

  getCurrentItems() {
    return get().items
  },
}))
