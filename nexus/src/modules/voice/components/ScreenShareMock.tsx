
import { AppIcon } from '../../../design-system/AppIcon'

export function ScreenShareMock({ userName }: { userName: string }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#161b2e',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Header */}
      <div
        style={{
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '0 12px',
          background: 'rgba(255,255,255,.06)',
          borderBottom: '1px solid rgba(255,255,255,.08)',
          flexShrink: 0,
        }}
      >
        <span style={{ display: 'inline-flex', color: 'rgba(255,255,255,.72)' }}>
          <AppIcon name="screen" size={12} />
        </span>
        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,.72)', fontWeight: 500 }}>
          Tela compartilhada por {userName}
        </span>
      </div>

      {/* Canvas mock */}
      <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Top toolbar mock */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {['#2f80ed', '#ec5899', '#f5a623', '#35b779'].map((c) => (
            <div key={c} style={{ width: '24px', height: '24px', borderRadius: '6px', background: c, opacity: 0.6 }} />
          ))}
          <div style={{ flex: 1, height: '24px', borderRadius: '6px', background: 'rgba(255,255,255,.08)' }} />
        </div>
        {/* Grid of mock windows */}
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              style={{
                borderRadius: '8px',
                background: `rgba(${40 + i * 15},${50 + i * 10},${70 + i * 12},.5)`,
                border: '1px solid rgba(255,255,255,.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ fontSize: '22px', opacity: 0.3 }}>{['◈', '◇', '○', '□', '△', '☆'][i]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
