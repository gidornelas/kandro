import type { PermissionLevel } from '../../types'

interface Props {
  value:    PermissionLevel
  onChange: (level: PermissionLevel) => void
  disabled?: boolean
}

const OPTIONS: { level: PermissionLevel; label: string; color: string }[] = [
  { level: 'none', label: '🚫 Nenhum', color: 'var(--text-3)' },
  { level: 'view', label: '👁 Ver',    color: '#60a5fa' },
  { level: 'edit', label: '✏️ Editar', color: 'var(--green)' },
]

const BG_MAP: Record<string, string> = {
  none: 'rgba(255,255,255,0.08)',
  view: 'rgba(96,165,250,0.18)',
  edit: 'rgba(74,222,128,0.18)',
}

export function PermissionToggle({ value, onChange, disabled }: Props) {
  return (
    <div className="flex border border-[var(--border)] rounded-md overflow-hidden" style={{ opacity: disabled ? 0.4 : 1, pointerEvents: disabled ? 'none' : 'auto' }}>
      {OPTIONS.map((opt, i) => (
        <button
          key={opt.level}
          onClick={() => onChange(opt.level)}
          className="min-h-[44px] px-2.5 text-[11px] font-body border-none cursor-pointer whitespace-nowrap transition-all duration-150"
          style={{
            borderLeft: i > 0 ? '1px solid var(--border)' : 'none',
            background: value === opt.level ? BG_MAP[opt.level] : 'transparent',
            color: value === opt.level ? opt.color : 'var(--text-3)',
            fontWeight: value === opt.level ? 600 : 400,
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}