import { ITEM_CARDS, ITEM_MAP } from '../data/cards/items'
import { MISSION_MAP } from '../data/cards/missions'
import { LOCATION_MAP } from '../data/locations'
import type {
  ActionKind,
  GameState,
  LocationId,
  Player,
  ResourceKey,
} from '../types/game'
import {
  ACTION_RULES,
  AP_PER_ROUND,
  DIFFICULTY_SETTINGS,
  MAX_INTEGRITY,
  RESOURCE_CAPS,
} from './config'
import { addLog, clamp, cloneState } from './helpers'
import { addResource, applyEffects, getAbility, giveItem, progressMission } from './effects'
import { roll, rollInt } from './rng'

export interface ActionRequest {
  kind: ActionKind
  locationId: LocationId
  helpResource?: 'food' | 'water'
  trade?: { from: ResourceKey; to: ResourceKey }
}

export interface ActionResult {
  ok: boolean
  state: GameState
  error?: string
}

export const ACTION_META: Record<
  ActionKind,
  { label: string; icon: string; description: string; ap: number }
> = {
  explore: {
    label: 'Explore',
    icon: 'Compass',
    description: '+1 investigation progress. A chance to find an item.',
    ap: 1,
  },
  gatherFood: {
    label: 'Collect Food',
    icon: 'Apple',
    description: 'Scavenge calories from this location.',
    ap: 1,
  },
  gatherWater: {
    label: 'Collect Water',
    icon: 'Droplets',
    description: 'Draw and purify water from this location.',
    ap: 1,
  },
  repair: {
    label: 'Repair',
    icon: 'Wrench',
    description: 'Restore 1 integrity. Costs 1 Energy (free for the Engineer).',
    ap: 1,
  },
  investigate: {
    label: 'Investigate',
    icon: 'Search',
    description: '+2 investigation progress. Costs 1 Energy.',
    ap: 1,
  },
  help: {
    label: 'Help Survivors',
    icon: 'HeartHandshake',
    description: 'Spend 1 Food or Water to gain Trust.',
    ap: 1,
  },
  trade: {
    label: 'Exchange',
    icon: 'ArrowLeftRight',
    description: 'Trade 2 units of one resource for 1 of another.',
    ap: 1,
  },
  mission: {
    label: 'Advance Mission',
    icon: 'Target',
    description: 'Work directly on your secret mission objective.',
    ap: 1,
  },
}

/** Returns null when the action is legal, otherwise a human-readable reason. */
export function canPerformAction(
  state: GameState,
  kind: ActionKind,
  locationId: LocationId,
  request?: Pick<ActionRequest, 'helpResource' | 'trade'>,
): string | null {
  if (state.phase !== 'action') return 'Actions unlock in the Action Phase.'
  const player = state.players[state.activePlayer]
  if (!player) return 'No active survivor.'
  if (player.health <= 0) return 'This survivor is down — end the turn.'
  if (state.ap <= 0) return 'No action points remaining this round.'

  const location = LOCATION_MAP[locationId]
  if (!location) return 'Unknown location.'
  if (!state.unlocked.includes(locationId)) return `${location.name} is still sealed.`
  if (!location.actions.includes(kind)) return `${location.name} does not offer that action.`

  const mods = getAbility(player)

  switch (kind) {
    case 'repair':
      if ((state.infrastructure[locationId] ?? 0) >= MAX_INTEGRITY) return 'Already fully repaired.'
      if (state.resources.energy < mods.repairEnergyCost) return 'Not enough Energy for repairs.'
      break
    case 'investigate':
      if (state.resources.energy < ACTION_RULES.investigateEnergy) return 'Not enough Energy to investigate.'
      break
    case 'gatherFood':
      if (state.resources.food >= RESOURCE_CAPS.food) return 'Food stores are full.'
      break
    case 'gatherWater':
      if (state.resources.water >= RESOURCE_CAPS.water) return 'Water stores are full.'
      break
    case 'help': {
      const resource = request?.helpResource ?? 'food'
      if (state.resources[resource] < ACTION_RULES.helpCost) return `Not enough ${resource} to help survivors.`
      break
    }
    case 'trade': {
      const trade = request?.trade
      if (!trade) return 'Choose what to exchange.'
      if (trade.from === trade.to) return 'Choose two different resources.'
      if (state.resources[trade.from] < ACTION_RULES.tradeGive) {
        return `Need ${ACTION_RULES.tradeGive} ${trade.from} to trade.`
      }
      if (state.resources[trade.to] >= RESOURCE_CAPS[trade.to]) return 'That resource is already full.'
      break
    }
    case 'mission': {
      if (!player.missionId) return 'No active mission.'
      if (player.missionComplete) return 'Mission already complete.'
      const mission = MISSION_MAP[player.missionId]
      if (!mission) return 'Mission data missing.'
      if (mission.objective.kind === 'clue') return 'This mission advances through investigations.'
      if (mission.objective.locationId && mission.objective.locationId !== locationId) {
        return `Your mission requires ${LOCATION_MAP[mission.objective.locationId].name}.`
      }
      break
    }
    default:
      break
  }

  return null
}

function postAction(draft: GameState, player: Player, kind: ActionKind, locationId: LocationId): void {
  draft.ap = clamp(draft.ap - 1, 0, AP_PER_ROUND)
  draft.stats.actionsUsed += 1
  if (kind !== 'mission' && kind !== 'trade') progressMission(draft, player, kind, locationId)
  draft.selectedLocation = locationId
}

