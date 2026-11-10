import type { GameState, LogTone, Resources } from '../types/game'

/** Deep clone of plain JSON state — never share references between versions. */
export function cloneState<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

export function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min
  return Math.max(min, Math.min(max, value))
}

let logCounter = 0

/** Append a log line. Ids are monotonic within a session and serialisable. */
export function addLog(draft: GameState, text: string, tone: LogTone = 'info'): void {
  logCounter += 1
  draft.log.push({
    id: `log-${draft.round}-${draft.phase}-${logCounter}`,
    round: draft.round,
    phase: draft.phase,
    text,
    tone,
  })
  // Keep saves small and the UI readable.
  if (draft.log.length > 200) draft.log.splice(0, draft.log.length - 200)
}

export function emptyResources(): Resources {
  return { food: 0, water: 0, energy: 0, trust: 0 }
}

export function roundLabel(round: number): string {
  return `Round ${String(round).padStart(2, '0')}`
}

export function percent(value: number, max: number): number {
  if (max <= 0) return 0
  return clamp(Math.round((value / max) * 100), 0, 100)
}
