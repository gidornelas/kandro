import type { VoiceLayout } from '../../shared/types/domain'

export type ThemeMode = 'light' | 'dark' | 'system'
export type SettingsSection = 'appearance' | 'voice-video' | 'members' | 'teams'

export interface AppearanceSettings {
  theme: ThemeMode
}

export interface VoiceVideoSettings {
  preferredMicrophoneId: string | null
  preferredCameraId: string | null
  preferredSpeakerId: string | null
  autoMuteOnJoin: boolean
  autoCameraOffOnJoin: boolean
  preferredVoiceLayout: VoiceLayout
}

export interface AppSettingsSnapshot {
  appearance: AppearanceSettings
  voiceVideo: VoiceVideoSettings
}
