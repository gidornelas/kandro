import React, { Suspense } from 'react'
import { useUIStore } from '../modules/ui/store'
import { Header } from './Header'
import { Skeleton } from '../design-system/Skeleton'
import { ErrorBoundary } from '../design-system/ErrorBoundary'

const ProjectView = React.lazy(() => import('../modules/projects/components/ProjectView'))
const ChatView = React.lazy(() => import('../modules/channels/components/ChatView'))
const DmView = React.lazy(() => import('../modules/dms/components/DmView'))
const VoiceRoom = React.lazy(() => import('../modules/voice/components/VoiceRoom'))

function ViewLoader() {
  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <Skeleton height={40} />
      <Skeleton height={80} count={3} />
    </div>
  )
}

export function MainArea() {
  const mainMode = useUIStore((s) => s.mainMode)

  return (
    <div
      id="main-content"
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        minWidth: 0,
        position: 'relative',
      }}
    >
      <Header />
      <div style={{ flex: 1, overflow: 'hidden', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <ErrorBoundary>
          <Suspense fallback={<ViewLoader />}>
            {mainMode === 'project' && <ProjectView />}
            {mainMode === 'channel' && <ChatView />}
            {mainMode === 'dm' && <DmView />}
            {mainMode === 'voice' && <VoiceRoom />}
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  )
}
