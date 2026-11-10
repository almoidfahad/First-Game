import { CHARACTERS } from './characters'
import { DECISION_CARDS } from './cards/decisions'
import { EVENT_CARDS } from './cards/events'
import { ITEM_MAP } from './cards/items'
import { MISSION_CARDS } from './cards/missions'
import { LOCATIONS } from './locations'
import { CLUES, SCENARIOS } from './scenarios'

/**
 * Structural content checks. Run in tests — and once at boot in development —
 * so a bad card can never reach a save file.
 */
export function validateContent(): string[] {
  const errors: string[] = []

  const characterIds = new Set<string>()
  for (const character of CHARACTERS) {
    if (characterIds.has(character.id)) errors.push(`Duplicate character id: ${character.id}`)
    characterIds.add(character.id)
    if (!character.ability.description) errors.push(`Character ${character.id} has no ability text.`)
  }

  const locationIds = new Set(LOCATIONS.map((location) => location.id))
  if (locationIds.size !== 12) errors.push(`Expected 12 locations, found ${locationIds.size}.`)

  for (const location of LOCATIONS) {
    if (location.position.x < 0 || location.position.x > 100) errors.push(`Location ${location.id} x out of range.`)
    if (location.position.y < 0 || location.position.y > 100) errors.push(`Location ${location.id} y out of range.`)
    if (location.actions.length === 0) errors.push(`Location ${location.id} offers no actions.`)
  }

  const scenarioIds = new Set(SCENARIOS.map((scenario) => scenario.id))
  for (const scenario of SCENARIOS) {
    const clues = CLUES.filter((clue) => clue.scenarioId === scenario.id)
    if (clues.length !== 3) errors.push(`Scenario ${scenario.id} must have 3 clues, found ${clues.length}.`)
  }

  const clueIds = new Set<string>()
  for (const clue of CLUES) {
    if (clueIds.has(clue.id)) errors.push(`Duplicate clue id: ${clue.id}`)
    clueIds.add(clue.id)
    if (!scenarioIds.has(clue.scenarioId)) errors.push(`Clue ${clue.id} references unknown scenario.`)
    if (!locationIds.has(clue.locationId)) errors.push(`Clue ${clue.id} references unknown location.`)
    if (clue.threshold < 1) errors.push(`Clue ${clue.id} threshold must be at least 1.`)
  }

  const eventIds = new Set<string>()
  for (const card of EVENT_CARDS) {
    if (eventIds.has(card.id)) errors.push(`Duplicate event id: ${card.id}`)
    eventIds.add(card.id)
    if (card.effects.length === 0) errors.push(`Event ${card.id} has no effects.`)
    for (const effect of card.effects) {
      if (effect.kind === 'item' && !ITEM_MAP[effect.itemId]) errors.push(`Event ${card.id} grants unknown item.`)
      if (effect.kind === 'unlock' && !locationIds.has(effect.locationId)) {
        errors.push(`Event ${card.id} unlocks unknown location.`)
      }
    }
  }

  const decisionIds = new Set<string>()
  for (const card of DECISION_CARDS) {
    if (decisionIds.has(card.id)) errors.push(`Duplicate decision id: ${card.id}`)
    decisionIds.add(card.id)
    if (card.options.length < 2) errors.push(`Decision ${card.id} needs at least two options.`)
    const optionIds = new Set<string>()
    for (const option of card.options) {
      if (optionIds.has(option.id)) errors.push(`Decision ${card.id} has duplicate option id ${option.id}.`)
      optionIds.add(option.id)
      if (!option.detail) errors.push(`Decision option ${option.id} has no consequence text.`)
    }
  }

  const missionIds = new Set<string>()
  for (const mission of MISSION_CARDS) {
    if (missionIds.has(mission.id)) errors.push(`Duplicate mission id: ${mission.id}`)
    missionIds.add(mission.id)
    if (mission.objective.target < 1) errors.push(`Mission ${mission.id} needs a positive target.`)
    if (mission.objective.locationId && !locationIds.has(mission.objective.locationId)) {
      errors.push(`Mission ${mission.id} references unknown location.`)
    }
    for (const effect of mission.reward) {
      if (effect.kind === 'item' && !ITEM_MAP[effect.itemId]) errors.push(`Mission ${mission.id} rewards unknown item.`)
    }
  }

  const itemIds = new Set<string>()
  for (const item of Object.values(ITEM_MAP)) {
    if (itemIds.has(item.id)) errors.push(`Duplicate item id: ${item.id}`)
    itemIds.add(item.id)
    if (item.effect.amount <= 0) errors.push(`Item ${item.id} must have a positive effect amount.`)
  }

  if (EVENT_CARDS.length !== 20) errors.push(`Expected 20 event cards, found ${EVENT_CARDS.length}.`)
  if (DECISION_CARDS.length !== 16) errors.push(`Expected 16 decision cards, found ${DECISION_CARDS.length}.`)
  if (CLUES.length !== 12) errors.push(`Expected 12 mystery clues, found ${CLUES.length}.`)
  if (MISSION_CARDS.length !== 8) errors.push(`Expected 8 missions, found ${MISSION_CARDS.length}.`)
  if (itemIds.size !== 12) errors.push(`Expected 12 items, found ${itemIds.size}.`)
  if (CHARACTERS.length !== 8) errors.push(`Expected 8 characters, found ${CHARACTERS.length}.`)

  return errors
}
