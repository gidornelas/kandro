import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('settings store', () => {
  beforeEach(() => {
    vi.resetModules()
    window.localStorage.clear()
  })

  it('persists theme changes', async () => {
    const { useSettingsStore } = await import('./store')
    useSettingsStore.getState().setTheme('dark')

    expect(useSettingsStore.getState().appearance.theme).toBe('dark')
    expect(window.localStorage.getItem('kandro_app_settings')).toContain('"theme":"dark"')
  })

  it('updates voice and video preferences', async () => {
    const { useSettingsStore } = await import('./store')
    useSettingsStore.getState().updateVoiceVideo({
      preferredMicrophoneId: 'mic-1',
      autoMuteOnJoin: true,
    })

    expect(useSettingsStore.getState().voiceVideo.preferredMicrophoneId).toBe('mic-1')
    expect(useSettingsStore.getState().voiceVideo.autoMuteOnJoin).toBe(true)
  })
})
