import { LOCATIONS } from '../data/locations'
import { MAX_INTEGRITY } from '../engine/config'
import type { GameState } from '../types/game'
import { Icon } from './ui'

function color(value: number): string {
  if (value >= 3) return '#22c55e'
  if (value === 2) return '#38bdf8'
  if (value === 1) return '#fbbf24'
  return '#ef4444'
}

export function Dataset({ state }: { state: GameState }) {
  const reopened = LOCATIONS.filter((location) => state.unlocked.includes(location.id)).length
  const critical = LOCATIONS.filter((location) => (state.infrastructure[location.id] ?? 0) <= 1).length

  return (
    <section className="panel overflow-hidden" aria-label="City status">
      <header className="panel-heading">
        <div>
          <p className="eyebrow">City status</p>
          <h2 className="text-sm font-semibold text-slate-100">Infrastructure</h2>
        </div>
        <span className="chip border-rose-400/30 text-rose-300">{critical} critical</span>
      </header>
      <div className="space-y-1.5 p-3">
        <p className="text-[0.62rem] uppercase tracking-[0.16em] text-slate-500">
          {reopened} of {LOCATIONS.length} sites accessible
        </p>
        {LOCATIONS.filter((location) => state.unlocked.includes(location.id)).map((location) => {
          const integrity = state.infrastructure[location.id] ?? 0
          return (
            <div key={location.id} className="flex items-center gap-2 text-xs">
              <Icon name={location.icon} size={12} style={{ color: color(integrity) }} />
              <span className="w-28 shrink-0 truncate text-slate-400">{location.name}</span>
              <span className="flex flex-1 gap-0.5" aria-label={`${integrity} of ${MAX_INTEGRITY}`}>
                {[0, 1, 2].map((index) => (
                  <span
                    key={index}
                    className="h-1.5 flex-1 rounded-full"
                    style={{ background: index < integrity ? color(integrity) : 'rgba(148,163,184,0.16)' }}
                  />
                ))}
              </span>
              <span className="w-4 text-right font-mono text-[0.62rem] text-slate-500">{integrity}</span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
