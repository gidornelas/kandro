import React from 'react'
import * as Dialog from '@radix-ui/react-dialog'

export interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  width?: string
}

export function Modal({ open, onClose, title, description, children, footer, size = 'md', width }: ModalProps) {
  const widthMap = { sm: '360px', md: '440px', lg: '560px', xl: '840px' }

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,.18)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            animation: open ? 'fadeIn .15s ease' : 'none',
            zIndex: 50,
          }}
        >
          <style>{`@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }`}</style>
        </Dialog.Overlay>
        <Dialog.Content
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: width || widthMap[size],
            maxWidth: 'calc(100vw - 40px)',
            maxHeight: 'calc(100vh - 40px)',
            overflow: 'auto',
            background: 'var(--color-surface-elevated)',
            backdropFilter: 'blur(24px) saturate(165%)',
            WebkitBackdropFilter: 'blur(24px) saturate(165%)',
            border: '1px solid var(--color-glass-border)',
            borderRadius: '14px',
            boxShadow: 'var(--shadow-modal), inset 0 1px 0 rgba(255,255,255,.68)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            animation: open ? 'scaleIn .2s cubic-bezier(.16,1,.3,1)' : 'none',
            zIndex: 51,
          }}
        >
          <style>{`@keyframes scaleIn { from { opacity: 0; transform: translate(-50%,-50%) scale(.96) } to { opacity: 1; transform: translate(-50%,-50%) scale(1) } }`}</style>
          {title && (
            <Dialog.Title
              style={{
                fontSize: '15px',
                fontWeight: 700,
                letterSpacing: '-0.01em',
                color: 'var(--color-text-primary)',
                margin: 0,
              }}
            >
              {title}
            </Dialog.Title>
          )}
          {description && (
            <Dialog.Description
              style={{
                fontSize: '13px',
                color: 'var(--color-text-tertiary)',
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              {description}
            </Dialog.Description>
          )}
          <div style={{ flex: 1 }}>{children}</div>
          {footer && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '8px',
                paddingTop: '8px',
                borderTop: '1px solid var(--color-border-subtle)',
              }}
            >
              {footer}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
