import { useMemo, useState } from 'react'
import { CHARACTERS, CHARACTER_IDS } from '../data/characters'
import { SCENARIOS } from '../data/scenarios'
import { DIFFICULTY_SETTINGS, TOTAL_ROUNDS } from '../engine/config'
import { useGameStore } from '../store/useGameStore'
import type { CharacterId, Difficulty, GameMode, ScenarioId } from '../types/game'
import { CharacterArt } from '../components/CharacterArt'
import { PageShell } from '../components/PageShell'
import { Icon, NeonButton, Panel, cx } from '../components/ui'

const MODES: { id: GameMode; label: string; icon: string; description: string }[] = [
  { id: 'solo', label: 'Solo', icon: 'User', description: 'One survivor, one city, eight rounds.' },
  { id: 'story', label: 'Story', icon: 'BookOpen', description: 'Follow a single mystery to its revelation.' },
  { id: 'local', label: 'Multiplayer', icon: 'Users', description: '2–4 players, pass and play, secret missions.' },
]

const DIFFICULTY_ORDER: Difficulty[] = ['easy', 'normal', 'hard']
const DIFFICULTY_ICON: Record<Difficulty, string> = { easy: 'Shield', normal: 'Compass', hard: 'Skull' }

export default function NewGame() {
  const intentMode = useGameStore((store) => store.intentMode)
  const startNewGame = useGameStore((store) => store.startNewGame)
  const setIntentMode = useGameStore((store) => store.setIntentMode)
  const navigate = useGameStore((store) => store.navigate)

  const initialMode: GameMode = intentMode ?? 'solo'
  const [mode, setMode] = useState<GameMode>(initialMode)
  const [difficulty, setDifficulty] = useState<Difficulty>('normal')
  const [count, setCount] = useState(initialMode === 'local' ? 2 : 1)
  const [scenarioId, setScenarioId] = useState<ScenarioId | 'random'>('random')
  const [seats, setSeats] = useState<CharacterId[]>(CHARACTER_IDS.slice(0, 4))
  const [activeSeat, setActiveSeat] = useState(0)
  const [starting, setStarting] = useState(false)

  const playerCount = mode === 'local' ? count : 1
  const activeCharacters = useMemo(() => seats.slice(0, playerCount), [seats, playerCount])
  const unique = new Set(activeCharacters).size === playerCount

  const chooseMode = (next: GameMode) => {
    setMode(next)
    if (next !== 'local') {
      setCount(1)
      setActiveSeat(0)
    } else {
      setCount((current) => (current < 2 ? 2 : current))
    }
  }

  const assign = (characterId: CharacterId) => {
    setSeats((current) => {
      const next = [...current]
      const existingSeat = next.indexOf(characterId, 0)
      if (existingSeat >= 0 && existingSeat < playerCount) {
        const swap = next[activeSeat]
        next[activeSeat] = characterId
        next[existingSeat] = swap
      } else {
        next[activeSeat] = characterId
      }
      return next
    })
  }

  const start = async () => {
    if (!unique) return
    setStarting(true)
    await startNewGame({
      mode,
      difficulty,
      players: playerCount,
      scenarioId,
      characterIds: activeCharacters,
    })
    setIntentMode(null)
    setStarting(false)
  }

  return (
    <PageShell
      eyebrow="New campaign"
      title="Assemble the last light"
      description={`Every campaign runs ${TOTAL_ROUNDS} rounds across five phases. Choose your mode, your operators and the mystery you want to uncover.`}
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <div className="space-y-4">
          <Panel eyebrow="Step 1" title="Game mode">
            <div className="grid gap-2 sm:grid-cols-3">
              {MODES.map((entry) => {
                const active = mode === entry.id
                return (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => chooseMode(entry.id)}
                    aria-pressed={active}
                    className={cx(
                      'rounded-lg border p-3 text-left transition',
                      active
                        ? 'border-sky-400/60 bg-sky-500/10 shadow-[0_0_22px_-8px_rgba(56,189,248,0.8)]'
                        : 'border-white/10 bg-white/[0.02] hover:border-sky-400/30',
                    )}
                  >
                    <Icon name={entry.icon} size={18} className={active ? 'text-sky-300' : 'text-slate-400'} />
                    <p className="mt-2 text-sm font-semibold text-slate-100">{entry.label}</p>
                    <p className="mt-1 text-[0.68rem] leading-relaxed text-slate-400">{entry.description}</p>
                  </button>
                )
              })}
            </div>
          </Panel>

          <Panel eyebrow="Step 2" title="Difficulty">
            <div className="grid gap-2 sm:grid-cols-3">
              {DIFFICULTY_ORDER.map((entry) => {
                const settings = DIFFICULTY_SETTINGS[entry]
                const active = difficulty === entry
                return (
                  <button
                    key={entry}
                    type="button"
                    onClick={() => setDifficulty(entry)}
                    aria-pressed={active}
                    className={cx(
                      'rounded-lg border p-3 text-left transition',
                      active
                        ? 'border-sky-400/60 bg-sky-500/10'
                        : 'border-white/10 bg-white/[0.02] hover:border-sky-400/30',
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <Icon name={DIFFICULTY_ICON[entry]} size={16} className="text-slate-300" />
                      <span className="text-[0.6rem] uppercase tracking-[0.16em] text-slate-500">
                        {settings.start.food}/{settings.start.water}/{settings.start.energy}/{settings.start.trust}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-slate-100">{settings.label}</p>
                    <p className="mt-1 text-[0.68rem] leading-relaxed text-slate-400">{settings.blurb}</p>
                  </button>
                )
              })}
            </div>
          </Panel>

          <Panel eyebrow="Step 3" title="Number of players" subtitle={mode === 'local' ? '1–4 survivors, shared city' : 'Solo and Story modes always run one survivor'}>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((value) => {
                const disabled = mode !== 'local' && value > 1
                const active = playerCount === value
                return (
                  <button
                    key={value}
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      setCount(value)
                      if (activeSeat >= value) setActiveSeat(value - 1)
                    }}
                    aria-pressed={active}
                    className={cx(
                      'rounded-lg border py-3 text-center text-lg font-bold transition',
                      active
                        ? 'border-sky-400/60 bg-sky-500/15 text-sky-200'
                        : 'border-white/10 bg-white/[0.02] text-slate-300 hover:border-sky-400/30',
                      disabled && 'cursor-not-allowed opacity-35',
                    )}
                  >
                    {value}
                  </button>
                )
              })}
            </div>
          </Panel>

          <Panel eyebrow="Step 4" title="Mystery scenario">
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setScenarioId('random')}
                aria-pressed={scenarioId === 'random'}
                className={cx(
                  'flex w-full items-center justify-between rounded-lg border p-3 text-left transition',
                  scenarioId === 'random'
                    ? 'border-sky-400/60 bg-sky-500/10'
                    : 'border-white/10 bg-white/[0.02] hover:border-sky-400/30',
                )}
              >
                <span>
                  <span className="block text-sm font-semibold text-slate-100">Random scenario</span>
                  <span className="block text-[0.68rem] text-slate-400">
                    The seed decides which truth the city is hiding.
                  </span>
                </span>
                <Icon name="Sparkles" size={16} className="text-sky-300" />
              </button>
              {SCENARIOS.map((scenario) => {
                const active = scenarioId === scenario.id
                return (
                  <button
                    key={scenario.id}
                    type="button"
                    onClick={() => setScenarioId(scenario.id)}
                    aria-pressed={active}
                    className={cx(
                      'flex w-full items-start justify-between gap-3 rounded-lg border p-3 text-left transition',
                      active
                        ? 'border-sky-400/60 bg-sky-500/10'
                        : 'border-white/10 bg-white/[0.02] hover:border-sky-400/30',
                    )}
                  >
                    <span className="min-w-0">
                      <span className="block text-[0.6rem] uppercase tracking-[0.22em]" style={{ color: scenario.accent }}>
                        {scenario.codename}
                      </span>
                      <span className="mt-0.5 block text-sm font-semibold text-slate-100">{scenario.title}</span>
                      <span className="mt-1 block text-[0.68rem] leading-relaxed text-slate-400">{scenario.logline}</span>
                    </span>
                    <span
                      className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ background: scenario.accent, opacity: active ? 1 : 0.4 }}
                    />
                  </button>
                )
              })}
            </div>
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel
            eyebrow="Step 5"
            title="Choose your survivors"
            subtitle={mode === 'local' ? 'Each seat needs a different character.' : 'Your character defines your one real advantage.'}
          >
            {mode === 'local' && (
              <div className="mb-3 flex flex-wrap gap-1.5">
                {Array.from({ length: playerCount }, (_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setActiveSeat(index)}
                    aria-pressed={activeSeat === index}
                    className={cx(
                      'rounded-md border px-2.5 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.12em]',
                      activeSeat === index
                        ? 'border-sky-400/60 bg-sky-500/15 text-sky-200'
                        : 'border-white/10 text-slate-400',
                    )}
                  >
                    Player {index + 1}
                  </button>
                ))}
              </div>
            )}

            <div className="grid gap-2 sm:grid-cols-2">
              {CHARACTERS.map((character) => {
                const assignedSeat = activeCharacters.indexOf(character.id)
                const isActive = assignedSeat === activeSeat
                return (
                  <button
                    key={character.id}
                    type="button"
                    onClick={() => assign(character.id)}
                    aria-pressed={isActive}
                    className={cx(
                      'flex items-start gap-2.5 rounded-lg border p-2.5 text-left transition',
                      isActive
                        ? 'border-sky-400/60 bg-sky-500/10'
                        : assignedSeat >= 0
                          ? 'border-white/10 bg-white/[0.015] opacity-70'
                          : 'border-white/10 bg-white/[0.02] hover:border-sky-400/30',
                    )}
                  >
                    <CharacterArt characterId={character.id} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-1">
                        <span className="block truncate text-sm font-semibold text-slate-100">{character.title}</span>
                        {assignedSeat >= 0 && (
                          <span className="chip border-sky-400/40 px-1.5 py-0 text-[0.55rem] text-sky-200">
                            P{assignedSeat + 1}
                          </span>
                        )}
                      </span>
                      <span className="block truncate text-[0.66rem] text-slate-400">{character.name}</span>
                      <span className="mt-1 block text-[0.62rem] leading-snug text-sky-200/80">
                        {character.ability.name}
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="mt-3 rounded-lg border border-white/5 bg-black/25 p-3">
              {(() => {
                const selected = CHARACTERS.find((character) => character.id === seats[activeSeat])
                if (!selected) return null
                return (
                  <>
                    <p className="text-[0.6rem] uppercase tracking-[0.2em] text-slate-500">Ability briefing</p>
                    <p className="mt-1 text-sm text-slate-200">{selected.ability.description}</p>
                    <p className="mt-1 text-[0.68rem] text-slate-400">{selected.weakness}</p>
                  </>
                )
              })()}
            </div>

            {!unique && (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-rose-300">
                <Icon name="AlertTriangle" size={13} /> Every seat must have a different character.
              </p>
            )}
          </Panel>

          <div className="flex flex-wrap gap-2">
            <NeonButton
              variant="primary"
              size="lg"
              icon="Play"
              loading={starting}
              disabled={!unique}
              onClick={() => void start()}
            >
              Start game
            </NeonButton>
            <NeonButton
              size="lg"
              icon="ChevronLeft"
              onClick={() => {
                setIntentMode(null)
                navigate('menu')
              }}
            >
              Back
            </NeonButton>
          </div>

          <p className="text-xs leading-relaxed text-slate-500">
            Starting resources: {DIFFICULTY_SETTINGS[difficulty].start.food} Food ·{' '}
            {DIFFICULTY_SETTINGS[difficulty].start.water} Water · {DIFFICULTY_SETTINGS[difficulty].start.energy} Energy ·{' '}
            {DIFFICULTY_SETTINGS[difficulty].start.trust} Trust. Each round grants 2 Action Points to every survivor.
          </p>
        </div>
      </div>
    </PageShell>
  )
}
