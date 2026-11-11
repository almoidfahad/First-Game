import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Settings } from '../types/game'

const defaults: Settings = {
  musicVolume: 0.35,
  sfxVolume: 0.5,
  ambientVolume: 0.35,
  muted: false,
  reduceMotion: false,
  highContrast: false,
  language: 'en',
  textScale: 1,
}

export interface SettingsState extends Settings {
  setMusicVolume: (value: number) => void
  setSfxVolume: (value: number) => void
  setAmbientVolume: (value: number) => void
  setMuted: (value: boolean) => void
  setReduceMotion: (value: boolean) => void
  setHighContrast: (value: boolean) => void
  setTextScale: (value: number) => void
  reset: () => void
}

function isVolume(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1
}

/** Preserve the old ambience level, which was controlled by musicVolume in settings v1. */
export function migratePersistedSettings(value: unknown): Partial<SettingsState> {
  const stored = typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Partial<Settings>)
    : {}
  const ambientVolume = isVolume(stored.ambientVolume)
    ? stored.ambientVolume
    : isVolume(stored.musicVolume)
      ? stored.musicVolume
      : defaults.ambientVolume

  return { ...defaults, ...stored, ambientVolume }
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaults,
      setMusicVolume: (musicVolume) => set({ musicVolume }),
      setSfxVolume: (sfxVolume) => set({ sfxVolume }),
      setAmbientVolume: (ambientVolume) => set({ ambientVolume }),
      setMuted: (muted) => set({ muted }),
      setReduceMotion: (reduceMotion) => set({ reduceMotion }),
      setHighContrast: (highContrast) => set({ highContrast }),
      setTextScale: (textScale) => set({ textScale }),
      reset: () => set({ ...defaults }),
    }),
    {
      name: 'shadowcity-settings',
      version: 2,
      migrate: (persistedState) => migratePersistedSettings(persistedState),
    },
  ),
)

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
