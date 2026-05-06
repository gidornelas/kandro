import React from 'react'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  autoResize?: boolean
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, autoResize, style, onInput, ...props }, ref) => {
    const inputId = React.useId()
    const textareaRef = React.useRef<HTMLTextAreaElement>(null)
    React.useImperativeHandle(ref, () => textareaRef.current!)

    const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
      if (autoResize && textareaRef.current) {
        textareaRef.current.style.height = 'auto'
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
      }
      onInput?.(e)
    }

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
        <textarea
          ref={textareaRef}
          id={inputId}
          {...props}
          onInput={handleInput}
          style={{
            width: '100%',
            minHeight: '60px',
            maxHeight: '200px',
            padding: '10px 12px',
            borderRadius: '10px',
            background: 'rgba(255,255,255,.78)',
            border: `1px solid ${error ? 'var(--color-danger)' : 'var(--color-border)'}`,
            outline: 'none',
            color: 'var(--color-text-primary)',
            fontSize: '13px',
            fontFamily: 'var(--font-body)',
            lineHeight: 1.5,
            resize: autoResize ? 'none' : 'vertical',
            transition: 'border-color .18s ease, box-shadow .18s ease',
            ...style,
          }}
        />
        {error && (
          <span style={{ fontSize: '11px', color: 'var(--color-danger)' }}>{error}</span>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
