import React from 'react'
import { Sidebar } from './Sidebar'
import { MainArea } from './MainArea'
import { SkipLink } from './SkipLink'

const MIN_SIDEBAR = 180
const MAX_SIDEBAR = 400
const DEFAULT_SIDEBAR = 232

export function AppShell() {
  const [sidebarWidth, setSidebarWidth] = React.useState(DEFAULT_SIDEBAR)
  const [isResizing, setIsResizing] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!isResizing) return

    const onMove = (e: MouseEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left

      // Responsividade: em telas pequenas, limita o tamanho máximo da sidebar
      const isSmallScreen = window.innerWidth < 768
      const dynamicMax = isSmallScreen ? Math.min(MAX_SIDEBAR, window.innerWidth - 200) : MAX_SIDEBAR

      setSidebarWidth(Math.min(dynamicMax, Math.max(MIN_SIDEBAR, x)))
    }

    const onUp = () => setIsResizing(false)

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
  }, [isResizing])

  return (
    <>
      <SkipLink />
      <div
        style={{
          height: '100vh',
          padding: '18px',
          display: 'flex',
          overflow: 'hidden',
        }}
      >
        <div
          ref={containerRef}
          style={{
            width: '100%',
            height: 'calc(100vh - 36px)',
            borderRadius: 'var(--radius-xl)',
            background: 'var(--color-app-shell)',
            backdropFilter: 'var(--blur-app)',
            WebkitBackdropFilter: 'var(--blur-app)',
            border: '1px solid var(--color-glass-border)',
            boxShadow: 'var(--shadow-glass), var(--shadow-inset-highlight)',
            display: 'flex',
            overflow: 'hidden',
          }}
        >
          <Sidebar width={sidebarWidth} />
          <div
            onMouseDown={() => setIsResizing(true)}
            style={{
              width: '4px',
              cursor: 'ew-resize',
              flexShrink: 0,
              background: isResizing ? 'var(--color-accent)' : 'transparent',
              transition: 'background .15s',
              zIndex: 10,
            }}
            onMouseEnter={(e) => {
              if (!isResizing) e.currentTarget.style.background = 'var(--color-border)'
            }}
            onMouseLeave={(e) => {
              if (!isResizing) e.currentTarget.style.background = 'transparent'
            }}
          />
          <MainArea />
        </div>
      </div>
    </>
  )
}
