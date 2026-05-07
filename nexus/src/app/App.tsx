import React from 'react'
import { AuthGuard } from '../modules/auth/components/AuthGuard'
import { AppShell } from '../layout/AppShell'
import { ToastContainer } from '../design-system/Toast/ToastContainer'
import { useSocketEvents } from '../shared/hooks/useSocketEvents'
import { connectSocket, disconnectSocket } from '../core/socket'
import { useAppDataStore } from '../modules/app-data/store'
import { useAuthStore } from '../modules/auth/store'
import { ThemeBootstrap } from '../modules/settings/ThemeBootstrap'
import { SettingsModal } from '../modules/settings/components/SettingsModal'
import { UrlStateSync } from '../modules/ui/UrlStateSync'

function SocketEvents() {
  useSocketEvents()
  return null
}

function RuntimeBootstrap() {
  const accessToken = useAuthStore((s) => s.accessToken)
  const initializeAppData = useAppDataStore((s) => s.initialize)

  React.useEffect(() => {
    if (!accessToken) return
    connectSocket()
    void initializeAppData()
    return () => disconnectSocket()
  }, [accessToken, initializeAppData])

  return null
}

export default function App() {
  return (
    <AuthGuard>
      <ThemeBootstrap />
      <RuntimeBootstrap />
      <UrlStateSync />
      <SocketEvents />
      <AppShell />
      <SettingsModal />
      <ToastContainer />
    </AuthGuard>
  )
}
