import React from 'react'
import { useAuthStore } from '../store'
import { Button } from '../../../design-system/Button'
import { Input } from '../../../design-system/Input'
import { Spinner } from '../../../design-system/Spinner'

export function LoginPage() {
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState('')
  const login = useAuthStore((s) => s.login)
  const register = useAuthStore((s) => s.register)
  const isLoading = useAuthStore((s) => s.isLoading)
  const isMockMode = useAuthStore((s) => s.isMockMode)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await login(email, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login')
    }
  }

  const handleRegister = async () => {
    if (!email || !password) return
    setError('')
    try {
      await register(email, password, email.split('@')[0])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cadastrar')
    }
  }

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '18px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '380px',
          padding: '32px',
          borderRadius: 'var(--radius-xl)',
          background: 'var(--color-surface-elevated)',
          backdropFilter: 'var(--blur-card)',
          WebkitBackdropFilter: 'var(--blur-card)',
          border: '1px solid var(--color-glass-border)',
          boxShadow: 'var(--shadow-glass), var(--shadow-inset-highlight)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <h1
            style={{
              fontSize: '22px',
              fontWeight: 800,
              letterSpacing: '-0.025em',
              color: 'var(--color-text-primary)',
              marginBottom: '4px',
            }}
          >
            NEXUS
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--color-text-tertiary)' }}>
            Entre na sua workspace
          </p>
        </div>

        {isMockMode && (
          <div
            style={{
              padding: '8px 12px',
              borderRadius: '10px',
              background: 'var(--color-accent-soft)',
              border: '1px solid var(--color-accent-border)',
              fontSize: '12px',
              color: 'var(--color-accent)',
              textAlign: 'center',
            }}
          >
            Modo de desenvolvimento — backend não detectado
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <p style={{ fontSize: '12px', color: 'var(--color-danger)', margin: 0 }}>
              {error}
            </p>
          )}

          <Button type="submit" variant="primary" loading={isLoading} style={{ width: '100%' }}>
            {isLoading ? <Spinner size={14} /> : 'Entrar'}
          </Button>
        </form>

        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="ghost" size="sm" onClick={handleRegister} style={{ flex: 1 }}>
            Criar conta
          </Button>
        </div>
      </div>
    </div>
  )
}
