import { useEffect, type ReactNode } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { LoginPage } from './LoginPage'

export function AuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, loadFromStorage, isMockMode } = useAuthStore()

  useEffect(() => {
    loadFromStorage()
  }, [loadFromStorage])

  if (isLoading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-[var(--base)]">
        <div className="text-center">
          <div className="w-11 h-11 rounded-[10px] bg-[var(--acc)] flex items-center justify-center text-lg font-bold text-white mx-auto mb-3">
            NX
          </div>
          <div className="text-sm text-[var(--t2)]">Carregando...</div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginPage />
  }

  return (
    <>
      {isMockMode && (
        <div
          className="fixed top-0 left-0 right-0 z-[9999] flex items-center justify-center gap-2 py-1.5 px-4 text-[11px] font-medium"
          style={{
            background: 'color-mix(in srgb, var(--yel) 15%, var(--base))',
            borderBottom: '1px solid color-mix(in srgb, var(--yel) 30%, transparent)',
            color: 'var(--yel)',
          }}
          role="status"
          aria-label="Modo desenvolvimento ativo"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
          Modo Desenvolvimento — Dados simulados (mock auth)
        </div>
      )}
      <div style={isMockMode ? { paddingTop: 28 } : undefined}>
        {children}
      </div>
    </>
  )
}
