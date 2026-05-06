export interface SkeletonProps {
  width?: string | number
  height?: string | number
  circle?: boolean
  count?: number
  className?: string
}

export function Skeleton({ width = '100%', height = 16, circle = false, count = 1, className = '' }: SkeletonProps) {
  const items = Array.from({ length: count })
  const w = typeof width === 'number' ? `${width}px` : width
  const h = typeof height === 'number' ? `${height}px` : height

  return (
    <>
      {items.map((_, i) => (
        <div
          key={i}
          className={className}
          style={{
            width: w,
            height: h,
            borderRadius: circle ? '999px' : '10px',
            background: 'rgba(255,255,255,.45)',
            animation: 'pulse 1.5s ease-in-out infinite',
            marginBottom: i < count - 1 ? '8px' : undefined,
          }}
        >
          <style>{`@keyframes pulse { 0%, 100% { opacity: 1 } 50% { opacity: .5 } }`}</style>
        </div>
      ))}
    </>
  )
}
