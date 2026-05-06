import React from 'react'
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'

export interface DropdownItem {
  label: string
  icon?: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  danger?: boolean
}

export interface DropdownMenuProps {
  trigger: React.ReactNode
  items: DropdownItem[]
  align?: 'start' | 'center' | 'end'
}

export function DropdownMenu({ trigger, items, align = 'end' }: DropdownMenuProps) {
  return (
    <DropdownMenuPrimitive.Root>
      <DropdownMenuPrimitive.Trigger asChild>
        {trigger}
      </DropdownMenuPrimitive.Trigger>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          align={align}
          sideOffset={6}
          style={{
            background: 'var(--color-surface-solid)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: '10px',
            padding: '4px',
            boxShadow: 'var(--shadow-modal)',
            zIndex: 60,
            minWidth: '160px',
            animation: 'fadeIn .1s ease',
          }}
        >
          {items.map((item, i) => (
            <DropdownMenuPrimitive.Item
              key={i}
              disabled={item.disabled}
              onSelect={item.onClick}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '7px 10px',
                borderRadius: '8px',
                fontSize: '13px',
                color: item.danger ? 'var(--color-danger)' : 'var(--color-text-primary)',
                cursor: item.disabled ? 'not-allowed' : 'pointer',
                opacity: item.disabled ? 0.5 : 1,
                outline: 'none',
                transition: 'background .15s ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.58)'
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'transparent'
              }}
            >
              {item.icon && <span style={{ flexShrink: 0 }}>{item.icon}</span>}
              <span>{item.label}</span>
            </DropdownMenuPrimitive.Item>
          ))}
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  )
}
