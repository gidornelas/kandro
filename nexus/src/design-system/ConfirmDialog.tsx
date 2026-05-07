import React from 'react'
import { Button } from './Button'
import { Modal } from './Modal'

export interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'default' | 'danger'
  onConfirm: () => void | Promise<void>
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'default',
  onConfirm,
}: ConfirmDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleConfirm = async () => {
    setIsSubmitting(true)
    try {
      await onConfirm()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      title={title}
      description={description}
      size="sm"
      width="400px"
      footer={(
        <>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            {cancelLabel}
          </Button>
          <Button type="button" variant={variant === 'danger' ? 'danger' : 'primary'} onClick={() => void handleConfirm()} loading={isSubmitting}>
            {confirmLabel}
          </Button>
        </>
      )}
    >
      <div style={{ minHeight: '8px' }} />
    </Modal>
  )
}
