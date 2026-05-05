import { useState } from 'react'
import { z } from 'zod'
import { useAuthStore } from '../../stores/authStore'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
})

interface LoginViewProps {
  onToggle: () => void
}

export function LoginView({ onToggle }: LoginViewProps) {
  const { login, isLoading, error, clearError } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    setFieldErrors({})

    const result = loginSchema.safeParse({ email, password })
    if (!result.success) {
      const errors: Record<string, string> = {}
      for (const issue of result.error.issues) {
        const field = issue.path[0] as string
        errors[field] = issue.message
      }
      setFieldErrors(errors)
      return
    }

    try {
      await login(email, password)
    } catch {
      // Error is already set in store
    }
  }

  return (
    <div style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      width: '100vw', height: '100vh', background: 'var(--bg)',
      fontFamily: 'var(--font-body)',
    }}>
      <form
        onSubmit={handleSubmit}
        style={{
          width: 360, padding: 32, borderRadius: 12,
          background: 'var(--s1)', border: '1px solid var(--b1)',
          display: 'flex', flexDirection: 'column', gap: 16,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'var(--acc)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 18, fontWeight: 700,
            color: '#fff', margin: '0 auto 12px',
          }}>NX</div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--t1)', margin: 0 }}>
            Entrar no NEXUS
          </h1>
          <p style={{ fontSize: 13, color: 'var(--t3)', margin: '4px 0 0' }}>
            Digite suas credenciais para continuar
          </p>
        </div>

        {error && (
          <div style={{
            padding: '8px 12px', borderRadius: 8, background: 'var(--red-bg)',
            color: 'var(--red)', fontSize: 12, fontWeight: 500,
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--t2)' }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{
              height: 38, padding: '0 12px', borderRadius: 8,
              border: `1px solid ${fieldErrors.email ? 'var(--red)' : 'var(--b1)'}`,
              background: 'var(--bg)', color: 'var(--t1)', fontSize: 13,
              outline: 'none',
            }}
          />
          {fieldErrors.email && (
            <span style={{ fontSize: 11, color: 'var(--red)' }}>{fieldErrors.email}</span>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--t2)' }}>
            Senha
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{
              height: 38, padding: '0 12px', borderRadius: 8,
              border: `1px solid ${fieldErrors.password ? 'var(--red)' : 'var(--b1)'}`,
              background: 'var(--bg)', color: 'var(--t1)', fontSize: 13,
              outline: 'none',
            }}
          />
          {fieldErrors.password && (
            <span style={{ fontSize: 11, color: 'var(--red)' }}>{fieldErrors.password}</span>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{
            height: 40, borderRadius: 8, border: 'none',
            background: isLoading ? 'var(--acc-m)' : 'var(--acc)',
            color: '#fff', fontSize: 13, fontWeight: 700, cursor: isLoading ? 'not-allowed' : 'pointer',
          }}
        >
          {isLoading ? 'Entrando...' : 'Entrar'}
        </button>

        <p style={{ fontSize: 12, color: 'var(--t3)', textAlign: 'center', margin: 0 }}>
          Não tem conta?{' '}
          <button
            type="button"
            onClick={onToggle}
            style={{
              background: 'none', border: 'none', color: 'var(--acc)',
              cursor: 'pointer', fontSize: 12, fontWeight: 600, padding: 0,
            }}
          >
            Cadastre-se
          </button>
        </p>
      </form>
    </div>
  )
}
