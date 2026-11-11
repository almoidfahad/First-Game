import { describe, expect, it } from 'vitest'
import { stepExplorationMotion } from '../../src/engine/exploration'
import type { ExplorationInput, ExplorationMotionState } from '../../src/types/game'

const idle: ExplorationInput = { up: false, down: false, left: false, right: false, run: false }

function motion(position = { x: 0.5, y: 0.5 }, stamina = 100): ExplorationMotionState {
  return { position, stamina, facing: 'down', moving: false, running: false }
}

describe('real-time exploration movement', () => {
  it('moves at walking speed without spending stamina', () => {
    const result = stepExplorationMotion(motion(), { ...idle, right: true }, 0.05, 1000, 800)

    expect(result.position.x).toBeCloseTo(0.50925, 4)
    expect(result.moving).toBe(true)
    expect(result.running).toBe(false)
    expect(result.stamina).toBe(100)
    expect(result.facing).toBe('right')
  })

  it('runs faster and drains survivor stamina', () => {
    const result = stepExplorationMotion(motion(), { ...idle, right: true, run: true }, 0.05, 1000, 800)

    expect(result.position.x).toBeCloseTo(0.5165, 4)
    expect(result.running).toBe(true)
    expect(result.stamina).toBeCloseTo(98.5)
  })

  it('blocks the survivor at building collision bounds', () => {
    let current = motion({ x: 0.36, y: 0.2 })
    for (let step = 0; step < 20; step += 1) {
      current = stepExplorationMotion(current, { ...idle, right: true }, 0.05, 1000, 800)
    }

    expect(current.position.x).toBeLessThan(0.4)
    expect(current.position.x).toBeGreaterThan(0.35)
  })

  it('keeps the survivor inside the scene and restores stamina while resting', () => {
    const atEdge = motion({ x: 0.02, y: 0.5 }, 40)
    const blocked = stepExplorationMotion(atEdge, { ...idle, left: true }, 0.05, 1000, 800)
    const resting = stepExplorationMotion(atEdge, idle, 0.05, 1000, 800)

    expect(blocked.position.x).toBe(0.02)
    expect(resting.stamina).toBeCloseTo(40.9)
    expect(resting.moving).toBe(false)
  })
})
