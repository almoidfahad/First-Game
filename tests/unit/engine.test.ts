import { describe, expect, it } from 'vitest'
import {
  advancePhase,
  checkUnlocks,
  chooseDecision,
  createGame,
  endTurn,
  revealClues,
} from '../../src/engine/game'
import { canPerformAction, performAction } from '../../src/engine/actions'
import { applyEffectsCopy } from '../../src/engine/effects'
import { evaluateEnding } from '../../src/engine/ending'
import { AP_PER_ROUND, MAX_INTEGRITY, RESOURCE_CAPS, SCHEMA_VERSION, TOTAL_ROUNDS } from '../../src/engine/config'
import { CLUE_MAP, getClueIdsForScenario } from '../../src/data/scenarios'
import { DECISION_MAP } from '../../src/data/cards/decisions'
import { LOCATIONS } from '../../src/data/locations'
import type { GameState, LocationId, NewGameConfig, ResourceKey } from '../../src/types/game'

function makeGame(patch: Partial<NewGameConfig> = {}): GameState {
  return createGame({
    mode: 'solo',
    difficulty: 'easy',
    players: 1,
    scenarioId: 'experiment',
    characterIds: ['leader'],
    seed: 'unit-test-seed',
    ...patch,
  })
}

function withFullResources(state: GameState): GameState {
  return {
    ...state,
    resources: { food: 20, water: 20, energy: 12, trust: 10 },
  }
}

/** Advance event → decision → action using a legal option. */
function reachAction(game: GameState): GameState {
  const afterEvent = advancePhase(withFullResources(game))
  expect(afterEvent.ok).toBe(true)
  const deckState = afterEvent.state
  const card = DECISION_MAP[deckState.decision?.cardId ?? '']
  expect(card).toBeDefined()
  const affordable = card.options.find((option) =>
    Object.entries(option.cost ?? {}).every(
      ([key, amount]) => deckState.resources[key as ResourceKey] >= Number(amount),
    ),
  )
  const choice = chooseDecision(deckState, (affordable ?? card.options[0]).id)
  expect(choice.ok, choice.error).toBe(true)
  const afterDecision = advancePhase(choice.state)
  expect(afterDecision.ok).toBe(true)
  expect(afterDecision.state.phase).toBe('action')
  expect(afterDecision.state.ap).toBe(AP_PER_ROUND)
  return afterDecision.state
}

describe('resources', () => {
  it('starts new campaigns at the current save schema with an empty exploration slice', () => {
    const state = makeGame()
    expect(state.schemaVersion).toBe(SCHEMA_VERSION)
    expect(state.exploration).toEqual({ locationId: null, position: null, staminaByCharacter: {} })
  })

  it('clamps gains at the cap and losses at zero', () => {
    const base = makeGame()
    const gained = applyEffectsCopy(base, [{ kind: 'resource', resource: 'food', amount: 999 }], {
      source: 'test',
    })
    expect(gained.resources.food).toBe(RESOURCE_CAPS.food)

    const lost = applyEffectsCopy(base, [{ kind: 'resource', resource: 'water', amount: -999 }], {
      source: 'test',
    })
    expect(lost.resources.water).toBe(0)
  })

  it('clamps health and infrastructure into their legal ranges', () => {
    const base = makeGame()
    const hurt = applyEffectsCopy(
      base,
      [{ kind: 'health', amount: -500 }],
      { playerId: base.players[0].id, source: 'test' },
    )
    expect(hurt.players[0].health).toBe(0)

    const healed = applyEffectsCopy(
      base,
      [{ kind: 'health', amount: 500 }],
      { playerId: base.players[0].id, source: 'test' },
    )
    expect(healed.players[0].health).toBe(healed.players[0].maxHealth)

    const repaired = applyEffectsCopy(
      base,
      [{ kind: 'infrastructure', locationId: 'hospital', amount: 9 }],
      { source: 'test' },
    )
    expect(repaired.infrastructure.hospital).toBe(MAX_INTEGRITY)
  })
})

