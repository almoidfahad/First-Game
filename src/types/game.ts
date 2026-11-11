/**
 * Shadow City — domain types.
 * Every piece of game state is plain JSON-serialisable data so saves, tests and
 * deterministic replays all work off the same structures.
 */

export type ResourceKey = 'food' | 'water' | 'energy' | 'trust'
export type Resources = Record<ResourceKey, number>
export type Consumables = { food: number; water: number; energy: number }

export type Phase = 'event' | 'decision' | 'action' | 'mystery' | 'survival' | 'complete'
export type GameMode = 'solo' | 'local' | 'story'
export type Difficulty = 'easy' | 'normal' | 'hard'

export type CharacterId =
  | 'leader'
  | 'engineer'
  | 'detective'
  | 'doctor'
  | 'survivor'
  | 'scientist'
  | 'journalist'
  | 'security'

export type LocationId =
  | 'hospital'
  | 'police'
  | 'power'
  | 'cityhall'
  | 'lab'
  | 'tunnel'
  | 'mall'
  | 'water'
  | 'school'
  | 'library'
  | 'radio'
  | 'house'

export type ActionKind =
  | 'explore'
  | 'gatherFood'
  | 'gatherWater'
  | 'repair'
  | 'investigate'
  | 'help'
  | 'trade'
  | 'mission'

export type MissionObjectiveKind =
  | 'explore'
  | 'gatherFood'
  | 'gatherWater'
  | 'repair'
  | 'investigate'
  | 'help'
  | 'clue'

export type ScenarioId = 'experiment' | 'cyber' | 'conspiracy' | 'accident'
export type Rarity = 'common' | 'uncommon' | 'rare'

/** Declarative, validated game effect. Content never mutates state directly. */
export type Effect =
  | { kind: 'resource'; resource: ResourceKey; amount: number }
  | { kind: 'health'; amount: number; target?: 'active' | 'all' }
  | { kind: 'infrastructure'; locationId: LocationId; amount: number }
  | { kind: 'unlock'; locationId: LocationId }
  | { kind: 'clue'; clueId: string }
  | { kind: 'item'; itemId: string; amount?: number }
  | { kind: 'ap'; amount: number }
  | { kind: 'mission'; amount: number }

export interface CharacterAbilityMods {
  /** Extra units produced by gathering actions. */
  gatherBonus: number
  /** Energy charged by a repair action (default 1). */
  repairEnergyCost: number
  /** Integrity restored by a repair action (default 1). */
  repairGain: number
  /** Extra investigation progress on investigate actions. */
  investigateBonus: number
  /** Extra trust when helping survivors. */
  helpTrustBonus: number
  /** Reduces incoming trust losses (floor at 0). */
  trustLossReduction: number
  /** Reduces health damage from events and survival shortfalls. */
  damageReduction: number
  /** Health restored each survival phase (0 means regular decay applies). */
  survivalHeal: number
  /** Restores energy when investigating the research lab. */
  labEnergy: boolean
}

export interface Character {
  id: CharacterId
  name: string
  title: string
  biography: string
  ability: { name: string; description: string }
  mods: CharacterAbilityMods
  strength: string
  weakness: string
  attributes: { force: number; wits: number; empathy: number; resilience: number }
  portrait: { accent: string; glyph: string }
}

export interface LocationDef {
  id: LocationId
  name: string
  tagline: string
  description: string
  icon: string
  accent: string
  position: { x: number; y: number }
  actions: ActionKind[]
  unlock: { round?: number; clues?: number }
  unique: string
}

export interface EventCard {
  id: string
  title: string
  subtitle: string
  text: string
  rarity: Rarity
  alert: 'calm' | 'warning' | 'critical'
  effects: Effect[]
}

export type DecisionTone = 'bold' | 'cautious' | 'risky'

export interface DecisionOption {
  id: string
  label: string
  detail: string
  tone: DecisionTone
  cost?: Partial<Resources>
  effects: Effect[]
}

export interface DecisionCard {
  id: string
  title: string
  prompt: string
  options: DecisionOption[]
}

export interface ClueDef {
  id: string
  scenarioId: ScenarioId
  title: string
  text: string
  locationId: LocationId
  /** Investigation progress needed at the location to reveal this clue. */
  threshold: number
  order: number
}

