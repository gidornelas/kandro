import { useEffect, useRef, useState } from 'react'

export function useCallTimer(active: boolean) {
  const startRef = useRef<number | null>(null)
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    if (!active) {
      startRef.current = null
      return
    }
    startRef.current = Date.now()
    const id = window.setInterval(() => {
      if (startRef.current) {
        setSeconds(Math.floor((Date.now() - startRef.current) / 1000))
      }
    }, 1000)
    return () => clearInterval(id)
  }, [active])

  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  const fmt = (n: number) => String(n).padStart(2, '0')
  return `${fmt(h)}:${fmt(m)}:${fmt(s)}`
}
