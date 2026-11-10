import { EVENT_CARDS } from '../data/cards/events'
import { DECISION_CARDS, getDecisionOption } from '../data/cards/decisions'
import { CHARACTER_MISSION, MISSION_MAP } from '../data/cards/missions'
import { ITEM_MAP } from '../data/cards/items'
import { CHARACTER_IDS, getCharacter } from '../data/characters'
import { DEFAULT_UNLOCKED, DIFFICULTY_SETTINGS, LOCATION_IDS, MAX_HEALTH, TOTAL_ROUNDS } from './config'
import { LOCATION_MAP } from '../data/locations'
import { CLUE_MAP, SCENARIOS, getClueIdsForScenario, getScenario } from '../data/scenarios'
import type {
  DecisionOption,
  EndingResult,
  GameState,
  NewGameConfig,
  Player,
  ResourceKey,
  ScenarioId,
  SurvivalReport,
} from '../types/game'
import { addLog, clamp, cloneState } from './helpers'
import { applyEffects, getAbility } from './effects'
import { performAction } from './actions'
import type { ActionRequest } from './actions'
import { evaluateEnding } from './ending'
import { hashSeed, rollInt, shuffleSeeded } from './rng'
import { AP_PER_ROUND, MAX_INTEGRITY, RESOURCE_CAPS } from './config'
import { addResource } from './effects'

export interface EngineResult {
  ok: boolean
  state: GameState
  error?: string
}

function makeSeed(seed?: string): string {
  if (seed && seed.trim().length > 0) return seed.trim()
  const cryptoObj = globalThis.crypto as Crypto | undefined
  if (cryptoObj?.randomUUID) return cryptoObj.randomUUID()
  return `seed-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`
}

function createPlayer(seat: number, characterId: string): Player {
  const character = getCharacter(characterId as Player['characterId'])
  return {
    id: character.title.replace(/^The\s+/, ''),
    seat,
    characterId: character.id,
    health: MAX_HEALTH,
    maxHealth: MAX_HEALTH,
    missionId: CHARACTER_MISSION[character.id] ?? 'ms-rally',
    missionProgress: 0,
    missionComplete: false,
    missionRevealed: false,
    inventory: {},
  }
}

export function createGame(config: NewGameConfig): GameState {
  const playersCount = clamp(config.players, 1, 4)
  const seed = makeSeed(config.seed)
  const difficulty = DIFFICULTY_SETTINGS[config.difficulty]
  const playerSeed = hashSeed(seed)

  const scenarioId: ScenarioId =
    config.scenarioId === 'random'
      ? (SCENARIOS[rollInt(playerSeed, SCENARIOS.length)]?.id ?? 'experiment')
      : config.scenarioId

  const chosen = config.characterIds.slice(0, playersCount)
  while (chosen.length < playersCount) {
    const next = CHARACTER_IDS.find((id) => !chosen.includes(id))
    if (!next) break
    chosen.push(next)
  }

  const eventShuffle = shuffleSeeded(
    EVENT_CARDS.map((card) => card.id),
    playerSeed + 1,
  )
  const decisionShuffle = shuffleSeeded(
    DECISION_CARDS.map((card) => card.id),
    eventShuffle.cursor + 7,
  )

  const infrastructure = LOCATION_IDS.reduce(
    (acc, id) => {
      acc[id] = 2
      return acc
    },
    {} as Record<(typeof LOCATION_IDS)[number], number>,
  )

  const investigations = LOCATION_IDS.reduce(
    (acc, id) => {
      acc[id] = 0
      return acc
    },
    {} as Record<(typeof LOCATION_IDS)[number], number>,
  )

  const players = chosen.map((characterId, index) => createPlayer(index, characterId))

  const state: GameState = {
    schemaVersion: 1,
    id: seed,
    seed,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    mode: config.mode,
    difficulty: config.difficulty,
    scenarioId,
    round: 1,
    phase: 'event',
    resources: { ...difficulty.start },
    infrastructure: { ...infrastructure },
    unlocked: [...DEFAULT_UNLOCKED],
    players,
    activePlayer: 0,
    ap: 0,
    eventCardId: null,
    decision: null,
    investigations: { ...investigations },
    clueIds: [],
    log: [],
    eventDeck: eventShuffle.items,
    decisionDeck: decisionShuffle.items,
    stats: {
      actionsUsed: 0,
      foodGathered: 0,
      waterGathered: 0,
      repairs: 0,
      investigations: 0,
      helps: 0,
      trades: 0,
      missionsCompleted: 0,
      decisionsMade: 0,
      cluesFound: 0,
    },
    cursor: decisionShuffle.cursor + 13,
    lastSurvival: null,
    ending: null,
    selectedLocation: null,
    phaseNotes: [],
  }

  addLog(state, `Campaign "${getScenario(scenarioId).codename}" begins. ${difficulty.label} difficulty.`, 'system')
  addLog(state, 'The city goes dark at 02:14. Eight rounds until dawn.', 'mystery')
  checkUnlocks(state)
  drawEvent(state)
  return state
}

