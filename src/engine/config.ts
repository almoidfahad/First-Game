import type { Consumables, Difficulty, LocationId, Phase, ResourceKey, Resources } from '../types/game'

export const SCHEMA_VERSION = 2
export const TOTAL_ROUNDS = 8
export const AP_PER_ROUND = 2
export const MAX_HEALTH = 100
export const MAX_INTEGRITY = 3
export const MIN_PLAYERS = 1
export const MAX_PLAYERS = 4

export const PHASE_ORDER: Phase[] = ['event', 'decision', 'action', 'mystery', 'survival']

export const PHASE_LABELS: Record<Phase, string> = {
  event: 'Event Phase',
  decision: 'Decision Phase',
  action: 'Action Phase',
  mystery: 'Mystery Phase',
  survival: 'Survival Phase',
  complete: 'Campaign Complete',
}

export const PHASE_BRIEFS: Record<Phase, string> = {
  event: 'The city speaks. Draw an event card and live with it.',
  decision: 'A choice with weight. Every option has consequences.',
  action: 'Spend action points across the city.',
  mystery: 'Evidence surfaces where you have been digging.',
  survival: 'Consumption, health and the state of the city are resolved.',
  complete: 'The campaign is over.',
}

export const RESOURCE_KEYS: ResourceKey[] = ['food', 'water', 'energy', 'trust']
export const RESOURCE_META: Record<ResourceKey, { label: string; icon: string; accent: string; cap: number }> = {
  food: { label: 'Food', icon: 'Apple', accent: '#22c55e', cap: 20 },
  water: { label: 'Water', icon: 'Droplets', accent: '#38bdf8', cap: 20 },
  energy: { label: 'Energy', icon: 'Zap', accent: '#fbbf24', cap: 12 },
  trust: { label: 'Trust', icon: 'Star', accent: '#a78bfa', cap: 10 },
}

export const RESOURCE_CAPS: Resources = {
  food: RESOURCE_META.food.cap,
  water: RESOURCE_META.water.cap,
  energy: RESOURCE_META.energy.cap,
  trust: RESOURCE_META.trust.cap,
}

export interface DifficultySettings {
  label: string
  blurb: string
  start: Resources
  /** Units produced by a single gather action. */
  gather: number
  consumption: Consumables
  /** Health lost each survival phase by every living player. */
  healthDecay: number
  /** Added to every clue's investigation threshold. */
  clueThresholdBonus: number
  /** Base ending score needed for the bright ending. */
  brightThreshold: number
}

export const DIFFICULTY_SETTINGS: Record<Difficulty, DifficultySettings> = {
  easy: {
    label: 'Easy',
    blurb: 'More supplies, gentler decay. Recommended for a first campaign.',
    start: { food: 5, water: 5, energy: 3, trust: 4 },
    gather: 3,
    consumption: { food: 1, water: 1, energy: 1 },
    healthDecay: 2,
    clueThresholdBonus: -1,
    brightThreshold: 66,
  },
  normal: {
    label: 'Normal',
    blurb: 'The intended balance. Tight but survivable with planning.',
    start: { food: 3, water: 3, energy: 2, trust: 3 },
    gather: 2,
    consumption: { food: 1, water: 1, energy: 1 },
    healthDecay: 4,
    clueThresholdBonus: 0,
    brightThreshold: 72,
  },
  hard: {
    label: 'Hard',
    blurb: 'Lean supplies, fast decay, harder evidence. For veteran operators.',
    start: { food: 2, water: 2, energy: 2, trust: 2 },
    gather: 2,
    consumption: { food: 1, water: 1, energy: 1 },
    healthDecay: 7,
    clueThresholdBonus: 1,
    brightThreshold: 78,
  },
}

/** Actions that may be taken at each location (see data/locations.ts). */
export const LOCATION_IDS: LocationId[] = [
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

/**
 * Some locations are sealed until the story opens them. These defaults are
 * combined with each location's own `unlock` requirements.
 */
export const DEFAULT_UNLOCKED: LocationId[] = [
  'hospital',
  'police',
  'power',
  'cityhall',
  'mall',
  'water',
  'school',
  'library',
]

export const ACTION_RULES = {
  /** Energy consumed by an investigate action. */
  investigateEnergy: 1,
  /** Base energy consumed by a repair action (engineer pays 0). */
  repairEnergy: 1,
  /** Food or water spent to help survivors. */
  helpCost: 1,
  /** Trade: units given away and received. */
  tradeGive: 2,
  tradeReceive: 1,
  /** Investigation progress an explore action adds. */
  exploreProgress: 1,
  maxIntegrity: MAX_INTEGRITY,
} as const

export const SAVE_SLOT_PREFIX = 'slot'
export const AUTOSAVE_SLOT = 'autosave'
export const MAX_MANUAL_SLOTS = 5