export interface ScenarioDef {
  id: ScenarioId
  codename: string
  title: string
  logline: string
  hiddenTruth: string
  revelation: string
  accent: string
  leadLocations: LocationId[]
}

export interface MissionCard {
  id: string
  title: string
  briefing: string
  objective: { kind: MissionObjectiveKind; target: number; locationId?: LocationId }
  reward: Effect[]
}

export interface ItemCard {
  id: string
  title: string
  description: string
  rarity: Rarity
  effect: { kind: 'heal' | 'food' | 'water' | 'energy' | 'trust'; amount: number }
}

export interface Player {
  id: string
  seat: number
  characterId: CharacterId
  health: number
  maxHealth: number
  missionId: string
  missionProgress: number
  missionComplete: boolean
  missionRevealed: boolean
  inventory: Record<string, number>
}

/** Persisted exploration data. It remains idle until a later phase adds scenes and movement. */
export interface ExplorationState {
  locationId: LocationId | null
  position: { x: number; y: number } | null
  staminaByCharacter: Partial<Record<CharacterId, number>>
}

export type LogTone = 'info' | 'good' | 'bad' | 'mystery' | 'system'

export interface LogEntry {
  id: string
  round: number
  phase: Phase
  text: string
  tone: LogTone
}

export interface GameStats {
  actionsUsed: number
  foodGathered: number
  waterGathered: number
  repairs: number
  investigations: number
  helps: number
  trades: number
  missionsCompleted: number
  decisionsMade: number
  cluesFound: number
}

export interface SurvivalReport {
  round: number
  consumed: Consumables
  shortfalls: Consumables
  healthDelta: Record<string, number>
  infrastructureLost: LocationId[]
  trustDelta: number
  collapsed: boolean
}

export type EndingKey = 'bright' | 'broken' | 'dark'

export interface EndingBreakdown {
  label: string
  value: string
  points: number
  max: number
}

export interface EndingResult {
  key: EndingKey
  title: string
  subtitle: string
  score: number
  summary: string
  breakdown: EndingBreakdown[]
  cluesFound: number
  cluesTotal: number
  achievedAtRound: number
  survived: boolean
}

export interface GameState {
  schemaVersion: number
  id: string
  seed: string
  createdAt: number
  updatedAt: number
  mode: GameMode
  difficulty: Difficulty
  scenarioId: ScenarioId
  round: number
  phase: Phase
  resources: Resources
  infrastructure: Record<LocationId, number>
  unlocked: LocationId[]
  players: Player[]
  activePlayer: number
  exploration: ExplorationState
  ap: number
  eventCardId: string | null
  decision: { cardId: string; chosen: string | null; resolved: boolean } | null
  investigations: Record<LocationId, number>
  clueIds: string[]
  log: LogEntry[]
  eventDeck: string[]
  decisionDeck: string[]
  stats: GameStats
  cursor: number
  lastSurvival: SurvivalReport | null
  ending: EndingResult | null
  selectedLocation: LocationId | null
  phaseNotes: string[]
}

/** Shape persisted in IndexedDB. `state` is the authoritative game data. */
export interface SaveRecord {
  id: string
  name: string
  schemaVersion: number
  createdAt: number
  updatedAt: number
  mode: GameMode
  difficulty: Difficulty
  round: number
  phase: Phase
  scenarioId: ScenarioId
  summary: string
  state: GameState
  corrupt?: boolean
}

export interface SaveSummary {
  id: string
  name: string
  round: number
  phase: Phase
  mode: GameMode
  difficulty: Difficulty
  updatedAt: number
  scenarioId: ScenarioId
  players: number
  characters: CharacterId[]
}

export interface ValidationResult<T> {
  ok: boolean
  value?: T
  errors: string[]
}

export type ScreenId =
  | 'menu'
  | 'new-game'
  | 'board'
  | 'dashboard'
  | 'story'
  | 'ending'
  | 'library'
  | 'settings'
  | 'rules'
  | 'saves'

export type Settings = {
  musicVolume: number
  sfxVolume: number
  ambientVolume: number
  muted: boolean
  reduceMotion: boolean
  highContrast: boolean
  /** 'en' ships with the build; the layer is ready for more locales. */
  language: 'en'
  textScale: number
}

export interface NewGameConfig {
  mode: GameMode
  difficulty: Difficulty
  players: number
  scenarioId: ScenarioId | 'random'
  characterIds: CharacterId[]
  seed?: string
}
