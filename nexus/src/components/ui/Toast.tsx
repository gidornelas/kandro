import { useToastStore, type ToastType } from '../../stores/toastStore'

const BG: Record<ToastType, string> = {
  success: 'var(--grn)',
  error: 'var(--red)',
  info: 'var(--acc)',
}

const ICON: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
}

export function ToastContainer() {
  const { toasts, remove } = useToastStore()

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className="flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg pointer-events-auto min-w-[280px] max-w-[400px] animate-[fadeUp_0.2s_ease]"
          style={{ background: BG[toast.type] }}
        >
          <span className="text-white text-sm font-bold flex-shrink-0">{ICON[toast.type]}</span>
          <span className="text-white text-xs flex-1">{toast.message}</span>
          <button
            onClick={() => remove(toast.id)}
            className="bg-transparent border-none text-white/70 cursor-pointer text-sm p-0 leading-none hover:text-white"
            aria-label="Fechar notificação"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}
