import { CHARACTER_IDS } from '../data/characters'
import { LOCATION_IDS } from './config'
import type { CharacterId, ExplorationState, LocationId } from '../types/game'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

export function createInitialExplorationState(): ExplorationState {
  return {
    locationId: null,
    position: null,
    staminaByCharacter: {},
  }
}

export function isExplorationState(value: unknown): value is ExplorationState {
  if (!isRecord(value)) return false

  if (value.locationId !== null && !LOCATION_IDS.includes(value.locationId as LocationId)) return false

  if (value.position !== null) {
    if (!isRecord(value.position) || !isFiniteNumber(value.position.x) || !isFiniteNumber(value.position.y)) {
      return false
    }
  }

  if (!isRecord(value.staminaByCharacter)) return false
  return Object.entries(value.staminaByCharacter).every(
    ([characterId, stamina]) =>
      CHARACTER_IDS.includes(characterId as CharacterId) && isFiniteNumber(stamina) && stamina >= 0,
  )
}
