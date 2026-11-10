import { LOCATIONS } from '../data/locations'
import { getClueIdsForScenario, getScenario } from '../data/scenarios'
import type { EndingBreakdown, EndingKey, EndingResult, GameState } from '../types/game'
import { DIFFICULTY_SETTINGS, MAX_HEALTH, MAX_INTEGRITY, RESOURCE_CAPS, TOTAL_ROUNDS } from './config'
import { clamp } from './helpers'

export interface EndingDefinition {
  key: EndingKey
  title: string
  subtitle: string
  summary: string
  requirement: string
  accent: string
}

export const ENDING_CATALOG: EndingDefinition[] = [
  {
    key: 'bright',
    title: 'The Bright Future',
    subtitle: 'The city survives and thrives again',
    summary:
      'The lights come back on and stay on. The truth is public, the grid holds, and the people who stayed remember who stayed with them.',
    requirement: 'Score threshold, 3 clues, every survivor alive, average integrity 2+, Trust 4+.',
    accent: '#22c55e',
  },
  {
    key: 'broken',
    title: 'The Broken City',
    subtitle: 'The city survives — at great cost',
    summary:
      'Dawn arrives over a city that is still standing and still counting what it lost. The truth is partial and the grid is fragile, but there is a morning.',
    requirement: 'Survive to the final round with at least one survivor and a score of 40+.',
    accent: '#fbbf24',
  },
  {
    key: 'dark',
    title: 'The Dark Ending',
    subtitle: 'The city falls',
    summary:
      'The last light goes out. Whatever the truth was, there is nobody left in the district with the strength to act on it.',
    requirement: 'Too few survivors, collapsed Trust, or a failing city score.',
    accent: '#ef4444',
  },
]

export function averageIntegrity(state: GameState): number {
  const values = LOCATIONS.map((location) => state.infrastructure[location.id] ?? 0)
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

export function cityScore(state: GameState): number {
  const integrity = averageIntegrity(state)
  const survivorsAlive = state.players.filter((player) => player.health > 0).length
  const avgHealth =
    state.players.reduce((sum, player) => sum + player.health, 0) / Math.max(1, state.players.length)

  return clamp(Math.round(integrity * 10), 0, 30)
    + clamp(Math.round((survivorsAlive / Math.max(1, state.players.length)) * 25), 0, 25)
    + clamp(Math.round((avgHealth / MAX_HEALTH) * 15), 0, 15)
    + clamp(Math.round((state.resources.trust / RESOURCE_CAPS.trust) * 10), 0, 10)
    + clamp(Math.round((state.clueIds.length / 3) * 20), 0, 20)
}

export function evaluateEnding(state: GameState): EndingResult {
  const living = state.players.filter((player) => player.health > 0)
  const survived = living.length > 0
  const integrity = averageIntegrity(state)
  const totalClues = getClueIdsForScenario(state.scenarioId).length
  const cluesFound = state.clueIds.length
  const score = survived ? cityScore(state) : 0
  const brightThreshold = DIFFICULTY_SETTINGS[state.difficulty].brightThreshold

  let key: EndingKey
  if (
    survived &&
    score >= brightThreshold &&
    cluesFound >= totalClues &&
    living.length === state.players.length &&
    integrity >= 2 &&
    state.resources.trust >= 4
  ) {
    key = 'bright'
  } else if (survived && score >= 40 && state.round >= Math.ceil(TOTAL_ROUNDS / 2)) {
    key = 'broken'
  } else {
    key = 'dark'
  }

  const definition = ENDING_CATALOG.find((entry) => entry.key === key) as EndingDefinition
  const scenario = getScenario(state.scenarioId)

  const breakdown: EndingBreakdown[] = [
    {
      label: 'Infrastructure',
      value: `${integrity.toFixed(1)} / ${MAX_INTEGRITY} average`,
      points: clamp(Math.round(integrity * 10), 0, 30),
      max: 30,
    },
    {
      label: 'Survivors',
      value: `${living.length} of ${state.players.length} on their feet`,
      points: clamp(Math.round((living.length / Math.max(1, state.players.length)) * 25), 0, 25),
      max: 25,
    },
    {
      label: 'Public Trust',
      value: `${state.resources.trust} / ${RESOURCE_CAPS.trust}`,
      points: clamp(Math.round((state.resources.trust / RESOURCE_CAPS.trust) * 10), 0, 10),
      max: 10,
    },
    {
      label: 'Evidence',
      value: `${cluesFound} / ${totalClues} clues recovered`,
      points: clamp(Math.round((cluesFound / Math.max(1, totalClues)) * 20), 0, 20),
      max: 20,
    },
  ]

  return {
    key,
    title: definition.title,
    subtitle: definition.subtitle,
    score,
    summary:
      key === 'dark'
        ? `${definition.summary} Scenario "${scenario.codename}" ends unresolved.`
        : `${definition.summary} Scenario "${scenario.codename}" resolved: ${scenario.revelation}`,
    breakdown,
    cluesFound,
    cluesTotal: totalClues,
    achievedAtRound: state.round,
    survived,
  }
}
