import React from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'

export interface TooltipProps {
  content: React.ReactNode
  children: React.ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
}

export function Tooltip({ content, children, side = 'top', align = 'center' }: TooltipProps) {
  return (
    <TooltipPrimitive.Provider delayDuration={300}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          {children}
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            align={align}
            sideOffset={6}
            style={{
              background: 'var(--color-surface-solid)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: '8px',
              padding: '6px 10px',
              fontSize: '12px',
              color: 'var(--color-text-primary)',
              boxShadow: 'var(--shadow-soft)',
              zIndex: 60,
              maxWidth: '240px',
              lineHeight: 1.4,
            }}
          >
            {content}
            <TooltipPrimitive.Arrow
              style={{
                fill: 'var(--color-surface-solid)',
              }}
              width={8}
              height={4}
            />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  )
}
