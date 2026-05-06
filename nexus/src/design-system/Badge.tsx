export interface BadgeProps {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  children: React.ReactNode
  className?: string
}

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  const variantStyles: Record<string, React.CSSProperties> = {
    default: {
      background: 'rgba(255,255,255,.65)',
      color: 'var(--color-text-secondary)',
      border: '1px solid var(--color-border-subtle)',
    },
    primary: {
      background: 'var(--color-accent)',
      color: '#fff',
      border: '1px solid var(--color-accent)',
    },
    success: {
      background: 'var(--color-success)',
      color: '#fff',
      border: '1px solid var(--color-success)',
    },
    warning: {
      background: 'var(--color-warning)',
      color: '#fff',
      border: '1px solid var(--color-warning)',
    },
    danger: {
      background: 'var(--color-danger)',
      color: '#fff',
      border: '1px solid var(--color-danger)',
    },
  }

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px',
        minHeight: '18px',
        padding: '1px 6px',
        borderRadius: '999px',
        fontSize: '10px',
        fontWeight: 700,
        lineHeight: 1,
        ...variantStyles[variant],
      }}
    >
      {children}
    </span>
  )
}
