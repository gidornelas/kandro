import React from 'react'
import { useSettingsStore } from './store'
import { applyThemeToDocument, subscribeToSystemTheme } from './theme'

export function ThemeBootstrap() {
  const theme = useSettingsStore((s) => s.appearance.theme)

  React.useEffect(() => {
    applyThemeToDocument(theme)
    if (theme !== 'system') return
    return subscribeToSystemTheme(() => applyThemeToDocument('system'))
  }, [theme])

  return null
}

