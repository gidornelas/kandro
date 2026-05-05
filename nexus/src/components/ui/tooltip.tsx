import * as RadixTooltip from '@radix-ui/react-tooltip'

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <RadixTooltip.Provider delayDuration={300}>{children}</RadixTooltip.Provider>
}

export function Tooltip({
  children,
  content,
}: {
  children: React.ReactNode
  content: string
}) {
  return (
    <RadixTooltip.Root>
      <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content
          side="top"
          align="center"
          sideOffset={4}
          className="z-[9999] px-2 py-1 rounded text-[11px] leading-tight whitespace-nowrap"
          style={{
            background: 'var(--s3)',
            color: 'var(--t1)',
            border: '1px solid var(--b2)',
          }}
        >
          {content}
          <RadixTooltip.Arrow className="fill-[var(--s3)]" />
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  )
}

// Re-export for backward compatibility
// eslint-disable-next-line react-refresh/only-export-components
export const TooltipTrigger = RadixTooltip.Trigger
// eslint-disable-next-line react-refresh/only-export-components
export const TooltipContent = RadixTooltip.Content
// eslint-disable-next-line react-refresh/only-export-components
export const TooltipArrow = RadixTooltip.Arrow
// eslint-disable-next-line react-refresh/only-export-components
export const Root = RadixTooltip.Root
