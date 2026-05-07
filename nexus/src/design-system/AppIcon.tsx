import { appIcons } from './app-icon.utils'
import type { AppIconName } from './app-icon.utils'

export function AppIcon({
  name,
  size = 18,
  color = 'currentColor',
}: {
  name: AppIconName
  size?: number
  color?: string
}) {
  const Icon = appIcons[name]
  return <Icon size={size} color={color} aria-hidden="true" />
}
