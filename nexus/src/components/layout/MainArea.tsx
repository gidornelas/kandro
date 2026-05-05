import { lazy, Suspense } from 'react'
import { useUIStore } from '../../stores/uiStore'
import { ContextHeader } from './ContextHeader'
import { ProjectView } from '../project/ProjectView'
import { ChannelView } from '../channel/ChannelView'
import { DmView } from '../dm/DmView'

const VoiceRoom = lazy(() => import('../voice/VoiceRoom'))

function VoiceFallback() {
  return (
    <div className="flex-1 flex items-center justify-center bg-[#090a0c] text-[var(--t3)] text-sm">
      Carregando sala de voz...
    </div>
  )
}

export function MainArea() {
  const { mainMode } = useUIStore()

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0 relative">
      {mainMode !== 'voice' && <ContextHeader />}

      {mainMode === 'project' && <ProjectView />}
      {mainMode === 'channel' && <ChannelView />}
      {mainMode === 'dm' && <DmView />}
      {mainMode === 'voice' && (
        <Suspense fallback={<VoiceFallback />}>
          <VoiceRoom />
        </Suspense>
      )}
    </div>
  )
}
