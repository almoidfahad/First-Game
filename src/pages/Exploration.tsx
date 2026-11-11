import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { CHARACTERS } from '../data/characters'
import { LOCATION_MAP } from '../data/locations'
import {
  EXPLORATION_OBSTACLES,
  EXPLORATION_START_POSITION,
  MAX_EXPLORATION_STAMINA,
  stepExplorationMotion,
} from '../engine/exploration'
import { useGameStore } from '../store/useGameStore'
import type { ExplorationFacing, ExplorationMotionState } from '../types/game'
import { GameShell } from '../components/GameShell'
import { Icon, NeonButton, StatBar } from '../components/ui'

const KEY_TO_INPUT: Record<string, string> = {
  w: 'up', arrowup: 'up',
  s: 'down', arrowdown: 'down',
  a: 'left', arrowleft: 'left',
  d: 'right', arrowright: 'right',
  shift: 'run',
}

function drawScene(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  elapsed: number,
  motion: ExplorationMotionState,
  accent: string,
) {
  context.clearRect(0, 0, width, height)
  const sky = context.createLinearGradient(0, 0, 0, height)
  sky.addColorStop(0, '#101d2b')
  sky.addColorStop(0.53, '#121c25')
  sky.addColorStop(1, '#080d13')
  context.fillStyle = sky
  context.fillRect(0, 0, width, height)

  // Wet streets and faint lane markings create depth without image assets.
  context.fillStyle = '#17212a'
  context.fillRect(width * 0.315, 0, width * 0.075, height)
  context.fillRect(width * 0.665, 0, width * 0.075, height)
  context.fillRect(0, height * 0.415, width, height * 0.055)
  context.fillRect(0, height * 0.63, width, height * 0.055)
  context.strokeStyle = 'rgba(148, 163, 184, 0.16)'
  context.lineWidth = 1
  context.setLineDash([12, 15])
  for (const x of [width * 0.352, width * 0.702]) {
    context.beginPath()
    context.moveTo(x, 0)
    context.lineTo(x, height)
    context.stroke()
  }
  for (const y of [height * 0.442, height * 0.657]) {
    context.beginPath()
    context.moveTo(0, y)
    context.lineTo(width, y)
    context.stroke()
  }
  context.setLineDash([])

  // Small pools of reflected light animate slowly across the empty streets.
  for (let index = 0; index < 5; index += 1) {
    const x = ((index * 0.237 + elapsed * 0.003) % 1) * width
    const y = ((index * 0.319 + 0.12) % 1) * height
    context.fillStyle = `rgba(56, 189, 248, ${0.035 + (index % 2) * 0.02})`
    context.beginPath()
    context.ellipse(x, y, 15 + (index % 3) * 8, 2, -0.12, 0, Math.PI * 2)
    context.fill()
  }

  EXPLORATION_OBSTACLES.forEach((obstacle, index) => {
    const x = obstacle.x * width
    const y = obstacle.y * height
    const w = obstacle.width * width
    const h = obstacle.height * height
    if (obstacle.kind === 'debris') {
      context.fillStyle = '#34383a'
      context.fillRect(x, y, w, h)
      context.strokeStyle = 'rgba(251, 191, 36, 0.45)'
      context.strokeRect(x, y, w, h)
      context.strokeStyle = 'rgba(15, 23, 32, 0.8)'
      for (let piece = 1; piece < 4; piece += 1) {
        context.beginPath()
        context.moveTo(x + (w * piece) / 4, y + 3)
        context.lineTo(x + (w * (piece - 1)) / 4, y + h - 3)
        context.stroke()
      }
      return
    }

    context.fillStyle = '#222b32'
    context.fillRect(x, y, w, h)
    context.fillStyle = '#182128'
    context.fillRect(x + 5, y + 5, Math.max(0, w - 10), Math.max(0, h - 10))
    context.strokeStyle = 'rgba(148, 163, 184, 0.2)'
    context.lineWidth = 2
    context.strokeRect(x + 1, y + 1, w - 2, h - 2)
    const columns = Math.max(2, Math.floor(w / 28))
    const rows = Math.max(2, Math.floor(h / 24))
    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        const lit = (row * 7 + column * 3 + index) % 5 === 0
        context.fillStyle = lit ? 'rgba(251, 191, 36, 0.52)' : 'rgba(100, 116, 139, 0.18)'
        context.fillRect(x + 10 + column * ((w - 22) / columns), y + 10 + row * ((h - 20) / rows), 5, 6)
      }
    }
    context.fillStyle = 'rgba(0, 0, 0, 0.22)'
    context.fillRect(x + w * 0.46, y + h - 16, w * 0.12, 16)
  })

  const x = motion.position.x * width
  const y = motion.position.y * height
  const phase = motion.moving ? elapsed * (motion.running ? 17 : 11) : elapsed * 1.8
  const stride = motion.moving ? Math.sin(phase) * (motion.running ? 7 : 4.5) : Math.sin(phase) * 1.2
  const bob = motion.moving ? Math.abs(Math.sin(phase)) * (motion.running ? 2.8 : 1.7) : Math.sin(phase) * 0.7
  const angle: Record<ExplorationFacing, number> = { down: 0, right: Math.PI / 2, up: Math.PI, left: -Math.PI / 2 }

  context.save()
  context.translate(x, y)
  context.fillStyle = 'rgba(0, 0, 0, 0.45)'
  context.beginPath()
  context.ellipse(0, 2, 14, 6, 0, 0, Math.PI * 2)
  context.fill()
  context.rotate(angle[motion.facing])
  context.translate(0, -bob)
  context.lineCap = 'round'
  context.lineJoin = 'round'
  context.strokeStyle = '#172330'
  context.lineWidth = 5
  context.beginPath()
  context.moveTo(-4, 10)
  context.lineTo(-5 - stride, 18)
  context.moveTo(4, 10)
  context.lineTo(5 + stride, 18)
  context.stroke()
  context.strokeStyle = '#a7b5c5'
  context.lineWidth = 2.5
  context.beginPath()
  context.moveTo(-5 - stride, 18)
  context.lineTo(-8 - stride, 19)
  context.moveTo(5 + stride, 18)
  context.lineTo(8 + stride, 19)
  context.stroke()
  context.fillStyle = accent
  context.shadowColor = accent
  context.shadowBlur = 12
  context.beginPath()
  context.roundRect(-7, -1, 14, 14, 5)
  context.fill()
  context.shadowBlur = 0
  context.strokeStyle = '#8b98a7'
  context.lineWidth = 3
  context.beginPath()
  context.moveTo(-7, 2)
  context.lineTo(-10 + stride * 0.45, 9)
  context.moveTo(7, 2)
  context.lineTo(10 - stride * 0.45, 9)
  context.stroke()
  context.fillStyle = '#d9c4a4'
  context.beginPath()
  context.arc(0, -8, 6, 0, Math.PI * 2)
  context.fill()
  context.fillStyle = '#273341'
  context.beginPath()
  context.arc(0, -10, 6, Math.PI, 0)
  context.fill()
  context.restore()

  // Soft vignette keeps the survivor legible against the scene.
  const vignette = context.createRadialGradient(width / 2, height / 2, height * 0.18, width / 2, height / 2, width * 0.72)
  vignette.addColorStop(0, 'rgba(0, 0, 0, 0)')
  vignette.addColorStop(1, 'rgba(0, 0, 0, 0.38)')
  context.fillStyle = vignette
  context.fillRect(0, 0, width, height)
}

