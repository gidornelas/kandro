const BARS = 4

export function WaveformBars({ active }: { active: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '14px' }}>
      {Array.from({ length: BARS }).map((_, i) => (
        <span
          key={i}
          style={{
            width: '3px',
            borderRadius: '2px',
            background: active ? 'var(--color-success)' : 'var(--color-border-subtle)',
            height: active ? '100%' : '20%',
            display: 'inline-block',
            transition: 'height .12s ease, background .2s',
            animation: active ? `wavebar ${0.5 + i * 0.15}s ease-in-out infinite alternate` : 'none',
          }}
        />
      ))}
      <style>{`
        @keyframes wavebar {
          from { height: 20%; }
          to { height: 100%; }
        }
      `}</style>
    </div>
  )
}
