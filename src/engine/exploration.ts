import { CHARACTER_IDS } from '../data/characters'
import { LOCATION_IDS } from './config'
import type {
  CharacterId,
  ExplorationFacing,
  ExplorationInput,
  ExplorationMotionState,
  ExplorationState,
  LocationId,
} from '../types/game'

export const MAX_EXPLORATION_STAMINA = 100
export const EXPLORATION_START_POSITION = { x: 0.5, y: 0.82 }
export const WALK_SPEED = 185
export const RUN_SPEED = 330
export const RUN_STAMINA_PER_SECOND = 30
export const STAMINA_REGEN_PER_SECOND = 18

export interface ExplorationObstacle {
  id: string
  x: number
  y: number
  width: number
  height: number
  kind: 'building' | 'debris'
}

/** Static 2D prototype layout in normalized scene coordinates. */
export const EXPLORATION_OBSTACLES: ExplorationObstacle[] = [
  { id: 'northwest-block', x: 0.07, y: 0.12, width: 0.22, height: 0.26, kind: 'building' },
  { id: 'central-block', x: 0.4, y: 0.09, width: 0.2, height: 0.21, kind: 'building' },
  { id: 'northeast-block', x: 0.72, y: 0.13, width: 0.2, height: 0.25, kind: 'building' },
  { id: 'collapsed-wall', x: 0.23, y: 0.51, width: 0.1, height: 0.09, kind: 'debris' },
  { id: 'southwest-block', x: 0.05, y: 0.7, width: 0.17, height: 0.19, kind: 'building' },
  { id: 'southeast-block', x: 0.76, y: 0.68, width: 0.17, height: 0.2, kind: 'building' },
  { id: 'wreckage', x: 0.62, y: 0.48, width: 0.11, height: 0.09, kind: 'debris' },
]

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

export function createInitialExplorationState(): ExplorationState {
  return {
    locationId: null,
    position: null,
    staminaByCharacter: {},
  }
}

function collidesWithScene(x: number, y: number, width: number, height: number, radius: number): boolean {
  if (x < radius || y < radius || x > width - radius || y > height - radius) return true

  return EXPLORATION_OBSTACLES.some((obstacle) => {
    const left = obstacle.x * width
    const top = obstacle.y * height
    const right = left + obstacle.width * width
    const bottom = top + obstacle.height * height
    const closestX = Math.max(left, Math.min(x, right))
    const closestY = Math.max(top, Math.min(y, bottom))
    const distanceX = x - closestX
    const distanceY = y - closestY
    return distanceX * distanceX + distanceY * distanceY < radius * radius
  })
}

export function stepExplorationMotion(
  state: ExplorationMotionState,
  input: ExplorationInput,
  deltaSeconds: number,
  width: number,
  height: number,
): ExplorationMotionState {
  if (width <= 0 || height <= 0) return state

  const delta = Math.max(0, Math.min(deltaSeconds, 0.05))
  const directionX = Number(input.right) - Number(input.left)
  const directionY = Number(input.down) - Number(input.up)
  const magnitude = Math.hypot(directionX, directionY)
  const normalizedX = magnitude > 0 ? directionX / magnitude : 0
  const normalizedY = magnitude > 0 ? directionY / magnitude : 0
  const requestedRun = input.run && magnitude > 0 && state.stamina > 0
  const speed = requestedRun ? RUN_SPEED : WALK_SPEED
  const radius = Math.min(18, Math.min(width, height) * 0.045)
  const currentX = state.position.x * width
  const currentY = state.position.y * height
  const targetX = currentX + normalizedX * speed * delta
  const targetY = currentY + normalizedY * speed * delta
  let nextX = currentX
  let nextY = currentY

  if (!collidesWithScene(targetX, currentY, width, height, radius)) nextX = targetX
  if (!collidesWithScene(nextX, targetY, width, height, radius)) nextY = targetY

  let facing: ExplorationFacing = state.facing
  if (magnitude > 0) facing = Math.abs(directionX) > Math.abs(directionY) ? (directionX > 0 ? 'right' : 'left') : directionY > 0 ? 'down' : 'up'

  const moving = nextX !== currentX || nextY !== currentY
  const running = moving && requestedRun
  const staminaChange = running ? -RUN_STAMINA_PER_SECOND : STAMINA_REGEN_PER_SECOND

  return {
    position: { x: nextX / width, y: nextY / height },
    stamina: Math.max(0, Math.min(MAX_EXPLORATION_STAMINA, state.stamina + staminaChange * delta)),
    facing,
    moving,
    running,
  }
}

export function isExplorationState(value: unknown): value is ExplorationState {
  if (!isRecord(value)) return false

  if (value.locationId !== null && !LOCATION_IDS.includes(value.locationId as LocationId)) return false

  if (value.position !== null) {
    if (
      !isRecord(value.position) ||
      !isFiniteNumber(value.position.x) ||
      !isFiniteNumber(value.position.y) ||
      value.position.x < 0 ||
      value.position.x > 1 ||
      value.position.y < 0 ||
      value.position.y > 1
    ) {
      return false
    }
  }

  if (!isRecord(value.staminaByCharacter)) return false
  return Object.entries(value.staminaByCharacter).every(
    ([characterId, stamina]) =>
      CHARACTER_IDS.includes(characterId as CharacterId) &&
      isFiniteNumber(stamina) &&
      stamina >= 0 &&
      stamina <= MAX_EXPLORATION_STAMINA,
  )
}
