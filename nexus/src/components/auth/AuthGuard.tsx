import { useEffect, type ReactNode } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { LoginPage } from './LoginPage'

export function AuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, loadFromStorage } = useAuthStore()

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

  return <>{children}</>
}