function setPhase(state: GameState, phase: GameState['phase']): void {
  state.phase = phase
  state.phaseNotes = []
}

export function drawEvent(state: GameState): void {
  const index = (state.round - 1) % state.eventDeck.length
  const cardId = state.eventDeck[index]
  const card = EVENT_CARDS.find((entry) => entry.id === cardId) ?? EVENT_CARDS[0]
  state.eventCardId = card.id
  addLog(state, `Event — ${card.title}`, card.alert === 'critical' ? 'bad' : 'info')
  applyEffects(state, card.effects, {
    playerId: state.players[state.activePlayer]?.id,
    source: card.title,
  })
}

function drawDecision(state: GameState): void {
  const index = (state.round - 1) % state.decisionDeck.length
  const cardId = state.decisionDeck[index]
  const card = DECISION_CARDS.find((entry) => entry.id === cardId)
  if (!card) return
  state.decision = { cardId: card.id, chosen: null, resolved: false }
  addLog(state, `Decision — ${card.title}`, 'info')
}

export function checkUnlocks(state: GameState): void {
  for (const id of LOCATION_IDS) {
    if (state.unlocked.includes(id)) continue
    const location = LOCATION_MAP[id]
    const cluesNeeded = location.unlock.clues ?? 0
    const roundNeeded = location.unlock.round ?? 1
    if (state.clueIds.length >= cluesNeeded && state.round >= roundNeeded) {
      state.unlocked.push(id)
      addLog(state, `${location.name} is now accessible.`, 'good')
    }
  }
}

export function scenarioClueThreshold(state: GameState, clueId: string): number {
  const clue = CLUE_MAP[clueId]
  if (!clue) return Infinity
  const bonus = DIFFICULTY_SETTINGS[state.difficulty].clueThresholdBonus
  return Math.max(1, clue.threshold + bonus)
}

/** Reveal every clue whose investigation requirement is now met. */
export function revealClues(state: GameState): string[] {
  const revealed: string[] = []
  for (const clueId of getClueIdsForScenario(state.scenarioId)) {
    if (state.clueIds.includes(clueId)) continue
    const clue = CLUE_MAP[clueId]
    if (!clue) continue
    const threshold = scenarioClueThreshold(state, clueId)
    if ((state.investigations[clue.locationId] ?? 0) >= threshold) {
      state.clueIds.push(clueId)
      state.stats.cluesFound = state.clueIds.length
      revealed.push(clueId)
      addLog(state, `Clue discovered — ${clue.title}`, 'mystery')
      for (const player of state.players) {
        if (!player.missionId || player.missionComplete) continue
        const mission = MISSION_MAP[player.missionId]
        if (mission?.objective.kind === 'clue') {
          player.missionProgress = clamp(player.missionProgress + 1, 0, mission.objective.target)
          if (player.missionProgress >= mission.objective.target && !player.missionComplete) {
            player.missionComplete = true
            state.stats.missionsCompleted += 1
            addLog(state, `${player.id} completed secret mission "${mission.title}".`, 'good')
            applyEffects(state, mission.reward, { playerId: player.id, source: mission.title })
          }
        }
      }
      checkUnlocks(state)
    }
  }
  return revealed
}

