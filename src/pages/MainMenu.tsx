import { useState } from 'react'
import { CONTENT_STATS } from '../data'
import { audio } from '../services/audio'
import { useGameStore } from '../store/useGameStore'
import type { GameMode } from '../types/game'
import { Badge, Icon, Modal, NeonButton } from '../components/ui'

function Skyline() {
  const buildings = [
    { x: 0, w: 34, h: 150 },
    { x: 30, w: 20, h: 210 },
    { x: 48, w: 26, h: 120 },
    { x: 70, w: 18, h: 180 },
    { x: 86, w: 30, h: 140 },
    { x: 112, w: 22, h: 230 },
    { x: 132, w: 28, h: 165 },
    { x: 158, w: 18, h: 205 },
    { x: 174, w: 34, h: 130 },
    { x: 206, w: 24, h: 190 },
    { x: 228, w: 30, h: 150 },
    { x: 256, w: 20, h: 220 },
    { x: 274, w: 34, h: 135 },
    { x: 306, w: 26, h: 175 },
    { x: 330, w: 32, h: 115 },
    { x: 360, w: 22, h: 200 },
    { x: 380, w: 40, h: 145 },
  ]

  return (
    <svg
      viewBox="0 0 420 240"
      preserveAspectRatio="xMidYMax slice"
      className="h-full w-full"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="skyline-far" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0b1c2e" />
          <stop offset="100%" stopColor="#04070d" />
        </linearGradient>
        <linearGradient id="skyline-near" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#050b14" />
          <stop offset="100%" stopColor="#020409" />
        </linearGradient>
        <radialGradient id="moon-glow">
          <stop offset="0%" stopColor="#e2f3ff" stopOpacity="0.85" />
          <stop offset="45%" stopColor="#7dd3fc" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="330" cy="52" r="70" fill="url(#moon-glow)" />
      <circle cx="330" cy="52" r="18" fill="#dbeafe" opacity="0.5" />
      <circle cx="330" cy="52" r="27" fill="none" stroke="#e0f2fe" strokeOpacity="0.2" />
      {buildings.map((building, index) => (
        <g key={building.x}>
          <rect
            x={building.x}
            y={240 - building.h}
            width={building.w}
            height={building.h}
            fill={index % 3 === 0 ? 'url(#skyline-near)' : 'url(#skyline-far)'}
            stroke="#1e3a5f"
            strokeOpacity="0.35"
            strokeWidth="0.6"
          />
          {Array.from({ length: Math.floor(building.h / 26) }, (_, row) =>
            Array.from({ length: Math.max(1, Math.floor(building.w / 12)) }, (_, col) => {
              const lit = (row * 7 + col * 3 + index) % 5 === 0
              return (
                <rect
                  key={`${row}-${col}`}
                  x={building.x + 4 + col * 11}
                  y={240 - building.h + 8 + row * 24}
                  width="3"
                  height="5"
                  fill={lit ? '#7dd3fc' : '#0f2233'}
                  opacity={lit ? 0.75 : 0.6}
                />
              )
            }),
          )}
        </g>
      ))}
      <path d="M0 240 L420 240 L420 236 L0 236 Z" fill="#0ea5e9" opacity="0.1" />
    </svg>
  )
}

