import React from 'react'
import { Spinner } from './Spinner'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export function Button({
  variant = 'default',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading

  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: { minHeight: '36px', padding: '0 12px', fontSize: '12px' },
    md: { minHeight: '40px', padding: '0 14px', fontSize: '13px' },
    lg: { minHeight: '44px', padding: '0 18px', fontSize: '14px' },
  }

  const variantStyles: Record<string, React.CSSProperties> = {
    default: {
      background: 'rgba(255,255,255,.52)',
      border: '1px solid var(--color-border)',
      color: 'var(--color-text-secondary)',
    },
    primary: {
      background: 'var(--color-accent)',
      border: '1px solid var(--color-accent)',
      color: '#fff',
      boxShadow: '0 8px 18px rgba(47,128,237,.18)',
    },
    ghost: {
      background: 'transparent',
      border: '1px solid transparent',
      color: 'var(--color-text-secondary)',
    },
    danger: {
      background: 'rgba(204,75,75,.08)',
      border: '1px solid rgba(204,75,75,.18)',
      color: 'var(--color-danger)',
    },
  }

  const hoverStyles: Record<string, React.CSSProperties> = {
    default: { background: 'rgba(255,255,255,.88)', borderColor: 'var(--color-border-accent)', color: 'var(--color-text-primary)' },
    primary: { background: 'var(--color-accent-hover)' },
    ghost: { background: 'rgba(255,255,255,.58)', color: 'var(--color-text-primary)' },
    danger: { background: 'rgba(204,75,75,.2)', color: 'var(--color-danger)' },
  }

  const [hover, setHover] = React.useState(false)

  return (
    <button
      {...props}
      disabled={isDisabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={(e) => {
        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(47,128,237,.5)'
        e.currentTarget.style.outline = 'none'
      }}
      onBlur={(e) => {
        e.currentTarget.style.boxShadow = 'none'
      }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '5px',
        borderRadius: '10px',
        fontFamily: 'var(--font-body)',
        fontWeight: 500,
        lineHeight: 1,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.6 : 1,
        transition: 'background .18s ease, border-color .18s ease, color .18s ease, box-shadow .18s ease, transform .18s ease',
        minWidth: '44px',
        ...sizeStyles[size],
        ...variantStyles[variant],
        ...(hover && !isDisabled ? hoverStyles[variant] : {}),
        ...style,
      }}
    >
      {loading ? <Spinner size={14} /> : leftIcon}
      {children}
      {rightIcon}
    </button>
  )
}
