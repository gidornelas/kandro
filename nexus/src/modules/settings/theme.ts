import type { ThemeMode } from './types'

const mediaQuery = '(prefers-color-scheme: dark)'

export function resolveTheme(theme: ThemeMode) {
  if (theme !== 'system') return theme
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia(mediaQuery).matches ? 'dark' : 'light'
}

export function applyThemeToDocument(theme: ThemeMode) {
  if (typeof document === 'undefined') return
  const resolvedTheme = resolveTheme(theme)
  document.documentElement.dataset.theme = resolvedTheme
  document.documentElement.style.colorScheme = resolvedTheme
}

export function subscribeToSystemTheme(onChange: () => void) {
  if (typeof window === 'undefined') return () => {}
  const query = window.matchMedia(mediaQuery)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

