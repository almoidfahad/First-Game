import { AUTOSAVE_SLOT, MAX_MANUAL_SLOTS, SCHEMA_VERSION } from '../engine/config'
import { CHARACTER_IDS } from '../data/characters'
import type {
  Difficulty,
  GameMode,
  GameState,
  LocationId,
  Phase,
  SaveRecord,
  SaveSummary,
  ScenarioId,
  ValidationResult,
} from '../types/game'
import { db } from '../database/db'
import { createInitialExplorationState, isExplorationState } from '../engine/exploration'

const PHASES: Phase[] = ['event', 'decision', 'action', 'mystery', 'survival', 'complete']
const MODES: GameMode[] = ['solo', 'local', 'story']
const DIFFICULTIES: Difficulty[] = ['easy', 'normal', 'hard']
const SCENARIOS: ScenarioId[] = ['experiment', 'cyber', 'conspiracy', 'accident']
const LOCATION_IDS: LocationId[] = [
  'hospital',
  'police',
  'power',
  'cityhall',
  'lab',
  'tunnel',
  'mall',
  'water',
  'school',
  'library',
  'radio',
  'house',
]

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

/**
 * Strict structural validation for anything loaded from disk or imported by the
 * player. A malformed save is rejected instead of being partially trusted.
 */
export function validateGameState(input: unknown): ValidationResult<GameState> {
  const errors: string[] = []
  if (!isRecord(input)) return { ok: false, errors: ['Save data is not an object.'] }

  const state = input as unknown as GameState

  if (!isFiniteNumber(state.schemaVersion) || !Number.isInteger(state.schemaVersion) || state.schemaVersion < 1) {
    errors.push('Missing or invalid schema version.')
  }
  else if (state.schemaVersion > SCHEMA_VERSION) errors.push('Save was created by a newer version of the game.')
  if (typeof state.id !== 'string' || state.id.length === 0) errors.push('Missing game id.')
  if (typeof state.seed !== 'string') errors.push('Missing seed.')
  if (!MODES.includes(state.mode)) errors.push('Invalid game mode.')
  if (!DIFFICULTIES.includes(state.difficulty)) errors.push('Invalid difficulty.')
  if (!SCENARIOS.includes(state.scenarioId)) errors.push('Invalid scenario.')
  if (!PHASES.includes(state.phase)) errors.push('Invalid phase.')
  if (!isFiniteNumber(state.round) || state.round < 1 || state.round > 8) errors.push('Round out of range.')

  if (!isRecord(state.resources)) {
    errors.push('Missing resources.')
  } else {
    for (const key of ['food', 'water', 'energy', 'trust'] as const) {
      const value = state.resources[key]
      if (!isFiniteNumber(value) || value < 0) errors.push(`Invalid ${key} value.`)
    }
  }

  if (!isRecord(state.infrastructure)) {
    errors.push('Missing infrastructure.')
  } else {
    for (const id of LOCATION_IDS) {
      const value = state.infrastructure[id]
      if (!isFiniteNumber(value) || value < 0 || value > 3) errors.push(`Invalid integrity for ${id}.`)
    }
  }

  if (!Array.isArray(state.unlocked) || state.unlocked.some((id) => !LOCATION_IDS.includes(id))) {
    errors.push('Invalid unlocked locations.')
  }

  if (!Array.isArray(state.players) || state.players.length < 1 || state.players.length > 4) {
    errors.push('Invalid player list.')
  } else {
    const ids = new Set<string>()
    for (const player of state.players) {
      if (!player || typeof player.id !== 'string' || player.id.length === 0) errors.push('Player missing id.')
      else if (ids.has(player.id)) errors.push(`Duplicate player id ${player.id}.`)
      else ids.add(player.id)
      if (!CHARACTER_IDS.includes(player?.characterId)) errors.push('Player has an unknown character.')
      if (!isFiniteNumber(player?.health) || player.health < 0 || player.health > 100) errors.push('Player health invalid.')
      if (!isFiniteNumber(player?.maxHealth) || player.maxHealth !== 100) errors.push('Player max health invalid.')
      if (!isRecord(player?.inventory)) errors.push('Player inventory invalid.')
    }
  }

  // V1 saves predate exploration and are upgraded before V2 validation.
  if (state.schemaVersion >= 2 && !isExplorationState(state.exploration)) {
    errors.push('Exploration state invalid.')
  }

  if (!isFiniteNumber(state.activePlayer) || state.activePlayer < 0 || state.activePlayer > 3) {
    errors.push('Active player index invalid.')
  }
  if (!isFiniteNumber(state.ap) || state.ap < 0 || state.ap > 9) errors.push('Action points invalid.')
  if (!Array.isArray(state.clueIds) || state.clueIds.some((id) => typeof id !== 'string')) {
    errors.push('Clue list invalid.')
  }
  if (!isRecord(state.investigations)) errors.push('Investigation state invalid.')
  if (!Array.isArray(state.log)) errors.push('Log invalid.')
  if (!Array.isArray(state.eventDeck) || !Array.isArray(state.decisionDeck)) errors.push('Decks invalid.')
  if (!isRecord(state.stats)) errors.push('Stats invalid.')
  if (!isFiniteNumber(state.cursor)) errors.push('Random cursor invalid.')
  if (state.ending !== null && !isRecord(state.ending)) errors.push('Ending invalid.')

  if (errors.length > 0) return { ok: false, errors: errors.slice(0, 6) }
  return { ok: true, value: state, errors: [] }
}

