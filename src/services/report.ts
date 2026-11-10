import { CARD_LIBRARY, CHARACTERS, CONTENT_STATS, LOCATIONS } from '../data'
import { getScenario } from '../data/scenarios'
import { PHASE_LABELS } from '../engine/config'
import { ENDING_CATALOG } from '../engine/ending'
import type { GameState } from '../types/game'

export type ReportKind = 'rules' | 'characters' | 'report' | 'cards' | 'campaign'

const TITLES: Record<ReportKind, string> = {
  rules: 'Game Rules',
  characters: 'Character Sheets',
  report: 'Game Report',
  cards: 'Card Collection',
  campaign: 'Campaign Summary',
}

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  text?: string,
  className?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag)
  if (text !== undefined) node.textContent = text
  if (className) node.className = className
  return node
}

function section(parent: HTMLElement, title: string): HTMLElement {
  const wrapper = el('section', undefined, 'print-section')
  wrapper.appendChild(el('h2', title))
  parent.appendChild(wrapper)
  return wrapper
}

/**
 * Build a printable document from the live game data and hand it to the
 * browser's print dialog, where the player can save it as a PDF.
 *
 * All text is set with textContent, so no untrusted string is ever parsed as HTML.
 */
export function buildReport(kind: ReportKind, state?: GameState | null): HTMLElement {
  const root = el('div', undefined, 'print-root')
  root.appendChild(el('h1', `Shadow City — ${TITLES[kind]}`))
  root.appendChild(
    el(
      'p',
      `Generated ${new Date().toLocaleString()} · Offline build · ${CONTENT_STATS.totalCards} cards`,
      'print-meta',
    ),
  )

  if (kind === 'rules') {
    const rules = section(root, 'The Campaign')
    rules.appendChild(
      el(
        'p',
        'Shadow City is played over eight rounds. Each round runs five phases: Event, Decision, Action, Mystery and Survival. The city shares four resources — Food, Water, Energy and Trust. Every survivor has two Action Points per round.',
      ),
    )
    const phases = section(root, 'Phases')
    for (const [phase, label] of Object.entries(PHASE_LABELS)) {
      if (phase === 'complete') continue
      phases.appendChild(el('p', `${label}: resolved in order, every round.`))
    }
    const endings = section(root, 'Endings')
    for (const ending of ENDING_CATALOG) {
      endings.appendChild(el('p', `${ending.title} — ${ending.requirement}`))
    }
    const locations = section(root, 'Locations')
    for (const location of LOCATIONS) {
      locations.appendChild(el('p', `${location.name} (${location.tagline}): ${location.unique}`))
    }
  }

  if (kind === 'characters') {
    for (const character of CHARACTERS) {
      const block = section(root, `${character.title} — ${character.name}`)
      block.appendChild(el('p', character.biography))
      block.appendChild(el('p', `Ability: ${character.ability.name} — ${character.ability.description}`))
      block.appendChild(el('p', `Strength: ${character.strength}`))
      block.appendChild(el('p', `Weakness: ${character.weakness}`))
      block.appendChild(
        el(
          'p',
          `Force ${character.attributes.force} · Wits ${character.attributes.wits} · Empathy ${character.attributes.empathy} · Resilience ${character.attributes.resilience}`,
        ),
      )
    }
  }

  if (kind === 'cards') {
    for (const card of CARD_LIBRARY) {
      const block = section(root, `${card.category}: ${card.title}`)
      block.appendChild(el('p', card.description))
      block.appendChild(el('p', card.detail))
    }
  }

  if ((kind === 'report' || kind === 'campaign') && state) {
    const scenario = getScenario(state.scenarioId)
    const summary = section(root, 'Campaign')
    summary.appendChild(el('p', `Scenario: ${scenario.title} (${scenario.codename})`))
    summary.appendChild(el('p', `Difficulty: ${state.difficulty.toUpperCase()}`))
    summary.appendChild(el('p', `Mode: ${state.mode.toUpperCase()}`))
    summary.appendChild(el('p', `Round reached: ${state.round} of 8`))
    summary.appendChild(el('p', `Seed: ${state.seed}`))
    if (state.ending) {
      summary.appendChild(el('p', `Ending: ${state.ending.title} — score ${state.ending.score}/100`))
      summary.appendChild(el('p', state.ending.summary))
      for (const line of state.ending.breakdown) {
        summary.appendChild(el('p', `${line.label}: ${line.value} (${line.points}/${line.max})`))
      }
    }
    const survivors = section(root, 'Survivors')
    for (const player of state.players) {
      survivors.appendChild(
        el(
          'p',
          `${player.id} — Health ${player.health}/${player.maxHealth} · Mission ${player.missionComplete ? 'complete' : `${player.missionProgress} progress`}`,
        ),
      )
    }
    const city = section(root, 'City')
    city.appendChild(el('p', `Food ${state.resources.food} · Water ${state.resources.water} · Energy ${state.resources.energy} · Trust ${state.resources.trust}`))
    for (const location of LOCATIONS) {
      city.appendChild(el('p', `${location.name}: integrity ${state.infrastructure[location.id] ?? 0}/3`))
    }
    const evidence = section(root, 'Evidence')
    if (state.clueIds.length === 0) evidence.appendChild(el('p', 'No clues recovered.'))
    for (const clueId of state.clueIds) evidence.appendChild(el('p', clueId))
    const log = section(root, 'Chronicle')
    for (const entry of state.log.slice(-40)) {
      log.appendChild(el('p', `R${entry.round} · ${PHASE_LABELS[entry.phase]} — ${entry.text}`))
    }
  }

  if ((kind === 'report' || kind === 'campaign') && !state) {
    root.appendChild(el('p', 'No campaign is loaded, so only the cover sheet is available.'))
  }

  return root
}

/** Print (or save as PDF) using the browser dialog and the print stylesheet. */
export function printReport(kind: ReportKind, state?: GameState | null): void {
  const existing = document.getElementById('shadow-print-root')
  existing?.remove()
  const root = buildReport(kind, state)
  root.id = 'shadow-print-root'
  document.body.appendChild(root)
  document.body.classList.add('printing')
  const cleanup = () => {
    document.body.classList.remove('printing')
    root.remove()
    window.removeEventListener('afterprint', cleanup)
  }
  window.addEventListener('afterprint', cleanup)
  window.setTimeout(() => {
    window.print()
    window.setTimeout(cleanup, 1500)
  }, 60)
}
