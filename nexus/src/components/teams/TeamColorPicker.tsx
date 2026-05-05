import { TEAM_COLORS } from '../../stores/teamsStore'

interface Props {
  value:    string
  onChange: (color: string) => void
}

export function TeamColorPicker({ value, onChange }: Props) {
  return (
    <div className="flex gap-2 flex-wrap">
      {TEAM_COLORS.map(color => (
        <button
          key={color}
          onClick={() => onChange(color)}
          className="rounded-full cursor-pointer transition-all duration-150"
          style={{
            width: 24, height: 24,
            background: color,
            border: value === color ? '3px solid var(--text-1)' : '2px solid transparent',
            outline: value === color ? `2px solid ${color}` : 'none',
            outlineOffset: 2,
          }}
          aria-label={`Cor ${color}`}
        />
      ))}
    </div>
  )
}