export function validateSaveRecord(input: unknown): ValidationResult<SaveRecord> {
  if (!isRecord(input)) return { ok: false, errors: ['Import is not an object.'] }
  const record = input as unknown as SaveRecord
  const errors: string[] = []
  if (typeof record.id !== 'string' || record.id.length === 0) errors.push('Save id missing.')
  if (typeof record.name !== 'string') errors.push('Save name missing.')
  if (
    !isFiniteNumber(record.schemaVersion) ||
    !Number.isInteger(record.schemaVersion) ||
    record.schemaVersion < 1
  ) {
    errors.push('Save schema version missing or invalid.')
  }
  const stateResult = validateGameState(record.state)
  if (!stateResult.ok) errors.push(...stateResult.errors)
  else if (stateResult.value?.schemaVersion !== record.schemaVersion) {
    errors.push('Save and game state schema versions do not match.')
  }
  if (errors.length > 0) return { ok: false, errors }
  return { ok: true, value: record, errors: [] }
}

/** Forward-compatible migration pipeline. Unknown versions are rejected. */
export function migrateSave(record: SaveRecord): ValidationResult<SaveRecord> {
  const initial = validateSaveRecord(record)
  if (!initial.ok) return initial
  if (record.schemaVersion > SCHEMA_VERSION) {
    return { ok: false, errors: ['This save was created by a newer version of Shadow City.'] }
  }

  let working = initial.value as SaveRecord
  if (working.schemaVersion === 1) {
    working = {
      ...working,
      schemaVersion: 2,
      state: {
        ...working.state,
        schemaVersion: 2,
        exploration: createInitialExplorationState(),
      },
    }
  } else if (working.schemaVersion !== SCHEMA_VERSION) {
    return { ok: false, errors: [`Save schema version ${working.schemaVersion} is not supported.`] }
  }

  return validateSaveRecord(working)
}

export function toSummary(record: SaveRecord): SaveSummary {
  return {
    id: record.id,
    name: record.name,
    round: record.state.round,
    phase: record.state.phase,
    mode: record.state.mode,
    difficulty: record.state.difficulty,
    updatedAt: record.updatedAt,
    scenarioId: record.state.scenarioId,
    players: record.state.players.length,
    characters: record.state.players.map((player) => player.characterId),
  }
}

export function buildRecord(id: string, name: string, state: GameState): SaveRecord {
  return {
    id,
    name,
    schemaVersion: SCHEMA_VERSION,
    createdAt: state.createdAt,
    updatedAt: Date.now(),
    mode: state.mode,
    difficulty: state.difficulty,
    round: state.round,
    phase: state.phase,
    scenarioId: state.scenarioId,
    summary: `${state.players.length} survivor(s) · Round ${state.round} · ${state.difficulty}`,
    state,
  }
}

export async function listSaveSummaries(): Promise<SaveSummary[]> {
  try {
    const records = await db.saves.toArray()
    return records
      .filter((record) => !record.corrupt)
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .map(toSummary)
  } catch {
    return []
  }
}

export async function readSave(id: string): Promise<ValidationResult<SaveRecord>> {
  try {
    const record = await db.saves.get(id)
    if (!record) return { ok: false, errors: ['That save slot is empty.'] }
    const validated = validateSaveRecord(record)
    if (!validated.ok) {
      await quarantine(record, validated.errors)
      return { ok: false, errors: ['Save data is corrupted and was moved to recovery.'] }
    }
    return migrateSave(validated.value as SaveRecord)
  } catch (error) {
    return { ok: false, errors: [error instanceof Error ? error.message : 'Unable to read the save.'] }
  }
}

async function quarantine(record: SaveRecord, errors: string[]): Promise<void> {
  try {
    await db.saves.put({ ...record, corrupt: true, summary: `Corrupted save — ${errors[0] ?? 'validation failed'}` })
  } catch {
    // Recovery is best effort; the load already failed safely.
  }
}

export async function writeSave(id: string, name: string, state: GameState): Promise<void> {
  const record = buildRecord(id, name, state)
  await db.saves.put(record)
}

export async function autosave(state: GameState): Promise<void> {
  const record = buildRecord(AUTOSAVE_SLOT, 'Autosave', state)
  await db.saves.put(record)
}

export async function saveExists(id: string): Promise<boolean> {
  try {
    const record = await db.saves.get(id)
    return Boolean(record && !record.corrupt)
  } catch {
    return false
  }
}

export async function deleteSave(id: string): Promise<void> {
  await db.saves.delete(id)
}

export function manualSlotIds(): string[] {
  return Array.from({ length: MAX_MANUAL_SLOTS }, (_, index) => `slot-${index + 1}`)
}

export function nextFreeSlot(taken: string[]): string {
  return manualSlotIds().find((id) => !taken.includes(id)) ?? 'slot-1'
}

export function exportSaveJson(record: SaveRecord): void {
  const blob = new Blob([JSON.stringify(record, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `shadow-city-${record.id}-round${record.state.round}.json`
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export async function importSaveFile(file: File): Promise<ValidationResult<SaveRecord>> {
  if (file.size > 5 * 1024 * 1024) return { ok: false, errors: ['That file is too large to be a save.'] }
  try {
    const text = await file.text()
    let parsed: unknown
    try {
      parsed = JSON.parse(text)
    } catch {
      return { ok: false, errors: ['That file is not valid JSON.'] }
    }
    const validated = validateSaveRecord(parsed)
    if (!validated.ok) return validated
    const migrated = migrateSave(validated.value as SaveRecord)
    if (!migrated.ok) return migrated
    const record = migrated.value as SaveRecord
    await db.saves.put({ ...record, id: record.id || `import-${Date.now()}` })
    return { ok: true, value: record, errors: [] }
  } catch (error) {
    return { ok: false, errors: [error instanceof Error ? error.message : 'Import failed.'] }
  }
}
