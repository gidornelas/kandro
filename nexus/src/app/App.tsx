import { AuthGuard } from '../modules/auth/components/AuthGuard'
import { AppShell } from '../layout/AppShell'
import { ToastContainer } from '../design-system/Toast/ToastContainer'
import { useSocketEvents } from '../shared/hooks/useSocketEvents'

function SocketEvents() {
  useSocketEvents()
  return null
}

export default function App() {
  return (
    <AuthGuard>
      <SocketEvents />
      <AppShell />
      <ToastContainer />
    </AuthGuard>
  )
}
