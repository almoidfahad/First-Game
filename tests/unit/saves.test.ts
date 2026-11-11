import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '../../src/database/db'
import { createGame } from '../../src/engine/game'
import { SCHEMA_VERSION } from '../../src/engine/config'
import {
  buildRecord,
  deleteSave,
  listSaveSummaries,
  manualSlotIds,
  migrateSave,
  readSave,
  validateGameState,
  writeSave,
} from '../../src/services/saves'
import type { SaveRecord } from '../../src/types/game'

function game() {
  return createGame({
    mode: 'solo',
    difficulty: 'normal',
    players: 1,
    scenarioId: 'conspiracy',
    characterIds: ['detective'],
    seed: 'save-test-seed',
  })
}

describe('save service', () => {
  beforeEach(async () => {
    await db.saves.clear()
  })

  it('writes, lists, reads and deletes a slot', async () => {
    const state = game()
    await writeSave('slot-1', 'Test campaign', state)

    const summaries = await listSaveSummaries()
    expect(summaries).toHaveLength(1)
    expect(summaries[0].id).toBe('slot-1')
    expect(summaries[0].name).toBe('Test campaign')
    expect(summaries[0].round).toBe(state.round)
    expect(summaries[0].players).toBe(1)

    const loaded = await readSave('slot-1')
    expect(loaded.ok).toBe(true)
    expect(loaded.value?.state.scenarioId).toBe('conspiracy')
    expect(loaded.value?.state.players[0].characterId).toBe('detective')

    await deleteSave('slot-1')
    expect(await readSave('slot-1')).toMatchObject({ ok: false })
    expect(await listSaveSummaries()).toHaveLength(0)
  })

  it('exposes five deterministic manual slots', () => {
    expect(manualSlotIds()).toEqual(['slot-1', 'slot-2', 'slot-3', 'slot-4', 'slot-5'])
  })

  it('rejects structurally invalid state instead of loading it', () => {
    const state = game()
    const broken = { ...state, resources: null } as unknown as typeof state
    const result = validateGameState(broken)
    expect(result.ok).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
  })

  it('rejects a save written by a newer schema', async () => {
    const state = game()
    const record = buildRecord('slot-2', 'Future save', state)
    await db.saves.put({ ...record, schemaVersion: SCHEMA_VERSION + 5 } as SaveRecord)
    const loaded = await readSave('slot-2')
    expect(loaded.ok).toBe(false)
  })

  it('loads a V1 save with its gameplay data intact and a default V2 exploration slice', async () => {
    const state = game()
    const record = buildRecord('slot-v1', 'Legacy campaign', state)
    const legacyState = JSON.parse(JSON.stringify(state)) as Record<string, unknown>
    delete legacyState.exploration
    legacyState.schemaVersion = 1
    const legacyRecord = {
      ...record,
      schemaVersion: 1,
      state: legacyState,
    } as unknown as SaveRecord
    await db.saves.put(legacyRecord)

    const loaded = await readSave('slot-v1')
    expect(loaded.ok).toBe(true)
    expect(loaded.value?.schemaVersion).toBe(2)
    expect(loaded.value?.state.schemaVersion).toBe(2)
    expect(loaded.value?.state.exploration).toEqual({
      locationId: null,
      position: null,
      staminaByCharacter: {},
    })
    expect(loaded.value?.state).toMatchObject({
      id: state.id,
      seed: state.seed,
      round: state.round,
      phase: state.phase,
      resources: state.resources,
      players: state.players,
      investigations: state.investigations,
      clueIds: state.clueIds,
      log: state.log,
      eventDeck: state.eventDeck,
      decisionDeck: state.decisionDeck,
      stats: state.stats,
    })
  })

  it('rejects a V2 save with an invalid exploration slice', () => {
    const record = buildRecord('slot-bad-exploration', 'Broken exploration', game())
    const invalid = {
      ...record,
      state: { ...record.state, exploration: { locationId: 'unknown', position: null, staminaByCharacter: {} } },
    } as unknown as SaveRecord
    expect(migrateSave(invalid).ok).toBe(false)
  })

  it('quarantines a corrupt record and reports the failure', async () => {
    await writeSave('slot-3', 'Corrupt me', game())
    const record = await db.saves.get('slot-3')
    expect(record).toBeDefined()
    await db.saves.put({
      ...record!,
      state: { ...record!.state, players: [] },
    } as SaveRecord)

    const loaded = await readSave('slot-3')
    expect(loaded.ok).toBe(false)
    expect(loaded.errors[0]).toMatch(/corrupt/i)

    const quarantined = await db.saves.get('slot-3')
    expect(quarantined?.corrupt).toBe(true)
    // Corrupt saves are excluded from listings so they cannot be loaded by accident.
    expect(await listSaveSummaries()).toHaveLength(0)
  })

  it('round-trips an exported record shape', async () => {
    const state = game()
    const record = buildRecord('slot-4', 'Export', state)
    await db.saves.put(record)
    const loaded = await readSave('slot-4')
    expect(loaded.ok).toBe(true)
    expect(loaded.value?.schemaVersion).toBe(SCHEMA_VERSION)
    expect(loaded.value?.state.id).toBe(state.id)
  })
})
