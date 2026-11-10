import { getCharacter } from '../data/characters'
import { MISSION_MAP } from '../data/cards/missions'
import { ITEM_MAP } from '../data/cards/items'
import { LOCATION_MAP } from '../data/locations'
import { CLUE_MAP } from '../data/scenarios'
import type {
  CharacterAbilityMods,
  Effect,
  GameState,
  LocationId,
  MissionObjectiveKind,
  Player,
  ResourceKey,
  Resources,
} from '../types/game'
import { MAX_INTEGRITY, RESOURCE_CAPS, RESOURCE_META } from './config'
import { addLog, clamp } from './helpers'

export interface EffectContext {
  playerId?: string
  source: string
}

export function getAbility(player: Player): CharacterAbilityMods {
  return getCharacter(player.characterId).mods
}

export function activePlayer(state: GameState): Player | undefined {
  return state.players[state.activePlayer]
}

/** The best Trust-loss reduction among living survivors. */
export function trustLossReduction(state: GameState): number {
  const living = state.players.filter((player) => player.health > 0)
  if (living.length === 0) return 0
  return Math.max(...living.map((player) => getAbility(player).trustLossReduction))
}

/** Reduce negative Trust changes by the best available Public Voice, never below 0. */
export function modTrustDelta(state: GameState, amount: number): number {
  if (amount >= 0) return amount
  return Math.min(0, amount + trustLossReduction(state))
}

export function addResource(draft: GameState, key: ResourceKey, amount: number): number {
  const before = draft.resources[key]
  const cap = RESOURCE_CAPS[key]
  draft.resources[key] = clamp(before + amount, 0, cap)
  return draft.resources[key] - before
}

export function giveItem(draft: GameState, playerId: string, itemId: string, amount = 1): boolean {
  if (!ITEM_MAP[itemId]) return false
  const player = draft.players.find((p) => p.id === playerId)
  if (!player) return false
  player.inventory[itemId] = clamp((player.inventory[itemId] ?? 0) + amount, 0, 9)
  return true
}

/** Reveal a clue from the active scenario. Unknown or foreign clues are ignored. */
export function discoverClue(draft: GameState, clueId: string, source: string): boolean {
  const clue = CLUE_MAP[clueId]
  if (!clue) return false
  if (clue.scenarioId !== draft.scenarioId) return false
  if (draft.clueIds.includes(clueId)) return false
  draft.clueIds.push(clueId)
  draft.stats.cluesFound = draft.clueIds.length
  addLog(draft, `Clue discovered — ${clue.title} (${source})`, 'mystery')
  for (const player of draft.players) {
    const mission = player.missionId ? MISSION_MAP[player.missionId] : undefined
    if (mission && mission.objective.kind === 'clue' && !player.missionComplete) {
      bumpMission(draft, player, 1)
    }
  }
  return true
}

/** Award mission progress and pay out the reward exactly once. */
export function bumpMission(draft: GameState, player: Player, amount = 1): void {
  if (!player.missionId || player.missionComplete) return
  const mission = MISSION_MAP[player.missionId]
  if (!mission) return
  player.missionProgress = clamp(player.missionProgress + amount, 0, mission.objective.target)
  player.missionRevealed = true
  if (player.missionProgress >= mission.objective.target) {
    player.missionComplete = true
    draft.stats.missionsCompleted += 1
    addLog(draft, `${player.id} completed secret mission "${mission.title}".`, 'good')
    applyEffects(draft, mission.reward, { playerId: player.id, source: mission.title })
  }
}

/** Progress a mission only when the action matches its objective. */
export function progressMission(
  draft: GameState,
  player: Player,
  kind: MissionObjectiveKind,
  locationId?: LocationId,
): void {
  if (!player.missionId || player.missionComplete) return
  const mission = MISSION_MAP[player.missionId]
  if (!mission) return
  if (mission.objective.kind !== kind) return
  if (mission.objective.locationId && mission.objective.locationId !== locationId) return
  bumpMission(draft, player, 1)
}

