import { lazy, Suspense } from 'react'
import './styles/globals.css'
import { Sidebar } from './components/layout/Sidebar'
import { MainArea } from './components/layout/MainArea'
import { AuthGuard } from './components/auth/AuthGuard'
import { ToastContainer } from './components/ui/Toast'
import { TooltipProvider } from './components/ui/tooltip'
import { useUIStore } from './stores/uiStore'
import { useSocketStore } from './stores/socketStore'
import { useAuthStore } from './stores/authStore'
import { useSocketEvents } from './lib/useSocketEvents'
import { useEffect } from 'react'

const TaskModal = lazy(() => import('./components/board/TaskModal'))
const SettingsModal = lazy(() => import('./components/teams/SettingsModal'))
const PermissionModal = lazy(() => import('./components/teams/PermissionModal'))

function ModalFallback() {
  return <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[5000] flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
  </div>
}

export default function App() {
  const { activeModal } = useUIStore()
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  const isMockMode = useAuthStore(s => s.isMockMode)
  const connectSocket = useSocketStore(s => s.connect)
  const disconnectSocket = useSocketStore(s => s.disconnect)
  useSocketEvents()

  useEffect(() => {
    if (isAuthenticated && !isMockMode) {
      connectSocket()
      return
    }

    disconnectSocket()
  }, [connectSocket, disconnectSocket, isAuthenticated, isMockMode])

  return (
    <TooltipProvider>
      <AuthGuard>
        <div role="application" aria-label="NEXUS Workspace" className="flex w-screen h-screen overflow-hidden">
          <a
            href="#main-content"
            className="absolute -top-10 left-0 bg-[var(--accent)] text-white px-3 py-2 z-[9999] rounded-br-lg text-sm font-semibold no-underline transition-[top] duration-200 focus-visible:top-0"
          >
            Pular para conteúdo principal
          </a>
          <Sidebar />
          <main id="main-content" className="flex-1 min-w-0 overflow-hidden">
            <MainArea />
          </main>
          <Suspense fallback={<ModalFallback />}>
            {activeModal === 'taskDetail' && <TaskModal />}
            <SettingsModal />
            <PermissionModal />
          </Suspense>
        </div>
        <ToastContainer />
      </AuthGuard>
    </TooltipProvider>
  )
}
