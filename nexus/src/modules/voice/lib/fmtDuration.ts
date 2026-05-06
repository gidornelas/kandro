export function fmtDuration(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  const fmt = (n: number) => String(n).padStart(2, '0')
  return `${fmt(h)}:${fmt(m)}:${fmt(s)}`
}
