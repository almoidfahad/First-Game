import { PHASE_LABELS, RESOURCE_KEYS, RESOURCE_META, TOTAL_ROUNDS } from '../engine/config'
import { useGameStore } from '../store/useGameStore'
import type { ResourceKey } from '../types/game'
import { Icon, IconButton } from './ui'

function ResourceChip({ resource, value }: { resource: ResourceKey; value: number }) {
  const meta = RESOURCE_META[resource]
  return (
    <span
      className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-black/30 px-2 py-1"
      title={`${meta.label}: ${value} of ${meta.cap}`}
    >
      <Icon name={meta.icon} size={13} style={{ color: meta.accent }} />
      <span className="min-w-[1ch] text-sm font-semibold tabular-nums text-slate-100">{value}</span>
    </span>
  )
}

export function Hud() {
  const state = useGameStore((store) => store.state)
  const navigate = useGameStore((store) => store.navigate)
  if (!state) return null

  return (
    <header className="sticky top-0 z-30 border-b border-sky-400/10 bg-[#050a12]/90 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-2 px-3 py-2 sm:gap-3 sm:px-5">
        <button
          type="button"
          onClick={() => navigate('menu')}
          className="group flex items-center gap-2 text-left"
          aria-label="Return to main menu"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-sky-400/30 bg-sky-500/10 text-sky-300">
            <Icon name="Moon" size={16} />
          </span>
          <span className="hidden sm:block">
            <span className="block text-[0.62rem] font-bold uppercase tracking-[0.28em] text-sky-200/70">
              Shadow City
            </span>
            <span className="block text-[0.6rem] uppercase tracking-[0.2em] text-slate-500">The Last Light</span>
          </span>
        </button>

        <div className="flex items-center gap-1.5">
          <span className="chip" aria-label={`Round ${state.round} of ${TOTAL_ROUNDS}`}>
            Round {String(state.round).padStart(2, '0')}/{TOTAL_ROUNDS}
          </span>
          <span className="chip border-sky-400/30 text-sky-200">{PHASE_LABELS[state.phase]}</span>
        </div>

        <div className="ml-auto flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {RESOURCE_KEYS.map((resource) => (
            <ResourceChip key={resource} resource={resource} value={state.resources[resource]} />
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="chip hidden border-violet-400/30 text-violet-200 sm:inline-flex">
            {state.players.length}P · {state.difficulty}
          </span>
          <IconButton label="Settings and saves" icon="Settings" onClick={() => navigate('settings')} />
        </div>
      </div>
    </header>
  )
}
