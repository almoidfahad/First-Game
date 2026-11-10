/**
 * Deterministic randomness.
 *
 * Every random draw is a pure function of an integer "cursor" stored in the game
 * state. That means a save can be reloaded and the exact same sequence replays,
 * and tests can assert against fixed outcomes.
 */

/** Mulberry32 — small, fast, good enough for a board game. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function hashSeed(input: string): number {
  let h = 2166136261
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** A random float in [0, 1) derived purely from the cursor value. */
export function roll(cursor: number): number {
  return mulberry32(hashSeed(`cursor:${cursor}`))()
}

/** A random integer in [0, maxExclusive). */
export function rollInt(cursor: number, maxExclusive: number): number {
  if (maxExclusive <= 0) return 0
  return Math.floor(roll(cursor) * maxExclusive)
}

/**
 * Deterministic Fisher-Yates shuffle. Returns the shuffled copy and the cursor
 * value to store in the state afterwards.
 */
export function shuffleSeeded<T>(items: readonly T[], cursor: number): { items: T[]; cursor: number } {
  const out = [...items]
  let c = cursor
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = rollInt(c, i + 1)
    c += 1
    const a = out[i]
    const b = out[j]
    out[i] = b
    out[j] = a
  }
  return { items: out, cursor: c }
}

export function pickSeeded<T>(items: readonly T[], cursor: number): { item: T | undefined; cursor: number } {
  if (items.length === 0) return { item: undefined, cursor }
  const index = rollInt(cursor, items.length)
  return { item: items[index], cursor: cursor + 1 }
}
