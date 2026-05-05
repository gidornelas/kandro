import { useState } from 'react'
import { useAuthStore } from '../../stores/authStore'
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

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-[var(--t2)] mb-1.5">Nome</label>
              <input
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
            <label className="block text-xs font-semibold text-[var(--t2)] mb-1.5">Email</label>
            <input
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
            <label className="block text-xs font-semibold text-[var(--t2)] mb-1.5">Senha</label>
            <input
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