export function resolveSurvival(state: GameState): SurvivalReport {
  const consumption = DIFFICULTY_SETTINGS[state.difficulty].consumption
  const shortfalls = {
    food: Math.max(0, consumption.food - state.resources.food),
    water: Math.max(0, consumption.water - state.resources.water),
    energy: Math.max(0, consumption.energy - state.resources.energy),
  }
  const consumed = {
    food: Math.min(consumption.food, state.resources.food),
    water: Math.min(consumption.water, state.resources.water),
    energy: Math.min(consumption.energy, state.resources.energy),
  }

  state.resources.food -= consumed.food
  state.resources.water -= consumed.water
  state.resources.energy -= consumed.energy

  const healthDelta: Record<string, number> = {}
  const starved = shortfalls.food > 0 || shortfalls.water > 0
  const decay = DIFFICULTY_SETTINGS[state.difficulty].healthDecay

  for (const player of state.players) {
    const mods = getAbility(player)
    const before = player.health
    if (player.health > 0) {
      let delta = -decay + mods.survivalHeal
      if (starved) delta -= Math.max(0, 5 - mods.damageReduction)
      player.health = clamp(player.health + delta, 0, player.maxHealth)
    }
    healthDelta[player.id] = player.health - before
  }

  let trustDelta = 0
  if (shortfalls.food > 0) trustDelta -= 1
  if (shortfalls.water > 0) trustDelta -= 1
  if (shortfalls.energy > 0) trustDelta -= 1
  const beforeTrust = state.resources.trust
  addResource(state, 'trust', trustDelta)
  trustDelta = state.resources.trust - beforeTrust

  const infrastructureLost: SurvivalReport['infrastructureLost'] = []
  if (shortfalls.energy > 0) {
    const candidate = (['power', ...state.unlocked] as const).find((id) => (state.infrastructure[id] ?? 0) > 0)
    if (candidate) {
      state.infrastructure[candidate] = clamp((state.infrastructure[candidate] ?? 0) - 1, 0, MAX_INTEGRITY)
      infrastructureLost.push(candidate)
    }
  }

  const collapsed = state.players.every((player) => player.health <= 0) || state.resources.trust <= 0

  const report: SurvivalReport = {
    round: state.round,
    consumed,
    shortfalls,
    healthDelta,
    infrastructureLost,
    trustDelta,
    collapsed,
  }
  state.lastSurvival = report

  const summaryParts = [
    `Consumed ${consumed.food} Food, ${consumed.water} Water, ${consumed.energy} Energy.`,
  ]
  if (shortfalls.food > 0 || shortfalls.water > 0) summaryParts.push('Ration shortfall — health and trust suffered.')
  if (shortfalls.energy > 0) summaryParts.push('Energy shortfall — infrastructure degraded.')
  if (!shortfalls.food && !shortfalls.water && !shortfalls.energy) summaryParts.push('All needs met.')
  state.phaseNotes = summaryParts

  addLog(state, `Survival — ${summaryParts.join(' ')}`, starved ? 'bad' : 'good')

  if (collapsed) {
    addLog(state, 'The last light goes out.', 'bad')
    state.ending = evaluateEnding(state)
    setPhase(state, 'complete')
  }

  return report
}

export function advancePhase(state: GameState): EngineResult {
  if (state.phase === 'complete') return { ok: false, state, error: 'The campaign is already over.' }
  const draft = cloneState(state)

  switch (draft.phase) {
    case 'event': {
      drawDecision(draft)
      setPhase(draft, 'decision')
      break
    }
    case 'decision': {
      if (!draft.decision?.resolved) return { ok: false, state, error: 'Choose a decision first.' }
      setPhase(draft, 'action')
      draft.activePlayer = 0
      draft.ap = AP_PER_ROUND
      break
    }
    case 'action': {
      setPhase(draft, 'mystery')
      const revealed = revealClues(draft)
      draft.phaseNotes =
        revealed.length > 0
          ? revealed.map((id) => `Clue revealed: ${CLUE_MAP[id]?.title ?? id}`)
          : ['No new evidence surfaced this round. Investigate more locations.']
      break
    }
    case 'mystery': {
      setPhase(draft, 'survival')
      resolveSurvival(draft)
      break
    }
    case 'survival': {
      if (draft.ending) {
        setPhase(draft, 'complete')
        break
      }
      if (draft.round >= TOTAL_ROUNDS) {
        draft.ending = evaluateEnding(draft)
        setPhase(draft, 'complete')
        break
      }
      draft.round += 1
      draft.decision = null
      draft.activePlayer = 0
      draft.ap = 0
      setPhase(draft, 'event')
      checkUnlocks(draft)
      drawEvent(draft)
      break
    }
    default:
      break
  }

  draft.updatedAt = Date.now()
  return { ok: true, state: draft }
}