describe('actions', () => {
  it('refuses actions outside the action phase with a reason', () => {
    const state = makeGame()
    expect(state.phase).toBe('event')
    expect(canPerformAction(state, 'explore', 'hospital')).toMatch(/Action Phase/i)
  })

  it('spends AP and applies a location action exactly once', () => {
    const state = reachAction(makeGame({ characterIds: ['engineer'] }))
    const spot = LOCATIONS.find(
      (location) =>
        state.unlocked.includes(location.id) &&
        location.actions.includes('repair') &&
        location.id !== 'power' &&
        (state.infrastructure[location.id] ?? 0) < MAX_INTEGRITY,
    )
    expect(spot).toBeDefined()

    const before = state.infrastructure[spot!.id]
    const energyBefore = state.resources.energy
    const result = performAction(state, { kind: 'repair', locationId: spot!.id })
    expect(result.ok, result.error).toBe(true)
    expect(result.state.ap).toBe(AP_PER_ROUND - 1)
    // The Engineer restores 2 integrity instead of 1.
    expect(result.state.infrastructure[spot!.id]).toBe(Math.min(MAX_INTEGRITY, before + 2))
    // The Engineer repairs for free.
    expect(result.state.resources.energy).toBe(energyBefore)

    const again = performAction({ ...result.state, ap: 1 }, { kind: 'repair', locationId: spot!.id })
    expect(again.ok).toBe(false)
    expect(again.error).toMatch(/fully repaired/i)
  })

  it('gathers the difficulty amount plus the location bonus', () => {
    const base = reachAction(makeGame({ characterIds: ['leader'] }))
    // Make room under the Food cap so gathering is legal.
    const state = { ...base, resources: { ...base.resources, food: 2 } }
    const spot = LOCATIONS.find(
      (location) => state.unlocked.includes(location.id) && location.actions.includes('gatherFood'),
    )
    expect(spot).toBeDefined()
    const before = state.resources.food
    const result = performAction(state, { kind: 'gatherFood', locationId: spot!.id })
    expect(result.ok, result.error).toBe(true)
    const expected = 3 + (spot!.id === 'mall' ? 1 : 0)
    expect(result.state.resources.food - before).toBe(expected)
  })

  it('rejects a trade between the same resource', () => {
    const state = reachAction(makeGame())
    const spot = LOCATIONS.find(
      (location) => state.unlocked.includes(location.id) && location.actions.includes('trade'),
    )
    expect(spot).toBeDefined()
    const reason = canPerformAction(state, 'trade', spot!.id, {
      trade: { from: 'food', to: 'food' },
    })
    expect(reason).toMatch(/different/i)
  })

  it('refuses sealed locations until they are unlocked', () => {
    const state = reachAction(makeGame())
    const locked = LOCATIONS.find((location) => !state.unlocked.includes(location.id))
    expect(locked).toBeDefined()
    expect(canPerformAction(state, 'explore', locked!.id)).toMatch(/sealed/i)
  })
})

describe('round phases', () => {
  it('walks event → decision → action → mystery → survival → next round', () => {
    const state = reachAction(makeGame())
    expect(state.stats.decisionsMade).toBe(1)
    expect(state.log.some((entry) => entry.text.startsWith('Decision — '))).toBe(true)
    const mystery = advancePhase(state)
    expect(mystery.ok).toBe(true)
    expect(mystery.state.phase).toBe('mystery')
    const foodBefore = mystery.state.resources.food
    const healthBefore = mystery.state.players[0].health

    const survival = advancePhase(mystery.state)
    expect(survival.ok).toBe(true)
    expect(survival.state.phase).toBe('survival')

    const report = survival.state.lastSurvival
    expect(report?.consumed.food).toBe(1)
    expect(report?.round).toBe(1)
    // Survival consumed supplies and applied the easy-mode decay.
    expect(survival.state.resources.food).toBe(foodBefore - 1)
    expect(survival.state.players[0].health).toBe(healthBefore - 2)

    const nextRound = advancePhase(survival.state)
    expect(nextRound.ok).toBe(true)
    expect(nextRound.state.phase).toBe('event')
    expect(nextRound.state.round).toBe(2)
    expect(nextRound.state.eventCardId).not.toBeNull()
  })

  it('never advances past the final round without an ending', () => {
    const state = reachAction(makeGame())
    const lastRound: GameState = { ...state, round: TOTAL_ROUNDS, phase: 'survival' }
    const result = advancePhase(lastRound)
    expect(result.ok).toBe(true)
    expect(result.state.phase).toBe('complete')
    expect(result.state.ending).not.toBeNull()
  })

  it('blocks advancing a decision that has not been resolved', () => {
    const afterEvent = advancePhase(makeGame())
    const result = advancePhase(afterEvent.state)
    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/decision/i)
  })

  it('moves the turn between players before resolving the round', () => {
    const state = reachAction(
      makeGame({ mode: 'local', players: 2, characterIds: ['leader', 'engineer'] }),
    )
    expect(state.players).toHaveLength(2)
    expect(state.activePlayer).toBe(0)

    const firstEnd = endTurn(state)
    expect(firstEnd.ok).toBe(true)
    expect(firstEnd.state.activePlayer).toBe(1)
    expect(firstEnd.state.ap).toBe(AP_PER_ROUND)
    expect(firstEnd.state.phase).toBe('action')

    const secondEnd = endTurn(firstEnd.state)
    expect(secondEnd.ok).toBe(true)
    expect(secondEnd.state.phase).toBe('mystery')
  })
})

