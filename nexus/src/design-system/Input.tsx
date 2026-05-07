import React from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  iconLeft?: React.ReactNode
  iconRight?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, iconLeft, iconRight, style, onBlur, onFocus, ...props }, ref) => {
    const inputId = React.useId()
    const [focused, setFocused] = React.useState(false)

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
        {label && (
          <label
            htmlFor={inputId}
            style={{
              fontSize: '12px',
              fontWeight: 500,
              color: 'var(--color-text-secondary)',
            }}
          >
            {label}
          </label>
        )}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '0 12px',
            minHeight: '40px',
            borderRadius: '10px',
            background: 'rgba(255,255,255,.78)',
            border: `1px solid ${error ? 'var(--color-danger)' : focused ? 'var(--color-accent)' : 'var(--color-border)'}`,
            boxShadow: focused && !error ? '0 0 0 3px rgba(47,128,237,.12)' : 'none',
            transition: 'border-color .18s ease, box-shadow .18s ease',
          }}
        >
          {iconLeft && <span style={{ color: 'var(--color-text-tertiary)', flexShrink: 0 }}>{iconLeft}</span>}
          <input
            ref={ref}
            id={inputId}
            {...props}
            onFocus={(event) => {
              setFocused(true)
              onFocus?.(event)
            }}
            onBlur={(event) => {
              setFocused(false)
              onBlur?.(event)
            }}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--color-text-primary)',
              fontSize: '14px',
              fontFamily: 'var(--font-body)',
              minWidth: 0,
              ...style,
            }}
          />
          {iconRight && <span style={{ color: 'var(--color-text-tertiary)', flexShrink: 0 }}>{iconRight}</span>}
        </div>
        {error && (
          <span style={{ fontSize: '11px', color: 'var(--color-danger)' }}>{error}</span>
        )}
        {helperText && !error && (
          <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>{helperText}</span>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
