import { Sidebar } from './Sidebar'
import { MainArea } from './MainArea'
import { SkipLink } from './SkipLink'

export function AppShell() {
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
          <Sidebar />
          <MainArea />
        </div>
      </div>
    </>
  )
}