export default function Exploration() {
  const state = useGameStore((store) => store.state)
  const saveSnapshot = useGameStore((store) => store.saveExplorationSnapshot)
  const navigate = useGameStore((store) => store.navigate)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const keyboardRef = useRef(new Set<string>())
  const touchRef = useRef(new Map<number, string>())
  const pausedRef = useRef(false)
  const [paused, setPaused] = useState(false)
  const [stamina, setStamina] = useState(MAX_EXPLORATION_STAMINA)

  const player = state?.players[state.activePlayer]
  const character = CHARACTERS.find((entry) => entry.id === player?.characterId)
  const locationId = state?.exploration.locationId ?? state?.selectedLocation ?? state?.unlocked[0] ?? null
  const location = locationId ? LOCATION_MAP[locationId] : null
  const staminaValue = player && state ? state.exploration.staminaByCharacter[player.characterId] : undefined

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context || !location || !player) return

    let frame = 0
    let lastFrame = 0
    let lastHudUpdate = 0
    let lastSave = 0
    let elapsed = 0
    let width = 0
    let height = 0
    let disposed = false
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    const motion: ExplorationMotionState = {
      position: state?.exploration.position ?? EXPLORATION_START_POSITION,
      stamina: staminaValue ?? MAX_EXPLORATION_STAMINA,
      facing: 'down',
      moving: false,
      running: false,
    }
    let savedPosition = { ...motion.position }
    let savedStamina = motion.stamina

    const resize = () => {
      const bounds = canvas.getBoundingClientRect()
      width = Math.max(1, bounds.width)
      height = Math.max(1, bounds.height)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null
    observer?.observe(canvas)
    if (!observer) window.addEventListener('resize', resize)

    const hasChanged = () =>
      Math.abs(motion.position.x - savedPosition.x) > 0.0002
      || Math.abs(motion.position.y - savedPosition.y) > 0.0002
      || Math.abs(motion.stamina - savedStamina) >= 0.2

    const persist = () => {
      if (!hasChanged()) return
      savedPosition = { ...motion.position }
      savedStamina = motion.stamina
      saveSnapshot(motion.position, motion.stamina)
    }

    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      if (key === 'escape') {
        pausedRef.current = !pausedRef.current
        setPaused(pausedRef.current)
        keyboardRef.current.clear()
        return
      }
      const input = KEY_TO_INPUT[key]
      if (input) {
        event.preventDefault()
        keyboardRef.current.add(input)
      }
    }
    const onKeyUp = (event: KeyboardEvent) => {
      const input = KEY_TO_INPUT[event.key.toLowerCase()]
      if (input) keyboardRef.current.delete(input)
    }
    const clearInputs = () => {
      keyboardRef.current.clear()
      touchRef.current.clear()
    }
    const onVisibility = () => {
      if (document.hidden) clearInputs()
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', clearInputs)
    document.addEventListener('visibilitychange', onVisibility)

    const tick = (now: number) => {
      if (disposed) return
      const delta = lastFrame ? Math.min((now - lastFrame) / 1000, 0.05) : 0
      lastFrame = now
      elapsed += delta
      if (!pausedRef.current && !document.hidden) {
        const pressed = new Set([...keyboardRef.current, ...touchRef.current.values()])
        const result = stepExplorationMotion(
          motion,
          {
            up: pressed.has('up'),
            down: pressed.has('down'),
            left: pressed.has('left'),
            right: pressed.has('right'),
            run: pressed.has('run'),
          },
          delta,
          width,
          height,
        )
        Object.assign(motion, result)
        if (now - lastHudUpdate > 160) {
          lastHudUpdate = now
          setStamina(Math.round(motion.stamina))
        }
        if (now - lastSave > 1000) {
          lastSave = now
          persist()
        }
      }
      drawScene(context, width, height, elapsed, motion, character?.portrait.accent ?? location.accent)
      frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)

    return () => {
      disposed = true
      window.cancelAnimationFrame(frame)
      observer?.disconnect()
      if (!observer) window.removeEventListener('resize', resize)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', clearInputs)
      document.removeEventListener('visibilitychange', onVisibility)
      persist()
    }
  }, [location, player?.characterId, saveSnapshot])

  const togglePause = () => {
    pausedRef.current = !pausedRef.current
    setPaused(pausedRef.current)
    keyboardRef.current.clear()
    touchRef.current.clear()
  }

  const pressTouch = (event: ReactPointerEvent<HTMLButtonElement>, input: string) => {
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    touchRef.current.set(event.pointerId, input)
  }
  const releaseTouch = (event: ReactPointerEvent<HTMLButtonElement>) => {
    touchRef.current.delete(event.pointerId)
  }
  const touchButton = (label: string, input: string, icon: string, className: string) => (
    <button
      key={input}
      type="button"
      aria-label={label}
      onPointerDown={(event) => pressTouch(event, input)}
      onPointerUp={releaseTouch}
      onPointerCancel={releaseTouch}
      onLostPointerCapture={releaseTouch}
      className={`flex h-12 w-12 touch-none items-center justify-center rounded-xl border border-white/20 bg-slate-950/75 text-slate-100 shadow-lg backdrop-blur active:border-sky-300 active:bg-sky-400/25 ${className}`}
    >
      <Icon name={icon} size={19} />
    </button>
  )

  if (!state || !location || !player) return <GameShell active="exploration">{null}</GameShell>

  return (
    <GameShell active="exploration">
      <div className="mx-auto max-w-5xl space-y-3">
        <section className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-black/25 p-3 sm:p-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5" style={{ color: location.accent }}>
            <Icon name={location.icon} size={19} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[0.62rem] uppercase tracking-[0.2em] text-slate-500">Real-time exploration</p>
            <h1 className="truncate text-lg font-semibold text-slate-100">{location.name}</h1>
            <p className="text-xs text-slate-400">{character?.name ?? player.id} · walking is free</p>
          </div>
          <div className="w-full sm:w-48">
            <StatBar label="Stamina" value={stamina} max={MAX_EXPLORATION_STAMINA} color="#a3e635" icon="Zap" />
          </div>
          <NeonButton size="sm" icon={paused ? 'Play' : 'Pause'} onClick={togglePause}>
            {paused ? 'Resume' : 'Pause'}
          </NeonButton>
          <NeonButton size="sm" icon="Map" onClick={() => navigate('board')}>
            City board
          </NeonButton>
        </section>

        <div className="relative overflow-hidden rounded-2xl border border-sky-300/20 bg-[#080d13] shadow-[0_22px_70px_-35px_rgba(56,189,248,0.55)]">
          <canvas
            ref={canvasRef}
            aria-label={`Real-time 2D exploration at ${location.name}. Use WASD or arrow keys to move, Shift to run.`}
            className="block aspect-[4/3] max-h-[68vh] w-full touch-none sm:aspect-[16/9]"
          />
          <div className="pointer-events-none absolute left-3 top-3 flex flex-wrap gap-1.5">
            <span className="rounded-md border border-white/10 bg-black/50 px-2 py-1 text-[0.6rem] uppercase tracking-[0.15em] text-slate-300">{paused ? 'Paused' : 'Live'}</span>
            <span className="rounded-md border border-white/10 bg-black/50 px-2 py-1 text-[0.6rem] uppercase tracking-[0.15em] text-slate-400">{location.tagline}</span>
          </div>

          <div className="absolute bottom-3 left-3 grid grid-cols-3 gap-1 sm:hidden" aria-label="Touch movement controls">
            <span />
            {touchButton('Move up', 'up', 'ChevronUp', '')}
            <span />
            {touchButton('Move left', 'left', 'ChevronLeft', '')}
            {touchButton('Move down', 'down', 'ChevronDown', '')}
            {touchButton('Move right', 'right', 'ChevronRight', '')}
          </div>
          <button
            type="button"
            aria-label="Hold to run"
            onPointerDown={(event) => pressTouch(event, 'run')}
            onPointerUp={releaseTouch}
            onPointerCancel={releaseTouch}
            onLostPointerCapture={releaseTouch}
            className="absolute bottom-5 right-5 flex h-14 w-14 touch-none items-center justify-center rounded-full border border-lime-300/40 bg-slate-950/75 text-lime-200 shadow-lg backdrop-blur active:bg-lime-400/25 sm:hidden"
          >
            <Icon name="Zap" size={21} />
          </button>
          {paused && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/45 backdrop-blur-[2px]">
              <button type="button" onClick={togglePause} className="rounded-xl border border-sky-300/40 bg-slate-950/90 px-6 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-sky-100">
                Resume exploration
              </button>
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-[0.68rem] text-slate-500">
          <p className="hidden sm:block">Move: WASD / arrows <span className="mx-1 text-slate-700">·</span> Run: hold Shift <span className="mx-1 text-slate-700">·</span> Pause: Esc</p>
          <p className="sm:hidden">Touch the direction pad to move. Hold the bolt to run.</p>
          <p>Running uses survivor stamina. Position and stamina autosave on this device.</p>
        </div>
      </div>
    </GameShell>
  )
}
