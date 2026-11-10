import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Settings } from '../types/game'

const defaults: Settings = {
  musicVolume: 0.35,
  sfxVolume: 0.5,
  muted: false,
  reduceMotion: false,
  highContrast: false,
  language: 'en',
  textScale: 1,
}

export interface SettingsState extends Settings {
  setMusicVolume: (value: number) => void
  setSfxVolume: (value: number) => void
  setMuted: (value: boolean) => void
  setReduceMotion: (value: boolean) => void
  setHighContrast: (value: boolean) => void
  setTextScale: (value: number) => void
  reset: () => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaults,
      setMusicVolume: (musicVolume) => set({ musicVolume }),
      setSfxVolume: (sfxVolume) => set({ sfxVolume }),
      setMuted: (muted) => set({ muted }),
      setReduceMotion: (reduceMotion) => set({ reduceMotion }),
      setHighContrast: (highContrast) => set({ highContrast }),
      setTextScale: (textScale) => set({ textScale }),
      reset: () => set({ ...defaults }),
    }),
    { name: 'shadowcity-settings', version: 1 },
  ),
)

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