export function performAction(state: GameState, request: ActionRequest): ActionResult {
  const error = canPerformAction(state, request.kind, request.locationId, request)
  if (error) return { ok: false, state, error }

  const draft = cloneState(state)
  const player = draft.players[draft.activePlayer]
  const location = LOCATION_MAP[request.locationId]
  const mods = getAbility(player)
  const difficulty = DIFFICULTY_SETTINGS[draft.difficulty]

  switch (request.kind) {
    case 'explore': {
      const gain = ACTION_RULES.exploreProgress + (location.id === 'tunnel' ? 1 : 0)
      draft.investigations[location.id] = (draft.investigations[location.id] ?? 0) + gain
      addLog(draft, `${player.id} explores ${location.name} (+${gain} investigation).`, 'info')
      const chance = location.id === 'house' ? 0.6 : 0.4
      const lucky = roll(draft.cursor) < chance
      draft.cursor += 1
      if (lucky) {
        const item = ITEM_CARDS[rollInt(draft.cursor, ITEM_CARDS.length)]
        draft.cursor += 1
        if (item && giveItem(draft, player.id, item.id)) {
          addLog(draft, `${player.id} recovered ${item.title} while exploring ${location.name}.`, 'good')
        }
      }
      break
    }
    case 'investigate': {
      addResource(draft, 'energy', -ACTION_RULES.investigateEnergy)
      const labBonus = location.id === 'lab' ? 1 : 0
      const archiveBonus = location.id === 'library' ? 1 : 0
      const gain = 2 + mods.investigateBonus + labBonus + archiveBonus
      draft.investigations[location.id] = (draft.investigations[location.id] ?? 0) + gain
      draft.stats.investigations += 1
      addLog(draft, `${player.id} investigates ${location.name} (+${gain} investigation).`, 'info')
      if (mods.labEnergy && location.id === 'lab') {
        addResource(draft, 'energy', 1)
        addLog(draft, 'Field Analysis recovers 1 Energy from the lab rig.', 'good')
      }
      break
    }
    case 'gatherFood': {
      const amount = difficulty.gather + mods.gatherBonus + (location.id === 'mall' ? 1 : 0)
      const gained = addResource(draft, 'food', amount)
      draft.stats.foodGathered += gained
      addLog(draft, `${player.id} collected ${gained} Food at ${location.name}.`, 'good')
      break
    }
    case 'gatherWater': {
      const amount = difficulty.gather + mods.gatherBonus + (location.id === 'water' ? 1 : 0)
      const gained = addResource(draft, 'water', amount)
      draft.stats.waterGathered += gained
      addLog(draft, `${player.id} collected ${gained} Water at ${location.name}.`, 'good')
      break
    }
    case 'repair': {
      if (mods.repairEnergyCost > 0) addResource(draft, 'energy', -mods.repairEnergyCost)
      const before = draft.infrastructure[location.id] ?? 0
      draft.infrastructure[location.id] = clamp(before + mods.repairGain, 0, MAX_INTEGRITY)
      draft.stats.repairs += 1
      addLog(
        draft,
        `${player.id} repaired ${location.name} (+${draft.infrastructure[location.id] - before} integrity).`,
        'good',
      )
      if (location.id === 'power') {
        addResource(draft, 'energy', 1)
        addLog(draft, 'Kessler substation returns 1 Energy to the grid.', 'good')
      }
      if (location.id === 'police') {
        addResource(draft, 'trust', 1)
        addLog(draft, 'Precinct Nine reopens its doors — +1 Trust.', 'good')
      }
      break
    }
    case 'help': {
      const resource = request.helpResource ?? 'food'
      addResource(draft, resource, -ACTION_RULES.helpCost)
      const extra = (location.id === 'school' ? 1 : 0) + (location.id === 'radio' ? 1 : 0)
      const trustGain = 1 + mods.helpTrustBonus + extra
      addResource(draft, 'trust', trustGain)
      draft.stats.helps += 1
      addLog(
        draft,
        `${player.id} helped survivors at ${location.name} (−1 ${resource}, +${trustGain} Trust).`,
        'good',
      )
      if (location.id === 'hospital') {
        applyEffects(draft, [{ kind: 'health', amount: 4, target: 'all' }], {
          playerId: player.id,
          source: 'St. Brigid\u2019s ward round',
        })
      }
      break
    }
    case 'trade': {
      const trade = request.trade
      if (!trade) break
      addResource(draft, trade.from, -ACTION_RULES.tradeGive)
      addResource(draft, trade.to, ACTION_RULES.tradeReceive)
      draft.stats.trades += 1
      addLog(
        draft,
        `${player.id} exchanged ${ACTION_RULES.tradeGive} ${trade.from} for ${ACTION_RULES.tradeReceive} ${trade.to}.`,
        'info',
      )
      if (location.id === 'cityhall') {
        addResource(draft, 'trust', 1)
        addLog(draft, 'The Rotunda brokers the deal — +1 Trust.', 'good')
      }
      break
    }
    case 'mission': {
      const mission = player.missionId ? MISSION_MAP[player.missionId] : undefined
      if (mission) {
        applyEffects(draft, [{ kind: 'mission', amount: 1 }], {
          playerId: player.id,
          source: 'Mission work',
        })
        addLog(draft, `${player.id} worked on "${mission.title}".`, 'info')
      }
      break
    }
    default:
      break
  }

  postAction(draft, player, request.kind, location.id)
  draft.updatedAt = Date.now()
  return { ok: true, state: draft }
}

export function itemUseEffects(itemId: string) {
  const item = ITEM_MAP[itemId]
  if (!item) return null
  return item.effect
}
