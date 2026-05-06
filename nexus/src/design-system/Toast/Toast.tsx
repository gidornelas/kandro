import React from 'react'
import type { ToastType } from './store'

export interface ToastProps {
  id: string
  type: ToastType
  message: string
  onRemove: (id: string) => void
}

export function ToastItem({ id, type, message, onRemove }: ToastProps) {
  React.useEffect(() => {
    const timer = setTimeout(() => onRemove(id), 4000)
    return () => clearTimeout(timer)
  }, [id, onRemove])

  const typeStyles: Record<ToastType, React.CSSProperties> = {
    success: { background: 'var(--color-success)', color: '#fff' },
    error: { background: 'var(--color-danger)', color: '#fff' },
    info: { background: 'var(--color-accent)', color: '#fff' },
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 14px',
        borderRadius: '12px',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: 'var(--shadow-soft)',
        fontSize: '13px',
        fontWeight: 500,
        animation: 'slideUp .25s cubic-bezier(.16,1,.3,1)',
        minWidth: '240px',
        maxWidth: '360px',
        ...typeStyles[type],
      }}
    >
      <style>{`@keyframes slideUp { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: none } }`}</style>
      <span style={{ flex: 1 }}>{message}</span>
      <button
        onClick={() => onRemove(id)}
        style={{
          background: 'none',
          border: 'none',
          color: 'inherit',
          cursor: 'pointer',
          fontSize: '16px',
          lineHeight: 1,
          opacity: 0.7,
          padding: '2px',
        }}
        aria-label="Fechar notificação"
      >
        ×
      </button>
    </div>
  )
}
