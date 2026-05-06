import { describe, it, expect } from 'vitest'
import { useVoiceStore } from './store'

describe('voice store', () => {
  it('toggles mic', () => {
    const initial = useVoiceStore.getState().micEnabled
    useVoiceStore.getState().toggleMic()
    expect(useVoiceStore.getState().micEnabled).toBe(!initial)
  })

  it('toggles camera', () => {
    const initial = useVoiceStore.getState().cameraEnabled
    useVoiceStore.getState().toggleCamera()
    expect(useVoiceStore.getState().cameraEnabled).toBe(!initial)
  })

  it('updates participant', () => {
    useVoiceStore.getState().updateParticipant('rc', { muted: true })
    const p = useVoiceStore.getState().participants.find((x) => x.userId === 'rc')
    expect(p?.muted).toBe(true)
  })
})
