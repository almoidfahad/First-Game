import { beforeEach, describe, expect, it } from 'vitest'
import { migratePersistedSettings, useSettingsStore } from '../../src/store/useSettingsStore'

describe('settings persistence', () => {
  beforeEach(() => {
    window.localStorage.clear()
    useSettingsStore.getState().reset()
    window.localStorage.clear()
  })

  it('migrates the old music-controlled ambience volume to the new ambient setting', async () => {
    window.localStorage.setItem(
      'shadowcity-settings',
      JSON.stringify({ version: 1, state: { musicVolume: 0.22, sfxVolume: 0.4, muted: false } }),
    )

    await useSettingsStore.persist.rehydrate()

    expect(useSettingsStore.getState().musicVolume).toBe(0.22)
    expect(useSettingsStore.getState().ambientVolume).toBe(0.22)
    expect(JSON.parse(window.localStorage.getItem('shadowcity-settings') ?? '{}').version).toBe(2)
  })

  it('persists an independent ambient volume setting', () => {
    useSettingsStore.getState().setAmbientVolume(0.63)

    expect(useSettingsStore.getState().ambientVolume).toBe(0.63)
    const stored = JSON.parse(window.localStorage.getItem('shadowcity-settings') ?? '{}')
    expect(stored.state.ambientVolume).toBe(0.63)
  })

  it('uses the old music volume as a fallback for settings data without an ambient value', () => {
    expect(migratePersistedSettings({ musicVolume: 0.18 }).ambientVolume).toBe(0.18)
    expect(migratePersistedSettings({}).ambientVolume).toBe(0.35)
  })
})
