import { useTeamsStore } from '../../stores/teamsStore'
import { Tooltip } from '../ui/tooltip'

interface Props {
  teamId: string
  size?:  number   // default 10
}

export function TeamBadge({ teamId, size = 10 }: Props) {
  const team = useTeamsStore(s => s.teams.find(t => t.id === teamId))
  if (!team) return null

  const TooltipImpl = Tooltip as unknown as (props: { children: React.ReactNode; content: string }) => JSX.Element
  const tooltipContentInner = `Equipe: ${team.name}`
  return (
    <TooltipImpl content={tooltipContentInner}>
      <div className="rounded-full flex-shrink-0" style={{ width: size, height: size, background: team.color, cursor: 'default' }} />
    </TooltipImpl>
  )
}

// Versão para múltiplas equipes (usada no RightPanel)
interface MultiProps {
  teamIds: string[]
  size?:   number
  max?:    number   // default 3
}

export function TeamBadges({ teamIds, size = 10, max = 3 }: MultiProps) {
  const visible  = teamIds.slice(0, max)
  const overflow = teamIds.length - max

  return (
    <div className="flex items-center gap-1">
      {visible.map(id => <TeamBadge key={id} teamId={id} size={size} />)}
      {overflow > 0 && (
        <span className="text-[10px] text-[var(--text-3)]">+{overflow}</span>
      )}
    </div>
  )
}