/**
 * Apply a list of declarative effects to a draft state.
 * Every effect is clamped and logged; nothing here can create a negative resource.
 */
export function applyEffects(draft: GameState, effects: Effect[], ctx: EffectContext): GameState {
  const fallbackPlayerId = activePlayer(draft)?.id

  for (const effect of effects) {
    switch (effect.kind) {
      case 'resource': {
        const amount = effect.resource === 'trust' ? modTrustDelta(draft, effect.amount) : effect.amount
        const delta = addResource(draft, effect.resource, amount)
        if (delta !== 0) {
          const label = RESOURCE_META[effect.resource].label
          addLog(draft, `${label} ${delta > 0 ? '+' : ''}${delta} — ${ctx.source}`, delta > 0 ? 'good' : 'bad')
        }
        break
      }
      case 'health': {
        const targets =
          effect.target === 'all'
            ? draft.players
            : draft.players.filter((player) => player.id === (ctx.playerId ?? fallbackPlayerId))
        for (const player of targets) {
          const reduction = effect.amount < 0 ? getAbility(player).damageReduction : 0
          const delta = effect.amount < 0 ? Math.min(0, effect.amount + reduction) : effect.amount
          const before = player.health
          player.health = clamp(before + delta, 0, player.maxHealth)
          const applied = player.health - before
          if (applied !== 0) {
            addLog(
              draft,
              `${player.id} Health ${applied > 0 ? '+' : ''}${applied} — ${ctx.source}`,
              applied > 0 ? 'good' : 'bad',
            )
          }
        }
        break
      }
      case 'infrastructure': {
        const location = LOCATION_MAP[effect.locationId]
        if (!location) break
        const before = draft.infrastructure[effect.locationId] ?? 0
        draft.infrastructure[effect.locationId] = clamp(before + effect.amount, 0, MAX_INTEGRITY)
        const delta = draft.infrastructure[effect.locationId] - before
        if (delta !== 0) {
          addLog(
            draft,
            `${location.name} integrity ${delta > 0 ? '+' : ''}${delta} — ${ctx.source}`,
            delta > 0 ? 'good' : 'bad',
          )
        }
        break
      }
      case 'unlock': {
        if (!draft.unlocked.includes(effect.locationId)) {
          draft.unlocked.push(effect.locationId)
          addLog(draft, `${LOCATION_MAP[effect.locationId].name} is now accessible.`, 'good')
        }
        break
      }
      case 'clue':
        discoverClue(draft, effect.clueId, ctx.source)
        break
      case 'item': {
        const playerId = ctx.playerId ?? fallbackPlayerId
        if (playerId && giveItem(draft, playerId, effect.itemId, effect.amount ?? 1)) {
          addLog(draft, `${ITEM_MAP[effect.itemId].title} acquired — ${ctx.source}`, 'good')
        }
        break
      }
      case 'ap': {
        draft.ap = clamp(draft.ap + effect.amount, 0, 9)
        addLog(draft, `Action Points ${effect.amount > 0 ? '+' : ''}${effect.amount} — ${ctx.source}`, 'info')
        break
      }
      case 'mission': {
        const player = draft.players.find((p) => p.id === (ctx.playerId ?? fallbackPlayerId))
        if (player) bumpMission(draft, player, effect.amount)
        break
      }
      default:
        break
    }
  }

  return draft
}

/** Apply effects immutably (used by UI-facing engine entry points). */
export function applyEffectsCopy(
  state: GameState,
  effects: Effect[],
  ctx: EffectContext,
): GameState {
  const draft: GameState = JSON.parse(JSON.stringify(state)) as GameState
  return applyEffects(draft, effects, ctx)
}

export function emptyCapResources(): Resources {
  return { ...RESOURCE_CAPS }
}
