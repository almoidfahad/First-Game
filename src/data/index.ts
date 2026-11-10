import type { Rarity } from '../types/game'
import { CHARACTERS, CHARACTER_MAP, getCharacter } from './characters'
import { LOCATIONS, LOCATION_MAP, getLocation } from './locations'
import { SCENARIOS, SCENARIO_MAP, CLUES, CLUE_MAP, getClueIdsForScenario } from './scenarios'
import { EVENT_CARDS, EVENT_MAP } from './cards/events'
import { DECISION_CARDS, DECISION_MAP } from './cards/decisions'
import { MISSION_CARDS, MISSION_MAP } from './cards/missions'
import { ITEM_CARDS, ITEM_MAP } from './cards/items'

export * from './characters'
export * from './locations'
export * from './scenarios'
export * from './cards/events'
export * from './cards/decisions'
export * from './cards/missions'
export * from './cards/items'

export type CardCategory = 'Character' | 'Event' | 'Mystery' | 'Decision' | 'Mission' | 'Item'

export interface LibraryCard {
  id: string
  category: CardCategory
  title: string
  subtitle: string
  description: string
  detail: string
  accent: string
  icon: string
  rarity?: Rarity
  scenarioId?: string
}

function characterCards(): LibraryCard[] {
  return CHARACTERS.map((character) => ({
    id: `char-${character.id}`,
    category: 'Character',
    title: character.title,
    subtitle: character.name,
    description: character.biography,
    detail: `Ability — ${character.ability.name}: ${character.ability.description} Strength: ${character.strength} Weakness: ${character.weakness}`,
    accent: character.portrait.accent,
    icon: character.portrait.glyph,
  }))
}

function eventCards(): LibraryCard[] {
  return EVENT_CARDS.map((card) => ({
    id: card.id,
    category: 'Event',
    title: card.title,
    subtitle: card.subtitle,
    description: card.text,
    detail: `Alert: ${card.alert} · ${card.effects.length} effect(s)`,
    accent: card.alert === 'critical' ? '#ef4444' : card.alert === 'warning' ? '#fbbf24' : '#38bdf8',
    icon: 'Radio',
    rarity: card.rarity,
  }))
}

function mysteryCards(): LibraryCard[] {
  return CLUES.map((clue) => ({
    id: clue.id,
    category: 'Mystery',
    title: clue.title,
    subtitle: `${SCENARIO_MAP[clue.scenarioId].codename} · Clue ${clue.order}`,
    description: clue.text,
    detail: `Found at ${LOCATION_MAP[clue.locationId].name} after ${clue.threshold} investigation progress.`,
    accent: SCENARIO_MAP[clue.scenarioId].accent,
    icon: 'Search',
    scenarioId: clue.scenarioId,
  }))
}

function decisionCards(): LibraryCard[] {
  return DECISION_CARDS.map((card) => ({
    id: card.id,
    category: 'Decision',
    title: card.title,
    subtitle: `${card.options.length} options`,
    description: card.prompt,
    detail: card.options.map((option) => `${option.label} — ${option.detail}`).join('  |  '),
    accent: '#a78bfa',
    icon: 'HelpCircle',
  }))
}

function missionCards(): LibraryCard[] {
  return MISSION_CARDS.map((card) => ({
    id: card.id,
    category: 'Mission',
    title: card.title,
    subtitle: `Secret · ${card.objective.kind} × ${card.objective.target}`,
    description: card.briefing,
    detail: card.objective.locationId
      ? `Requires ${LOCATION_MAP[card.objective.locationId].name}. Reward: ${card.reward.length} effect(s).`
      : `Reward: ${card.reward.length} effect(s).`,
    accent: '#f97316',
    icon: 'Target',
  }))
}

function itemCards(): LibraryCard[] {
  return ITEM_CARDS.map((card) => ({
    id: card.id,
    category: 'Item',
    title: card.title,
    subtitle: `${card.effect.kind} +${card.effect.amount}`,
    description: card.description,
    detail: `Consumable · restores ${card.effect.amount} ${card.effect.amount === 1 ? 'unit' : 'units'} of ${card.effect.kind}.`,
    accent: '#22d3ee',
    icon: 'Package',
    rarity: card.rarity,
  }))
}

/** Everything the Card Library screen shows, built from the same data the engine uses. */
export const CARD_LIBRARY: LibraryCard[] = [
  ...characterCards(),
  ...eventCards(),
  ...mysteryCards(),
  ...decisionCards(),
  ...missionCards(),
  ...itemCards(),
]

export const CONTENT_STATS = {
  characters: CHARACTERS.length,
  locations: LOCATIONS.length,
  events: EVENT_CARDS.length,
  mysteries: CLUES.length,
  decisions: DECISION_CARDS.length,
  missions: MISSION_CARDS.length,
  items: ITEM_CARDS.length,
  scenarios: SCENARIOS.length,
  totalCards:
    CHARACTERS.length +
    EVENT_CARDS.length +
    CLUES.length +
    DECISION_CARDS.length +
    MISSION_CARDS.length +
    ITEM_CARDS.length,
}

export {
  CHARACTERS,
  CHARACTER_MAP,
  getCharacter,
  LOCATIONS,
  LOCATION_MAP,
  getLocation,
  SCENARIOS,
  SCENARIO_MAP,
  CLUES,
  CLUE_MAP,
  getClueIdsForScenario,
  EVENT_CARDS,
  EVENT_MAP,
  DECISION_CARDS,
  DECISION_MAP,
  MISSION_CARDS,
  MISSION_MAP,
  ITEM_CARDS,
  ITEM_MAP,
}
