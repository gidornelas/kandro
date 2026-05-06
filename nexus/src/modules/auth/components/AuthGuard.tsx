import React from 'react'
import { useAuthStore } from '../store'
import { LoginPage } from './LoginPage'
import { Spinner } from '../../../design-system/Spinner'

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isLoading = useAuthStore((s) => s.isLoading)
  const initialize = useAuthStore((s) => s.initialize)

  React.useEffect(() => {
    void initialize()
  }, [initialize])

  if (isLoading) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Spinner size={32} />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginPage />
  }

  return <>{children}</>
}
