export interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        padding: '32px',
        textAlign: 'center',
      }}
    >
      {icon && (
        <div style={{ fontSize: '32px', lineHeight: 1, opacity: 0.6 }}>
          {icon}
        </div>
      )}
      <div>
        <p
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            marginBottom: description ? '4px' : 0,
          }}
        >
          {title}
        </p>
        {description && (
          <p style={{ fontSize: '13px', color: 'var(--color-text-tertiary)' }}>
            {description}
          </p>
        )}
      </div>
      {action && <div style={{ marginTop: '4px' }}>{action}</div>}
    </div>
  )
}
