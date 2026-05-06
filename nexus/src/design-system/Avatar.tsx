import type { StatusType } from '../shared/types/domain'

export interface AvatarProps {
  name: string
  image?: string | null
  size?: 'sm' | 'md' | 'lg'
  status?: StatusType
  className?: string
}

const sizeMap = {
  sm: { width: 18, fontSize: 7, status: 5 },
  md: { width: 24, fontSize: 9, status: 6 },
  lg: { width: 32, fontSize: 11, status: 8 },
}

function getColorFromName(name: string) {
  const colors = ['#2f80ed', '#35b779', '#ec5899', '#f5a623', '#cc4b4b', '#4ea3d8', '#7c6af7']
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function Avatar({ name, image, size = 'md', status, className = '' }: AvatarProps) {
  const s = sizeMap[size]
  const bgColor = getColorFromName(name)
  const initials = getInitials(name)

  return (
    <div className={className} style={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}>
      <div
        style={{
          width: s.width,
          height: s.width,
          borderRadius: '50%',
          background: image ? undefined : bgColor,
          backgroundImage: image ? `url(${image})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: s.fontSize,
          fontWeight: 700,
          color: '#fff',
          fontFamily: 'var(--font-body)',
        }}
      >
        {!image && initials}
      </div>
      {status && (
        <span
          style={{
            position: 'absolute',
            bottom: -1,
            right: -1,
            width: s.status,
            height: s.status,
            borderRadius: '50%',
            background:
              status === 'online'
                ? 'var(--color-success)'
                : status === 'busy'
                  ? 'var(--color-warning)'
                  : status === 'away'
                    ? 'var(--color-text-tertiary)'
                    : 'var(--color-border)',
            border: `1.5px solid var(--color-surface)`,
          }}
        />
      )}
    </div>
  )
}
