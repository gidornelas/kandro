import { useState, useEffect } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { checkBackendHealth, isDevMode } from '../../lib/dev-mode'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
})

const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
})

type FormErrors = Partial<Record<'email' | 'password' | 'name', string>>

export function LoginPage() {
  const { login, register } = useAuthStore()

  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitError, setSubmitError] = useState('')
  const [loading, setLoading] = useState(false)
  const [backendOffline, setBackendOffline] = useState<boolean | null>(null)

  useEffect(() => {
    if (isDevMode) {
      checkBackendHealth().then(ok => setBackendOffline(!ok))
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setSubmitError('')

    // Validate
    const schema = mode === 'login' ? loginSchema : registerSchema
    const data = mode === 'login' ? { email, password } : { email, password, name }
    const result = schema.safeParse(data)

    if (!result.success) {
      const fieldErrors: FormErrors = {}
      for (const issue of result.error.issues) {
        const key = issue.path[0] as string
        if (key === 'email' || key === 'password' || key === 'name') {
          fieldErrors[key] = issue.message
        }
      }
      setErrors(fieldErrors)
      return
    }

    setLoading(true)
    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        await register(email, password, name)
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao conectar ao servidor'
      setSubmitError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-[var(--base)]">
      <div className="w-[380px] p-8 rounded-[var(--r)] bg-[var(--s1)] border border-[var(--b1)]">
        <div className="text-center mb-7">
          <div className="w-11 h-11 rounded-[10px] bg-[var(--acc)] flex items-center justify-center text-lg font-bold text-white mx-auto mb-3">
            NX
          </div>
          <h1 className="text-lg font-semibold text-[var(--t1)] mb-1">
            {mode === 'login' ? 'Entrar no NEXUS' : 'Criar conta'}
          </h1>
          <p className="text-sm text-[var(--t2)]">
            {mode === 'login' ? 'Entre com suas credenciais' : 'Preencha os dados para se registrar'}
          </p>
        </div>

        {/* Dev mode banner */}
        {isDevMode && backendOffline && (
          <div
            className="mb-4 p-3 rounded-[var(--r-sm)] border text-xs leading-relaxed"
            role="alert"
            style={{
              background: 'color-mix(in srgb, var(--yel) 12%, transparent)',
              borderColor: 'color-mix(in srgb, var(--yel) 30%, transparent)',
              color: 'var(--t1)',
            }}
          >
            <div className="flex items-center gap-1.5 font-semibold mb-1.5" style={{ color: 'var(--yel)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              Modo Desenvolvimento — Backend indisponível
            </div>
            <p className="text-[var(--t2)]">
              O backend não está rodando em <code className="px-1 py-0.5 rounded text-[11px]" style={{ background: 'var(--s3)' }}>localhost:3000</code>.
              Credenciais de teste serão aceitas automaticamente.
            </p>
            <p className="mt-1.5 text-[var(--t3)]">
              Use qualquer email/senha para entrar. Para desativar, adicione{' '}
              <code className="px-1 py-0.5 rounded text-[11px]" style={{ background: 'var(--s3)' }}>VITE_MOCK_AUTH=false</code> no .env
              ou inicie o backend.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === 'register' && (
            <div>
              <label htmlFor="name" className="block text-xs font-semibold text-[var(--t2)] mb-1.5">Nome</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                className="w-full h-10 px-3 rounded-[var(--r-sm)] text-sm text-[var(--t1)] outline-none"
                style={{
                  border: `1px solid ${errors.name ? 'var(--red)' : 'var(--b2)'}`,
                  background: 'var(--s2)',
                }}
              />
              {errors.name && <span className="text-[11px] text-[var(--red)] mt-1 block">{errors.name}</span>}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-[var(--t2)] mb-1.5">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full h-10 px-3 rounded-[var(--r-sm)] text-sm text-[var(--t1)] outline-none"
              style={{
                border: `1px solid ${errors.email ? 'var(--red)' : 'var(--b2)'}`,
                background: 'var(--s2)',
              }}
            />
            {errors.email && <span className="text-[11px] text-[var(--red)] mt-1 block">{errors.email}</span>}
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-[var(--t2)] mb-1.5">Senha</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === 'login' ? 'Sua senha' : 'Mínimo 6 caracteres'}
              className="w-full h-10 px-3 rounded-[var(--r-sm)] text-sm text-[var(--t1)] outline-none"
              style={{
                border: `1px solid ${errors.password ? 'var(--red)' : 'var(--b2)'}`,
                background: 'var(--s2)',
              }}
            />
            {errors.password && <span className="text-[11px] text-[var(--red)] mt-1 block">{errors.password}</span>}
          </div>

          {submitError && (
            <div className="p-2 rounded-[var(--r-sm)] text-xs border border-[var(--red)] text-[var(--red)]" style={{ background: 'color-mix(in srgb, var(--red) 15%, transparent)' }}>
              {submitError}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 rounded-[var(--r-sm)] border-none text-white text-sm font-semibold cursor-pointer disabled:cursor-not-allowed transition-colors duration-150"
            style={{ background: loading ? 'var(--acc-s)' : 'var(--acc)' }}
          >
            {loading
              ? (mode === 'login' ? 'Entrando...' : 'Criando conta...')
              : (mode === 'login' ? 'Entrar' : 'Criar conta')}
          </button>
        </form>

        <div className="text-center mt-5">
          <button
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login')
              setErrors({})
              setSubmitError('')
            }}
            className="bg-transparent border-none text-[var(--acc)] text-xs cursor-pointer"
          >
            {mode === 'login' ? 'Não tem conta? Criar conta' : 'Já tem conta? Fazer login'}
          </button>
        </div>
      </div>
    </div>
  )
}
