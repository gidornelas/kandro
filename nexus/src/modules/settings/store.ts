import { create } from 'zustand'
import type { AppSettingsSnapshot, SettingsSection, ThemeMode, VoiceVideoSettings } from './types'

const STORAGE_KEY = 'kandro_app_settings'

function getDefaultSettings(): AppSettingsSnapshot {
  return {
    appearance: {
      theme: 'system',
    },
    voiceVideo: {
      preferredMicrophoneId: null,
      preferredCameraId: null,
      preferredSpeakerId: null,
      autoMuteOnJoin: false,
      autoCameraOffOnJoin: true,
      preferredVoiceLayout: 'voice',
    },
  }
}

function readPersistedSettings() {
  if (typeof window === 'undefined') return getDefaultSettings()
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return getDefaultSettings()
    const parsed = JSON.parse(raw) as Partial<AppSettingsSnapshot>
    return {
      appearance: {
        ...getDefaultSettings().appearance,
        ...parsed.appearance,
      },
      voiceVideo: {
        ...getDefaultSettings().voiceVideo,
        ...parsed.voiceVideo,
      },
    }
  } catch {
    return getDefaultSettings()
  }
}

function persistSettings(settings: AppSettingsSnapshot) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

function toSnapshot(settings: Pick<SettingsState, 'appearance' | 'voiceVideo'>): AppSettingsSnapshot {
  return {
    appearance: settings.appearance,
    voiceVideo: settings.voiceVideo,
  }
}

interface SettingsState extends AppSettingsSnapshot {
  isOpen: boolean
  activeSection: SettingsSection
  openSettings: (section?: SettingsSection) => void
  closeSettings: () => void
  setTheme: (theme: ThemeMode) => void
  updateVoiceVideo: (updates: Partial<VoiceVideoSettings>) => void
}

const initialSettings = readPersistedSettings()

export const useSettingsStore = create<SettingsState>((set) => ({
  ...initialSettings,
  isOpen: false,
  activeSection: 'appearance',

  openSettings: (section = 'appearance') => set({ isOpen: true, activeSection: section }),
  closeSettings: () => set({ isOpen: false }),
  setTheme: (theme) =>
    set((state) => {
      const next = {
        ...state,
        appearance: {
          ...state.appearance,
          theme,
        },
      }
      persistSettings(toSnapshot(next))
      return next
    }),
  updateVoiceVideo: (updates) =>
    set((state) => {
      const next = {
        ...state,
        voiceVideo: {
          ...state.voiceVideo,
          ...updates,
        },
      }
      persistSettings(toSnapshot(next))
      return next
    }),
}))

export function getStoredSettingsSnapshot() {
  return readPersistedSettings()
}
