import { lazy, Suspense } from 'react'
import { useUIStore } from '../../stores/uiStore'
import { ContextHeader } from './ContextHeader'

const ProjectView = lazy(() => import('../project/ProjectView').then((module) => ({ default: module.ProjectView })))
const ChannelView = lazy(() => import('../channel/ChannelView').then((module) => ({ default: module.ChannelView })))
const DmView = lazy(() => import('../dm/DmView').then((module) => ({ default: module.DmView })))
const VoiceRoom = lazy(() => import('../voice/VoiceRoom'))

function AreaFallback({ dark = false }: { dark?: boolean }) {
  return (
    <div className={`flex-1 flex items-center justify-center text-[var(--t3)] text-sm ${dark ? 'bg-[#090a0c]' : 'bg-[var(--base)]'}`}>
      Carregando view...
    </div>
  )
}

export function MainArea() {
  const { mainMode } = useUIStore()

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0 relative">
      {mainMode !== 'voice' && <ContextHeader />}

      {mainMode === 'project' && (
        <Suspense fallback={<AreaFallback />}>
          <ProjectView />
        </Suspense>
      )}
      {mainMode === 'channel' && (
        <Suspense fallback={<AreaFallback />}>
          <ChannelView />
        </Suspense>
      )}
      {mainMode === 'dm' && (
        <Suspense fallback={<AreaFallback />}>
          <DmView />
        </Suspense>
      )}
      {mainMode === 'voice' && (
        <Suspense fallback={<AreaFallback dark />}>
          <VoiceRoom />
        </Suspense>
      )}
    </div>
  )
}
