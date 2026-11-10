import Dexie, { type Table } from 'dexie'
import type { SaveRecord } from '../types/game'

export interface SettingsRecord {
  id: string
  value: unknown
}

/**
 * Local-first storage. Everything the game needs lives in IndexedDB, so the app
 * keeps running with the network disabled and with no backend at all.
 */
export class ShadowCityDatabase extends Dexie {
  saves!: Table<SaveRecord, string>
  settings!: Table<SettingsRecord, string>

  constructor() {
    super('shadowcity')
    this.version(1).stores({
      saves: 'id, updatedAt, mode, round',
      settings: 'id',
    })
  }
}

export const db = new ShadowCityDatabase()

export async function databaseAvailable(): Promise<boolean> {
  try {
    await db.open()
    return true
  } catch {
    return false
  }
}
