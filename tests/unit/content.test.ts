import { describe, expect, it } from 'vitest'
import { validateContent } from '../../src/data/validate'
import { CARD_LIBRARY, CONTENT_STATS } from '../../src/data'
import { CLUE_MAP, getClueIdsForScenario, SCENARIOS } from '../../src/data/scenarios'
import { EVENT_CARDS } from '../../src/data/cards/events'
import { DECISION_CARDS } from '../../src/data/cards/decisions'
import { MISSION_CARDS } from '../../src/data/cards/missions'
import { ITEM_CARDS } from '../../src/data/cards/items'
import { CHARACTERS } from '../../src/data/characters'
import { LOCATIONS } from '../../src/data/locations'

describe('content pack', () => {
  it('passes every structural validation rule', () => {
    expect(validateContent()).toEqual([])
  })

  it('ships the promised number of cards', () => {
    expect(CHARACTERS).toHaveLength(8)
    expect(LOCATIONS).toHaveLength(12)
    expect(EVENT_CARDS).toHaveLength(20)
    expect(DECISION_CARDS).toHaveLength(16)
    expect(MISSION_CARDS).toHaveLength(8)
    expect(ITEM_CARDS).toHaveLength(12)
    expect(SCENARIOS).toHaveLength(4)
    expect(CONTENT_STATS.totalCards).toBe(8 + 20 + 12 + 16 + 8 + 12)
    expect(CARD_LIBRARY).toHaveLength(CONTENT_STATS.totalCards)
  })

  it('gives every scenario exactly three ordered clues with real text', () => {
    for (const scenario of SCENARIOS) {
      const ids = getClueIdsForScenario(scenario.id)
      expect(ids).toHaveLength(3)
      expect(new Set(ids).size).toBe(3)
      for (const id of ids) {
        const clue = CLUE_MAP[id]
        expect(clue.scenarioId).toBe(scenario.id)
        expect(clue.text.length).toBeGreaterThan(40)
        expect(scenario.leadLocations).toContain(clue.locationId)
      }
      expect(scenario.hiddenTruth.length).toBeGreaterThan(40)
      expect(scenario.revelation.length).toBeGreaterThan(40)
    }
  })

  it('gives every decision at least two distinct, described options', () => {
    for (const card of DECISION_CARDS) {
      const ids = new Set(card.options.map((option) => option.id))
      expect(ids.size).toBe(card.options.length)
      for (const option of card.options) {
        expect(option.label.length).toBeGreaterThan(0)
        expect(option.detail.length).toBeGreaterThan(10)
        expect(option.effects.length).toBeGreaterThan(0)
      }
    }
  })

  it('never references a location that does not exist', () => {
    const locationIds = new Set(LOCATIONS.map((location) => location.id))
    for (const location of LOCATIONS) {
      expect(locationIds.has(location.id)).toBe(true)
      expect(location.actions.length).toBeGreaterThan(0)
      expect(location.unique.length).toBeGreaterThan(10)
    }
  })
})
