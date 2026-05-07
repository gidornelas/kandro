import React from 'react'
import { Button } from '../../../design-system/Button'
import { Input } from '../../../design-system/Input'
import { useAuthStore } from '../store'
import { AppIcon } from '../../../design-system/AppIcon'

type AuthMode = 'login' | 'register'

const LOGIN_PILL_STYLE: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 14px',
  borderRadius: '999px',
  background: 'var(--color-surface-elevated)',
  border: '1px solid var(--color-glass-border)',
  boxShadow: '0 10px 24px rgba(40, 75, 100, 0.08)',
}

function WorkspaceIllustration() {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '360px',
        aspectRatio: '1 / 0.92',
        borderRadius: '28px',
        background: 'linear-gradient(180deg, var(--color-surface-strong), var(--color-surface))',
        border: '1px solid var(--color-glass-border)',
        boxShadow: '0 24px 48px rgba(40, 75, 100, 0.12)',
        overflow: 'hidden',
      }}
    >
      <svg viewBox="0 0 360 332" width="100%" height="100%" aria-hidden="true">
        <defs>
          <linearGradient id="heroBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,.95)" />
            <stop offset="100%" stopColor="rgba(255,255,255,.72)" />
          </linearGradient>
          <linearGradient id="desk" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#dbeaf5" />
            <stop offset="100%" stopColor="#c9dcea" />
          </linearGradient>
          <linearGradient id="accentCard" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2f80ed" />
            <stop offset="100%" stopColor="#77b7ff" />
          </linearGradient>
          <linearGradient id="successCard" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#35b779" />
            <stop offset="100%" stopColor="#7fdfaf" />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width="360" height="332" fill="url(#heroBg)" />
        <circle cx="70" cy="70" r="64" fill="rgba(47,128,237,.08)" />
        <circle cx="298" cy="58" r="48" fill="rgba(53,183,121,.08)" />
        <circle cx="286" cy="254" r="74" fill="rgba(47,128,237,.06)" />

        <rect x="58" y="180" width="244" height="22" rx="11" fill="url(#desk)" />
        <rect x="80" y="202" width="18" height="60" rx="9" fill="#d1dfeb" />
        <rect x="262" y="202" width="18" height="60" rx="9" fill="#d1dfeb" />

        <rect x="112" y="106" width="136" height="74" rx="18" fill="rgba(255,255,255,.78)" stroke="rgba(133,156,183,.22)" />
        <rect x="128" y="122" width="104" height="10" rx="5" fill="rgba(47,128,237,.12)" />
        <rect x="128" y="140" width="74" height="10" rx="5" fill="rgba(93,107,122,.10)" />
        <rect x="128" y="158" width="90" height="8" rx="4" fill="rgba(93,107,122,.08)" />

        <circle cx="180" cy="92" r="24" fill="#ffd9bf" />
        <path d="M156 130c5-20 17-30 24-30s19 10 24 30v20h-48z" fill="#2f80ed" />
        <path d="M140 144c16 12 44 12 80 0l10 36H130z" fill="#253244" opacity=".12" />

        <rect x="44" y="126" width="56" height="42" rx="14" fill="url(#accentCard)" opacity=".96" />
        <rect x="52" y="138" width="24" height="6" rx="3" fill="rgba(255,255,255,.66)" />
        <rect x="52" y="150" width="40" height="6" rx="3" fill="rgba(255,255,255,.88)" />

        <rect x="260" y="120" width="56" height="50" rx="14" fill="url(#successCard)" opacity=".96" />
        <rect x="272" y="134" width="18" height="18" rx="9" fill="rgba(255,255,255,.3)" />
        <path d="M277 143l6 6 9-11" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

        <rect x="76" y="230" width="86" height="48" rx="16" fill="rgba(255,255,255,.74)" stroke="rgba(133,156,183,.18)" />
        <rect x="89" y="244" width="54" height="8" rx="4" fill="rgba(93,107,122,.12)" />
        <rect x="89" y="258" width="36" height="8" rx="4" fill="rgba(47,128,237,.14)" />

        <rect x="198" y="226" width="86" height="52" rx="16" fill="rgba(255,255,255,.74)" stroke="rgba(133,156,183,.18)" />
        <rect x="210" y="240" width="48" height="8" rx="4" fill="rgba(53,183,121,.18)" />
        <rect x="210" y="254" width="60" height="8" rx="4" fill="rgba(93,107,122,.10)" />
      </svg>

      <div
        className="login-floating-pill"
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          ...LOGIN_PILL_STYLE,
          padding: '7px 12px',
        }}
      >
        <AppIcon name="project" size={14} color="var(--color-accent)" />
        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)', letterSpacing: '.08em' }}>PROJECT OPS</span>
      </div>

      <div
        className="login-orb"
        style={{
          position: 'absolute',
          right: '18px',
          top: '94px',
          ...LOGIN_PILL_STYLE,
          padding: '7px 11px',
        }}
      >
        <AppIcon name="chat" size={14} color="var(--color-accent)" />
        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Chat</span>
      </div>

      <div
        className="login-orb"
        style={{
          position: 'absolute',
          left: '26px',
          bottom: '20px',
          right: '26px',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: '10px',
        }}
      >
        {[
          { icon: 'board', label: 'Board' },
          { icon: 'voice', label: 'Voice' },
          { icon: 'folder', label: 'Files' },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              ...LOGIN_PILL_STYLE,
              justifyContent: 'center',
              padding: '10px 8px',
              minHeight: '42px',
            }}
          >
            <AppIcon name={item.icon as 'board' | 'voice' | 'folder'} size={14} color="var(--color-accent)" />
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function LoginPage() {
  const [mode, setMode] = React.useState<AuthMode>('login')
  const [name, setName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [localError, setLocalError] = React.useState('')
  const login = useAuthStore((s) => s.login)
  const register = useAuthStore((s) => s.register)
  const isLoading = useAuthStore((s) => s.isLoading)
  const isMockMode = useAuthStore((s) => s.isMockMode)
  const authError = useAuthStore((s) => s.error)
  const clearError = useAuthStore((s) => s.clearError)
  const isRegister = mode === 'register'
  const error = localError || authError || ''

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    clearError()
    setLocalError('')

    if (isRegister) {
      if (!name.trim()) {
        setLocalError('Informe seu nome para criar a conta.')
        return
      }
      if (password !== confirmPassword) {
        setLocalError('A confirmação de senha não confere.')
        return
      }
      await register(email, password, name.trim())
      return
    }

    await login(email, password)
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        position: 'relative',
        overflow: 'hidden',
        background: `
          radial-gradient(circle at 18% 16%, rgba(47,128,237,.14), transparent 34%),
          radial-gradient(circle at 82% 18%, rgba(53,183,121,.10), transparent 26%),
          radial-gradient(circle at 54% 84%, rgba(123, 193, 255, .14), transparent 28%),
          linear-gradient(135deg, #f2f8fc 0%, #e8f4f8 46%, #eff7fb 100%)
        `,
      }}
    >
      <style>{`
        @keyframes login-fade-up {
          from {
            opacity: 0;
            transform: translateY(18px) scale(.985);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes login-soft-float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }

        @keyframes login-glow-shift {
          0%, 100% {
            opacity: .78;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.04);
          }
        }

        .login-shell::before {
          content: "";
          position: absolute;
          inset: 1px;
          border-radius: 23px;
          pointer-events: none;
          background: linear-gradient(145deg, rgba(255,255,255,.54), rgba(255,255,255,.08));
          opacity: .7;
        }

        .login-hero {
          animation: login-fade-up .68s cubic-bezier(.22,1,.36,1) .08s both;
        }

        .login-panel {
          animation: login-fade-up .68s cubic-bezier(.22,1,.36,1) .16s both;
        }

        .login-orb {
          animation: login-glow-shift 8s ease-in-out infinite;
        }

        .login-floating-pill {
          animation: login-soft-float 6s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .login-shell,
          .login-panel,
          .login-hero,
          .login-orb,
          .login-floating-pill {
            animation: none !important;
          }
        }
      `}</style>
      {/* Decorative elements */}
      <div
        className="login-orb"
        style={{
          position: 'absolute',
          width: '320px',
          height: '320px',
          borderRadius: '50%',
          left: '-80px',
          top: '-60px',
          background: 'rgba(47,128,237,.08)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
        }}
      />
      <div
        className="login-orb"
        style={{
          position: 'absolute',
          width: '240px',
          height: '240px',
          borderRadius: '50%',
          right: '-60px',
          bottom: '-40px',
          background: 'rgba(53,183,121,.08)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      />

      <section
        className="login-shell"
        style={{
          width: '100%',
          maxWidth: '1000px',
          position: 'relative',
          zIndex: 1,
          padding: '22px',
          borderRadius: '24px',
          background: 'linear-gradient(180deg, var(--color-surface-strong), var(--color-surface))',
          backdropFilter: 'blur(26px) saturate(160%)',
          WebkitBackdropFilter: 'blur(26px) saturate(160%)',
          border: '1px solid var(--color-glass-border)',
          boxShadow: '0 28px 68px rgba(40,75,100,.12), inset 0 1px 0 rgba(255,255,255,.94)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '32px',
          alignItems: 'start',
          justifyItems: 'center',
          animation: 'login-fade-up .58s cubic-bezier(.22,1,.36,1)',
        }}
      >
        {/* Left side - Illustration */}
        <div
          className="login-hero"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px',
            padding: '12px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '16px',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, var(--color-accent), #74b5ff)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                fontWeight: 800,
                color: '#fff',
                boxShadow: '0 8px 20px rgba(47,128,237,.2)',
              }}
            >
                K
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span
                style={{
                  fontSize: '20px',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  background: 'linear-gradient(135deg, var(--color-accent), #6f86ff)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  color: 'var(--color-text-primary)',
                }}
              >
                KANDRO
              </span>
              <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-secondary)' }}>
                Collaboration workspace
              </span>
            </div>
          </div>

          <WorkspaceIllustration />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', textAlign: 'center', maxWidth: '340px' }}>
            <span style={LOGIN_PILL_STYLE}>
              <AppIcon name="board" size={14} color="var(--color-accent)" />
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)', letterSpacing: '.08em' }}>PROJECTS, CHAT, VOICE</span>
            </span>
            <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.7, color: 'var(--color-text-secondary)' }}>
              Contexto visual de colaboração, boards e conversas no mesmo painel para abrir o workspace já no clima do produto.
            </p>
          </div>
        </div>

        {/* Right side - Form */}
        <div
          className="login-panel"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            width: '100%',
            padding: '8px',
          }}
        >
          {/* Mode toggle */}
          <div
            style={{
              display: 'flex',
              gap: '6px',
              padding: '6px',
              borderRadius: '10px',
              background: 'var(--color-surface-elevated)',
              border: '1px solid var(--color-border-subtle)',
            }}
          >
            <button
              type="button"
              onClick={() => {
                setMode('login')
                setLocalError('')
                clearError()
              }}
              aria-pressed={!isRegister}
              style={{
                flex: 1,
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid transparent',
                background: !isRegister ? 'var(--color-accent)' : 'transparent',
                color: !isRegister ? '#fff' : 'var(--color-text-secondary)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all .15s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <AppIcon name="dm" size={16} />
              Entrar
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register')
                setLocalError('')
                clearError()
              }}
              aria-pressed={isRegister}
              style={{
                flex: 1,
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid transparent',
                background: isRegister ? 'var(--color-accent)' : 'transparent',
                color: isRegister ? '#fff' : 'var(--color-text-secondary)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all .15s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <AppIcon name="plus" size={16} />
              Criar conta
            </button>
          </div>

          {/* Welcome text */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <h1
              style={{
                margin: 0,
                fontSize: 'clamp(24px, 4vw, 30px)',
                fontWeight: 800,
                color: 'var(--color-text-primary)',
                letterSpacing: '-0.03em',
                textWrap: 'balance',
              }}
            >
              {isRegister ? 'Crie sua conta' : 'Bem-vindo de volta'}
            </h1>
            <p
              style={{
                margin: 0,
                fontSize: '13px',
                lineHeight: 1.7,
                color: 'var(--color-text-secondary)',
                maxWidth: '46ch',
              }}
            >
              {isRegister
                ? 'Crie sua conta para entrar em projetos, canais e salas de voz do Kandro.'
                : 'Acesse sua área de trabalho com uma interface translúcida, limpa e pronta para colaboração.'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {isRegister && (
              <Input
                label="Nome"
                name="name"
                type="text"
                placeholder="Como você quer aparecer"
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                helperText="Será exibido nos comentários e atividades"
              />
            )}

            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="voce@empresa.com"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              helperText={isRegister ? 'Usaremos para entrar em contato' : 'Seu email de acesso'}
            />

            <Input
              label="Senha"
              name="password"
              type="password"
              placeholder="••••••••"
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />

            {isRegister && (
              <Input
                label="Confirmar senha"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
              />
            )}

            {error && (
              <div
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  background: 'var(--color-danger-soft)',
                  border: '1px solid var(--color-danger-border)',
                  color: 'var(--color-danger)',
                  fontSize: '13px',
                  lineHeight: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <AppIcon name="warning" size={14} />
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              loading={isLoading}
              style={{
                width: '100%',
                minHeight: '48px',
                fontSize: '14px',
                fontWeight: 700,
                borderRadius: '16px',
                boxShadow: '0 14px 28px rgba(47,128,237,.18)',
              }}
            >
              {isRegister ? 'Criar conta' : 'Entrar no workspace'}
            </Button>
          </form>

          {/* Auxiliary access */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', height: '20px' }}>
              <span style={{ flex: 1, height: '1px', background: 'var(--color-border-subtle)' }} />
              <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', fontWeight: 500 }}>
                acesso do workspace
              </span>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <Button
                type="button"
                variant="default"
                disabled
                style={{
                  flex: 1,
                  minHeight: '40px',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontSize: '13px',
                  fontWeight: 500,
                }}
              >
                <AppIcon name="settings" size={16} />
                SSO em breve
              </Button>
              <Button
                type="button"
                variant="default"
                disabled
                style={{
                  flex: 1,
                  minHeight: '40px',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontSize: '13px',
                  fontWeight: 500,
                }}
              >
                <AppIcon name="lock" size={16} />
                Convite privado
              </Button>
            </div>
          </div>

          {/* Terms */}
          {isRegister && (
            <div
              style={{
                display: 'flex',
                gap: '6px',
                alignItems: 'flex-start',
                justifyContent: 'center',
                fontSize: '12px',
                color: 'var(--color-text-tertiary)',
              }}
            >
              <input type="checkbox" required id="terms" style={{ width: '16px', height: '16px', accentColor: 'var(--color-accent)' }} />
              <label htmlFor="terms" style={{ cursor: 'pointer', lineHeight: 1.5 }}>
                Li e concordo com os{' '}
                <a
                  href="#"
                  style={{
                    color: 'var(--color-accent)',
                    textDecoration: 'none',
                    fontWeight: 500,
                  }}
                >
                  Termos de Serviço
                </a>
                {' e '}
                <a
                  href="#"
                  style={{
                    color: 'var(--color-accent)',
                    textDecoration: 'none',
                    fontWeight: 500,
                  }}
                >
                  Política de Privacidade
                </a>
              </label>
            </div>
          )}

          {/* Footer link */}
          {isRegister && (
            <p
              style={{
                margin: '0',
                fontSize: '13px',
                color: 'var(--color-text-secondary)',
                textAlign: 'center',
                lineHeight: 1.6,
              }}
            >
              Já tem conta?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login')
                  setLocalError('')
                  clearError()
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: 'var(--color-accent)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Entre aqui
              </button>
            </p>
          )}
        </div>
      </section>

      {/* Mock mode warning */}
      {isMockMode && (
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            padding: '12px 16px',
            borderRadius: '10px',
            background: 'rgba(47,128,237,.08)',
            border: '1px solid rgba(47,128,237,.16)',
            color: 'var(--color-accent)',
            fontSize: '12px',
            fontWeight: 500,
            boxShadow: '0 8px 24px rgba(0,0,0,.12)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backdropFilter: 'blur(8px)',
          }}
        >
          <AppIcon name="warning" size={16} />
          Modo de desenvolvimento ativo. Se o backend não responder, o Kandro usa fallback local nesta sessão.
        </div>
      )}
    </div>
  )
}
