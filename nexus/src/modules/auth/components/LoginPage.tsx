import React from 'react'
import { Button } from '../../../design-system/Button'
import { Input } from '../../../design-system/Input'
import { Spinner } from '../../../design-system/Spinner'
import { useAuthStore } from '../store'

const PRODUCT_PANELS = [
  {
    title: 'Projetos conectados',
    text: 'Board, timeline, lista e arquivos dentro do mesmo fluxo operacional.',
  },
  {
    title: 'Comunicação contínua',
    text: 'Chat, DMs e voz sempre ao lado do contexto do trabalho em andamento.',
  },
  {
    title: 'Permissões por equipe',
    text: 'Governança granular com ações explícitas por recurso, sem perder fluidez.',
  },
]

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
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
        background: `
          radial-gradient(circle at top left, rgba(47,128,237,.2), transparent 34%),
          radial-gradient(circle at bottom right, rgba(255,121,176,.16), transparent 28%),
          linear-gradient(135deg, #f5f8ff 0%, #eef3fb 52%, #f7f9fc 100%)
        `,
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: `
            linear-gradient(120deg, rgba(255,255,255,.35), rgba(255,255,255,0) 32%),
            radial-gradient(circle at 20% 20%, rgba(255,255,255,.6), transparent 18%),
            radial-gradient(circle at 80% 15%, rgba(47,128,237,.12), transparent 16%),
            radial-gradient(circle at 70% 80%, rgba(255,121,176,.12), transparent 16%)
          `,
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          width: '100%',
          maxWidth: '1080px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '20px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <section
          style={{
            flex: '1 1 420px',
            minHeight: '560px',
            borderRadius: '28px',
            padding: '32px',
            background: 'linear-gradient(160deg, rgba(255,255,255,.44), rgba(255,255,255,.18))',
            backdropFilter: 'blur(22px) saturate(160%)',
            WebkitBackdropFilter: 'blur(22px) saturate(160%)',
            border: '1px solid var(--color-glass-border)',
            boxShadow: 'var(--shadow-glass), var(--shadow-inset-highlight)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '24px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px',
                borderRadius: '999px',
                background: 'rgba(255,255,255,.55)',
                border: '1px solid var(--color-glass-border)',
                width: 'fit-content',
              }}
            >
              <span
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, var(--color-accent), #7db2ff)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: 800,
                }}
              >
                NX
              </span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)', letterSpacing: '.08em' }}>
                NEXUS WORKSPACE
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '540px' }}>
              <h1
                style={{
                  fontSize: 'clamp(34px, 6vw, 56px)',
                  lineHeight: 1,
                  fontWeight: 800,
                  letterSpacing: '-0.05em',
                  color: 'var(--color-text-primary)',
                  margin: 0,
                }}
              >
                Operação, contexto e colaboração no mesmo vidro.
              </h1>
              <p style={{ fontSize: '15px', lineHeight: 1.7, color: 'var(--color-text-secondary)', margin: 0 }}>
                Centralize projetos, canais, boards, arquivos e salas de voz em uma interface leve, viva e preparada para trabalho em tempo real.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            {PRODUCT_PANELS.map((item) => (
              <div
                key={item.title}
                style={{
                  padding: '16px',
                  borderRadius: '18px',
                  background: 'rgba(255,255,255,.42)',
                  border: '1px solid var(--color-glass-border)',
                  boxShadow: '0 12px 30px rgba(31,47,70,.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{item.title}</span>
                <span style={{ fontSize: '12px', lineHeight: 1.6, color: 'var(--color-text-tertiary)' }}>{item.text}</span>
              </div>
            ))}
          </div>
        </section>

        <section
          style={{
            flex: '0 1 400px',
            width: '100%',
            maxWidth: '420px',
            padding: '32px',
            borderRadius: '28px',
            background: 'linear-gradient(180deg, rgba(255,255,255,.72), rgba(255,255,255,.42))',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            border: '1px solid var(--color-glass-border)',
            boxShadow: 'var(--shadow-glass), var(--shadow-inset-highlight)',
            display: 'flex',
            flexDirection: 'column',
            gap: '22px',
            marginLeft: 'auto',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 10px',
                  borderRadius: '999px',
                  background: 'rgba(47,128,237,.08)',
                  border: '1px solid rgba(47,128,237,.14)',
                  color: 'var(--color-accent)',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '.08em',
                }}
              >
                LOGIN SEGURO
              </span>
              <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>Glass UI</span>
            </div>

            <div>
              <h2
                style={{
                  fontSize: '28px',
                  fontWeight: 800,
                  letterSpacing: '-0.04em',
                  color: 'var(--color-text-primary)',
                  margin: '0 0 6px',
                }}
              >
                Entre na sua workspace
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--color-text-tertiary)', lineHeight: 1.6, margin: 0 }}>
                Use seu acesso para retomar projetos, conversas e salas em andamento.
              </p>
            </div>
          </div>

          {isMockMode && (
            <div
              style={{
                padding: '10px 12px',
                borderRadius: '14px',
                background: 'rgba(47,128,237,.08)',
                border: '1px solid rgba(47,128,237,.16)',
                fontSize: '12px',
                color: 'var(--color-accent)',
                lineHeight: 1.5,
              }}
            >
              Modo de desenvolvimento ativo. O app entrou em fallback local porque o backend não foi detectado nesta sessão.
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="voce@empresa.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Senha"
              name="password"
              type="password"
              placeholder="Sua senha"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && (
              <p style={{ fontSize: '12px', color: 'var(--color-danger)', margin: 0 }}>
                {error}
              </p>
            )}

            <Button type="submit" variant="primary" loading={isLoading} style={{ width: '100%', minHeight: '46px', borderRadius: '14px' }}>
              {isLoading ? <Spinner size={14} /> : 'Entrar'}
            </Button>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Button variant="ghost" size="sm" onClick={handleRegister} style={{ width: '100%', minHeight: '42px', borderRadius: '12px' }}>
              Criar conta
            </Button>
            <p style={{ margin: 0, fontSize: '11px', lineHeight: 1.6, color: 'var(--color-text-tertiary)' }}>
              Ao entrar, você acessa sua organização com tema, dispositivos e preferências já persistidos.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
