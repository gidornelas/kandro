import { create } from 'zustand'


interface FilesState {
  currentFolderId: string | null
  breadcrumb: { id: string | null; name: string }[]

  navigateToFolder: (folderId: string | null, folderName?: string) => void
}

export const useFilesStore = create<FilesState>((set, get) => ({
  currentFolderId: null,
  breadcrumb: [{ id: null, name: 'Arquivos' }],

  navigateToFolder: (folderId, folderName) => {
    const { breadcrumb } = get()
    if (folderId === null) {
      set({ currentFolderId: null, breadcrumb: [{ id: null, name: 'Arquivos' }] })
      return
    }
    const idx = breadcrumb.findIndex(b => b.id === folderId)
    if (idx >= 0) {
      set({
        currentFolderId: folderId,
        breadcrumb: breadcrumb.slice(0, idx + 1),
      })
    } else {
      set({
        currentFolderId: folderId,
        breadcrumb: [...breadcrumb, { id: folderId, name: folderName ?? folderId }],
      })
    }
  },
}))
