import React, { useEffect, useRef, useCallback } from 'react'

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

interface DialogContentProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

interface DialogHeaderProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

interface DialogTitleProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  id?: string
}

interface DialogFooterProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onOpenChange(false)

    // Focus trapping
    if (e.key === 'Tab' && contentRef.current) {
      const focusable = contentRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
  }, [onOpenChange])

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'

      // Focus first focusable element
      requestAnimationFrame(() => {
        if (contentRef.current) {
          const first = contentRef.current.querySelector<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
          first?.focus()
        }
      })
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, handleKeyDown])

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-[5000]"
      onClick={() => onOpenChange(false)}
    >
      {children}
    </div>
  )
}

export function DialogContent({ children, className = '', style }: DialogContentProps) {
  return (
    <div
      onClick={e => e.stopPropagation()}
      className={`bg-[var(--bg-card)] border border-[var(--border)] rounded-xl max-w-[520px] max-h-[80vh] overflow-hidden flex flex-col gap-0 ${className}`}
      style={style}
    >
      {children}
    </div>
  )
}

export function DialogHeader({ children, className = '', style }: DialogHeaderProps) {
  return (
    <div className={`px-6 pt-5 ${className}`} style={style}>
      {children}
    </div>
  )
}

export function DialogTitle({ children, className = '', style, id }: DialogTitleProps) {
  return (
    <div
      id={id}
      className={`font-display text-base text-[var(--text-1)] ${className}`}
      style={style}
    >
      {children}
    </div>
  )
}

export function DialogFooter({ children, className = '', style }: DialogFooterProps) {
  return (
    <div
      className={`px-6 py-4 border-t border-[var(--border)] flex justify-end gap-2 ${className}`}
      style={style}
    >
      {children}
    </div>
  )
}