export default function MainMenu() {
  const navigate = useGameStore((store) => store.navigate)
  const saves = useGameStore((store) => store.saves)
  const continueGame = useGameStore((store) => store.continueGame)
  const setIntentMode = useGameStore((store) => store.setIntentMode)
  const [quitOpen, setQuitOpen] = useState(false)
  const [starting, setStarting] = useState(false)

  const autosave = saves.find((save) => save.id === 'autosave')
  const newest = autosave ?? saves[0]

  const quickStart = async (mode: GameMode) => {
    setIntentMode(mode)
    navigate('new-game')
  }

  const resume = async () => {
    setStarting(true)
    await continueGame()
    setStarting(false)
  }

  return (
    <div className="relative z-10 flex min-h-screen flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <Skyline />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_50%_at_50%_20%,rgba(56,189,248,0.14),transparent_70%)]" />

      <main id="main" className="relative mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-5 py-10">
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <Badge tone="mystery">Offline ready</Badge>
            <Badge>{CONTENT_STATS.totalCards} cards</Badge>
            <Badge tone="good">v1.0</Badge>
          </div>
          <h1 className="display-title text-[3.4rem] leading-[0.85] text-slate-50 sm:text-[5.2rem]">
            <span className="block bg-gradient-to-b from-white via-slate-200 to-slate-500 bg-clip-text text-transparent drop-shadow-[0_0_28px_rgba(56,189,248,0.25)]">
              Shadow City
            </span>
            <span className="mt-3 block text-[0.72rem] tracking-[0.62em] text-sky-300/80 sm:text-base sm:tracking-[0.7em]">
              The Last Light
            </span>
          </h1>
          <p className="mt-5 text-[0.7rem] uppercase tracking-[0.42em] text-slate-400 sm:text-xs">
            Make decisions · Uncover the truth · Survive the darkness
          </p>
          <p className="mt-2 text-[0.62rem] uppercase tracking-[0.3em] text-slate-600">
            A strategy · mystery · survival game
          </p>
        </div>

        <div className="w-full max-w-sm space-y-2.5">
          <NeonButton
            variant="primary"
            size="lg"
            full
            icon="Play"
            onClick={() => {
              audio.play('confirm')
              void quickStart('solo')
            }}
          >
            New Game
          </NeonButton>

          <NeonButton
            size="lg"
            full
            icon="RotateCcw"
            onClick={() => void resume()}
            disabled={saves.length === 0}
            loading={starting}
            title={saves.length === 0 ? 'No saved campaign yet' : 'Continue from the latest save'}
          >
            Continue Game
          </NeonButton>
          {newest && (
            <p className="text-center text-[0.62rem] uppercase tracking-[0.2em] text-slate-500">
              Round {newest.round} · {newest.players}P · {newest.difficulty} ·{' '}
              {new Date(newest.updatedAt).toLocaleDateString()}
            </p>
          )}

          <div className="grid grid-cols-2 gap-2.5">
            <NeonButton icon="BookOpen" onClick={() => void quickStart('story')}>
              Story Mode
            </NeonButton>
            <NeonButton icon="Users" onClick={() => void quickStart('local')}>
              Multiplayer
            </NeonButton>
            <NeonButton icon="Package" onClick={() => navigate('library')}>
              Card Library
            </NeonButton>
            <NeonButton icon="FileText" onClick={() => navigate('rules')}>
              Game Rules
            </NeonButton>
            <NeonButton icon="Save" onClick={() => navigate('saves')}>
              Save Slots
            </NeonButton>
            <NeonButton icon="Settings" onClick={() => navigate('settings')}>
              Settings
            </NeonButton>
          </div>

          <NeonButton variant="ghost" full icon="LogOut" onClick={() => setQuitOpen(true)}>
            Quit
          </NeonButton>
        </div>

        {!autosave && (
          <p className="mt-5 max-w-sm text-center text-xs leading-relaxed text-slate-500">
            No campaign on this device yet. Every campaign autosaves locally — no account, no server, no network
            required.
          </p>
        )}
      </main>

      <footer className="relative mx-auto flex w-full max-w-4xl flex-wrap items-center justify-center gap-3 px-5 pb-6 text-[0.58rem] uppercase tracking-[0.26em] text-slate-600">
        <span className="flex items-center gap-1.5">
          <Icon name="Cpu" size={11} /> Offline-first PWA
        </span>
        <span className="text-slate-700">·</span>
        <span>Version 1.0</span>
        <span className="text-slate-700">·</span>
        <span className="flex items-center gap-1.5">
          <Icon name="Users" size={11} /> 1–4 players
        </span>
        <span className="text-slate-700">·</span>
        <span>{CONTENT_STATS.scenarios} scenarios · 3 endings</span>
      </footer>

      <Modal
        open={quitOpen}
        onClose={() => setQuitOpen(false)}
        title="Leave the city?"
        subtitle="Your campaign is autosaved to this device."
        footer={
          <>
            <NeonButton onClick={() => setQuitOpen(false)}>Stay in game</NeonButton>
            <NeonButton
              variant="danger"
              icon="LogOut"
              onClick={() => {
                window.close()
                window.setTimeout(() => {
                  document.body.innerHTML =
                    '<main style="min-height:100vh;display:grid;place-items:center;background:#04060b;color:#94a3b8;font-family:system-ui;text-align:center;padding:2rem"><div><h1 style="color:#e2e8f0;letter-spacing:.3em;font-size:1rem;text-transform:uppercase">Shadow City closed</h1><p style="margin-top:.75rem;font-size:.85rem">Your progress is saved locally. You can close this tab.</p></div></main>'
                }, 120)
              }}
            >
              Close window
            </NeonButton>
          </>
        }
      >
        <p className="text-sm text-slate-300">
          The autosave slot was written after your last action. Manual save slots are untouched, so nothing is lost
          either way.
        </p>
      </Modal>
    </div>
  )
}
