import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { useAuthStore } from '../../stores/authStore'
import { useToastStore } from '../../stores/toastStore'

export function ProfileModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { user, updateProfile } = useAuthStore()
  const addToast = useToastStore(s => s.add)
  const [name, setName] = useState(user?.name ?? '')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!name.trim() || !user) return
    setSaving(true)
    try {
      await updateProfile({ name: name.trim() })
      addToast('success', 'Perfil atualizado com sucesso')
      onOpenChange(false)
    } catch {
      addToast('error', 'Erro ao atualizar perfil')
    }
    setSaving(false)
  }

  if (!user) return null

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[5000]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--bg-panel)] border border-[var(--border)] rounded-2xl p-6 min-w-[380px] max-w-[90vw] shadow-[var(--shadow-modal)] z-[5001] outline-none">
          <Dialog.Title className="font-display font-bold text-lg text-[var(--text-1)] mb-6">
            Editar Perfil
          </Dialog.Title>

          {/* Avatar preview */}
          <div className="flex flex-col items-center gap-4 mb-6">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white"
              style={{ background: user.color }}
            >
              {user.initials}
            </div>
          </div>

          {/* Name input */}
          <div className="flex flex-col gap-2 mb-6">
            <label className="text-xs font-semibold text-[var(--text-2)]">Nome</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Seu nome"
              className="w-full px-3.5 py-2.5 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg text-[var(--text-1)] font-body text-sm outline-none focus:border-[var(--accent)]"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Dialog.Close asChild>
              <button className="px-4 py-2 rounded-lg bg-[var(--bg-card)] text-[var(--text-2)] border border-[var(--border)] font-body text-xs font-semibold cursor-pointer">
                Cancelar
              </button>
            </Dialog.Close>
            <button
              onClick={handleSave}
              disabled={saving || !name.trim()}
              className="px-4 py-2 rounded-lg bg-[var(--accent)] text-white border-none font-body text-xs font-semibold cursor-pointer disabled:opacity-50"
            >
              {saving ? 'Salvando…' : 'Salvar'}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