export function chooseDecision(state: GameState, optionId: string): EngineResult {
  if (state.phase !== 'decision') return { ok: false, state, error: 'Not in the Decision Phase.' }
  if (!state.decision) return { ok: false, state, error: 'No decision is active.' }
  if (state.decision.resolved) return { ok: false, state, error: 'This decision is already resolved.' }

  const card = DECISION_CARDS.find((entry) => entry.id === state.decision?.cardId)
  const option: DecisionOption | undefined = card?.options.find((entry) => entry.id === optionId)
  if (!card || !option) return { ok: false, state, error: 'Unknown decision option.' }

  if (option.cost) {
    for (const [key, amount] of Object.entries(option.cost) as [ResourceKey, number][]) {
      if (state.resources[key] < amount) {
        return { ok: false, state, error: `Not enough ${key} for that choice.` }
      }
    }
  }

  const draft = cloneState(state)
  if (option.cost) {
    for (const [key, amount] of Object.entries(option.cost) as [ResourceKey, number][]) {
      addResource(draft, key, -amount)
    }
  }
  applyEffects(draft, option.effects, {
    playerId: draft.players[draft.activePlayer]?.id,
    source: card.title,
  })
  if (draft.decision) {
    draft.decision.chosen = optionId
    draft.decision.resolved = true
  }
  draft.stats.decisionsMade += 1
  addLog(draft, `Decision — ${option.label}`, 'system')
  draft.updatedAt = Date.now()
  return { ok: true, state: draft }
}

/** End the active survivor's turn; wraps into the Mystery Phase. */
export function endTurn(state: GameState): EngineResult {
  if (state.phase !== 'action') return { ok: false, state, error: 'Turns only end in the Action Phase.' }
  const draft = cloneState(state)
  const nextIndex = draft.activePlayer + 1
  const nextPlayer = draft.players[nextIndex]
  if (nextPlayer) {
    draft.activePlayer = nextIndex
    draft.ap = AP_PER_ROUND
    addLog(draft, `${nextPlayer.id}'s turn.`, 'info')
    draft.updatedAt = Date.now()
    return { ok: true, state: draft }
  }
  return advancePhase(draft)
}

export function playAction(state: GameState, request: ActionRequest): EngineResult {
  const result = performAction(state, request)
  if (!result.ok) return { ok: false, state, error: result.error }
  return { ok: true, state: result.state }
}

export function useItem(state: GameState, itemId: string): EngineResult {
  const item = ITEM_MAP[itemId]
  if (!item) return { ok: false, state, error: 'Unknown item.' }
  const player = state.players[state.activePlayer]
  if (!player) return { ok: false, state, error: 'No active survivor.' }
  const owned = player.inventory[itemId] ?? 0
  if (owned <= 0) return { ok: false, state, error: 'You do not have that item.' }

  const draft = cloneState(state)
  const active = draft.players[draft.activePlayer]
  active.inventory[itemId] = owned - 1
  if (active.inventory[itemId] <= 0) delete active.inventory[itemId]

  switch (item.effect.kind) {
    case 'heal':
      applyEffects(draft, [{ kind: 'health', amount: item.effect.amount }], {
        playerId: active.id,
        source: item.title,
      })
      break
    case 'food':
    case 'water':
    case 'energy':
    case 'trust':
      addResource(draft, item.effect.kind, item.effect.amount)
      addLog(draft, `${item.title} used (+${item.effect.amount} ${item.effect.kind}).`, 'good')
      break
    default:
      break
  }
  draft.updatedAt = Date.now()
  return { ok: true, state: draft }
}

export function setSelectedLocation(state: GameState, locationId: GameState['selectedLocation']): GameState {
  if (state.selectedLocation === locationId) return state
  return { ...state, selectedLocation: locationId }
}

export function hasEnded(state: GameState | null): boolean {
  return Boolean(state?.ending)
}

export function endingFor(state: GameState): EndingResult | null {
  return state.ending
}

export function canStartRound(state: GameState): boolean {
  return state.round <= TOTAL_ROUNDS && state.phase !== 'complete'
}

export function getOptionCost(option: DecisionOption): Partial<Record<ResourceKey, number>> {
  return option.cost ?? {}
}

export function decisionOptionFor(cardId: string, optionId: string): DecisionOption | undefined {
  return getDecisionOption(cardId, optionId)
}

export function resourceCap(key: ResourceKey): number {
  return RESOURCE_CAPS[key]
}

export { TOTAL_ROUNDS }