describe('mystery and unlocks', () => {
  it('reveals every clue whose threshold is met and unlocks dependent sites', () => {
    const state = withFullResources(makeGame())
    const clues = getClueIdsForScenario(state.scenarioId)
    for (const clueId of clues) {
      state.investigations[CLUE_MAP[clueId].locationId] = 99
    }
    const revealed = revealClues(state)
    expect(revealed).toHaveLength(clues.length)
    expect(state.clueIds).toEqual(expect.arrayContaining(clues))
    expect(state.unlocked).toContain('lab')
    expect(state.stats.cluesFound).toBe(clues.length)
    expect(state.log.some((entry) => entry.text.startsWith('Clue discovered — '))).toBe(true)
  })

  it('does not leak clues from another scenario', () => {
    const state = withFullResources(makeGame({ scenarioId: 'experiment' }))
    const foreign = getClueIdsForScenario('cyber').find(
      (clueId) => !getClueIdsForScenario('experiment').includes(clueId),
    )
    expect(foreign).toBeDefined()
    state.investigations[CLUE_MAP[foreign!].locationId] = 99
    revealClues(state)
    expect(state.clueIds).not.toContain(foreign)
  })

  it('unlocks the lab at one clue and the tunnel later', () => {
    const state = makeGame()
    state.clueIds = ['cl-fusion-log']
    state.round = 2
    checkUnlocks(state)
    expect(state.unlocked).toContain('lab')
    expect(state.unlocked).not.toContain('tunnel')

    state.clueIds = ['cl-fusion-log', 'cl-radiation-burns']
    state.round = 3
    checkUnlocks(state)
    expect(state.unlocked).toContain('tunnel')
  })
})

describe('determinism', () => {
  it('produces identical decks and scenario for the same seed', () => {
    const a = makeGame({ seed: 'same-seed', scenarioId: 'random' })
    const b = makeGame({ seed: 'same-seed', scenarioId: 'random' })
    expect(a.scenarioId).toBe(b.scenarioId)
    expect(a.eventDeck).toEqual(b.eventDeck)
    expect(a.decisionDeck).toEqual(b.decisionDeck)
  })

  it('produces different decks for different seeds', () => {
    const a = makeGame({ seed: 'seed-one' })
    const b = makeGame({ seed: 'seed-two' })
    expect(a.eventDeck).not.toEqual(b.eventDeck)
  })
})

describe('endings', () => {
  const allClues = getClueIdsForScenario('experiment')

  function craft(patch: Partial<GameState>): GameState {
    const base = makeGame({ players: 1, characterIds: ['leader'] })
    const infrastructure = LOCATIONS.reduce(
      (acc, location) => {
        acc[location.id] = 3
        return acc
      },
      {} as Record<LocationId, number>,
    )
    return {
      ...base,
      infrastructure,
      resources: { food: 10, water: 10, energy: 6, trust: 10 },
      clueIds: allClues,
      round: 8,
      phase: 'survival',
      players: base.players.map((player) => ({ ...player, health: 100 })),
      ending: null,
      ...patch,
    }
  }

  it('awards the bright ending for a complete, healthy campaign', () => {
    const ending = evaluateEnding(craft({}))
    expect(ending.key).toBe('bright')
    expect(ending.score).toBeGreaterThanOrEqual(66)
    expect(ending.cluesFound).toBe(3)
    expect(ending.survived).toBe(true)
  })

  it('awards the broken ending when the city survives without the full truth', () => {
    const ending = evaluateEnding(
      craft({
        clueIds: [],
        resources: { food: 4, water: 4, energy: 2, trust: 3 },
        round: 4,
        infrastructure: LOCATIONS.reduce(
          (acc, location) => {
            acc[location.id] = 2
            return acc
          },
          {} as Record<LocationId, number>,
        ),
      }),
    )
    expect(ending.key).toBe('broken')
    expect(ending.score).toBeGreaterThanOrEqual(40)
    expect(ending.survived).toBe(true)
  })

  it('awards the dark ending when nobody is left', () => {
    const state = craft({})
    state.players = state.players.map((player) => ({ ...player, health: 0 }))
    const ending = evaluateEnding(state)
    expect(ending.key).toBe('dark')
    expect(ending.survived).toBe(false)
    expect(ending.score).toBe(0)
  })

  it('requires every survivor alive for the bright ending', () => {
    const base = makeGame({ mode: 'local', players: 2, characterIds: ['leader', 'engineer'] })
    const state: GameState = {
      ...base,
      infrastructure: LOCATIONS.reduce(
        (acc, location) => {
          acc[location.id] = 3
          return acc
        },
        {} as Record<LocationId, number>,
      ),
      resources: { food: 10, water: 10, energy: 6, trust: 10 },
      clueIds: allClues,
      round: 8,
      players: base.players.map((player, index) => ({
        ...player,
        health: index === 1 ? 0 : 100,
      })),
    }
    const ending = evaluateEnding(state)
    expect(ending.key).not.toBe('bright')
  })
})
