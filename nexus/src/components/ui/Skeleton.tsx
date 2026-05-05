export function Skeleton() {
  return (
    <div aria-busy="true" aria-label="Carregando..." className="flex items-center gap-3 px-4 py-3 animate-pulse">
      <div className="w-8 h-8 rounded-full bg-[var(--s3)] flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-24 bg-[var(--s3)] rounded" />
        <div className="h-3 w-48 bg-[var(--s3)] rounded" />
      </div>
    </div>
  )
}

export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} />
      ))}
    </>
  )
}
