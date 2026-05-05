import { describe, it, expect, beforeEach } from 'vitest'
import { useVoiceStore } from './voiceStore'

beforeEach(() => {
  useVoiceStore.setState({
    active: false,
    layout: 'voice',
    micEnabled: true,
    cameraEnabled: false,
    chatOpen: false,
    activeSpeakerId: '',
    token: null,
    room: null,
    url: null,
    connectionState: 'idle',
    error: null,
    participants: [],
  })
})

describe('voiceStore', () => {
  it('should initialize with default state', () => {
    const state = useVoiceStore.getState()
    expect(state.active).toBe(false)
    expect(state.layout).toBe('voice')
    expect(state.micEnabled).toBe(true)
    expect(state.connectionState).toBe('idle')
  })

  it('should toggle mic', () => {
    useVoiceStore.getState().toggleMic()
    expect(useVoiceStore.getState().micEnabled).toBe(false)
    useVoiceStore.getState().toggleMic()
    expect(useVoiceStore.getState().micEnabled).toBe(true)
  })

  it('should toggle camera', () => {
    useVoiceStore.getState().toggleCamera()
    expect(useVoiceStore.getState().cameraEnabled).toBe(true)
    useVoiceStore.getState().toggleCamera()
    expect(useVoiceStore.getState().cameraEnabled).toBe(false)
  })

  it('should toggle chat', () => {
    useVoiceStore.getState().toggleChat()
    expect(useVoiceStore.getState().chatOpen).toBe(true)
    useVoiceStore.getState().toggleChat()
    expect(useVoiceStore.getState().chatOpen).toBe(false)
  })

  it('should set layout', () => {
    useVoiceStore.getState().setLayout('grid')
    expect(useVoiceStore.getState().layout).toBe('grid')
  })

  it('should set active speaker', () => {
    useVoiceStore.getState().setActiveSpeaker('user-1')
    expect(useVoiceStore.getState().activeSpeakerId).toBe('user-1')
  })

  it('should set participants', () => {
    const participants = [{ userId: 'user-1', muted: false, cameraOn: false, sharing: false }]
    useVoiceStore.getState().setParticipants(participants)
    expect(useVoiceStore.getState().participants).toEqual(participants)
  })

  it('should update participant', () => {
    const participants = [{ userId: 'user-1', muted: false, cameraOn: false, sharing: false }]
    useVoiceStore.getState().setParticipants(participants)
    useVoiceStore.getState().updateParticipant('user-1', { muted: true })
    expect(useVoiceStore.getState().participants[0].muted).toBe(true)
  })

  it('should disconnect and reset state', () => {
    useVoiceStore.setState({
      active: true,
      token: 'token',
      room: 'room',
      participants: [{ userId: 'user-1', muted: false, cameraOn: false, sharing: false }],
    })
    useVoiceStore.getState().disconnect()
    const state = useVoiceStore.getState()
    expect(state.active).toBe(false)
    expect(state.token).toBeNull()
    expect(state.participants).toEqual([])
    expect(state.connectionState).toBe('idle')
  })
})
