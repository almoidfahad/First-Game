import { LOCATIONS } from '../data/locations'
import { MAX_INTEGRITY } from '../engine/config'
import type { GameState, LocationId } from '../types/game'
import { Icon, cx } from './ui'

const ROADS = [
  'M16 22 L38 14 L60 19 L82 16',
  'M16 22 L20 45 L34 62 L46 78',
  'M38 14 L54 40 L72 70 L86 80',
  'M82 16 L80 50 L62 55 L54 40',
  'M60 19 L54 40',
  'M34 62 L20 45',
  'M62 55 L80 50',
  'M46 78 L62 55',
  'M72 70 L86 80',
]

function integrityColor(integrity: number): string {
  if (integrity >= 3) return '#22c55e'
  if (integrity === 2) return '#38bdf8'
  if (integrity === 1) return '#fbbf24'
  return '#ef4444'
}

export function CityMap({
  state,
  onSelect,
}: {
  state: GameState
  onSelect: (locationId: LocationId) => void
}) {
  const avg =
    LOCATIONS.reduce((sum, location) => sum + (state.infrastructure[location.id] ?? 0), 0) / LOCATIONS.length

  return (
    <section className="panel overflow-hidden" aria-label="Interactive city map">
      <header className="panel-heading">
        <div>
          <p className="eyebrow">District overview</p>
          <h2 className="text-base font-semibold tracking-wide text-slate-100">The City</h2>
        </div>
        <div className="flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.18em] text-slate-400">
          <span className="chip">
            <Icon name="Cpu" size={12} /> Grid {avg.toFixed(1)}/{MAX_INTEGRITY}
          </span>
          <span className="chip border-emerald-400/30 text-emerald-300">3</span>
          <span className="chip border-sky-400/30 text-sky-300">2</span>
          <span className="chip border-amber-400/30 text-amber-300">1</span>
          <span className="chip border-rose-400/30 text-rose-300">0</span>
        </div>
      </header>

      <div
        className="relative aspect-[16/12] w-full overflow-hidden sm:aspect-[16/9]"
        style={{
          background:
            'radial-gradient(120% 90% at 50% -10%, rgba(56,189,248,0.14) 0%, rgba(5,10,18,0.2) 55%), radial-gradient(60% 60% at 15% 80%, rgba(30,64,175,0.22), transparent 70%), linear-gradient(180deg, #050b14 0%, #04070d 100%)',
        }}
      >
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="road" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.12" />
            </linearGradient>
          </defs>
          <circle cx="88" cy="9" r="4.5" fill="#e2e8f0" opacity="0.07" />
          <circle cx="88" cy="9" r="2.2" fill="#e2e8f0" opacity="0.14" />
          <path
            d="M0 92 C20 86 32 94 50 88 C68 82 82 92 100 85"
            fill="none"
            stroke="#0ea5e9"
            strokeOpacity="0.16"
            strokeWidth="2.4"
            vectorEffect="non-scaling-stroke"
          />
          {ROADS.map((road) => (
            <path
              key={road}
              d={road}
              fill="none"
              stroke="url(#road)"
              strokeWidth="1"
              strokeDasharray="4 6"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {[
            [16, 22],
            [38, 14],
            [60, 19],
            [82, 16],
            [54, 40],
            [72, 70],
            [34, 62],
            [80, 50],
            [46, 78],
            [20, 45],
            [62, 55],
            [86, 80],
          ].map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="6" fill="#38bdf8" opacity="0.05" />
          ))}
        </svg>

        {LOCATIONS.map((location) => {
          const locked = !state.unlocked.includes(location.id)
          const integrity = state.infrastructure[location.id] ?? 0
          const selected = state.selectedLocation === location.id
          const color = locked ? '#475569' : integrityColor(integrity)
          const requirement = location.unlock.clues
            ? `Requires ${location.unlock.clues} clue(s)${location.unlock.round ? ` and round ${location.unlock.round}` : ''}`
            : location.unlock.round
              ? `Opens in round ${location.unlock.round}`
              : ''

          return (
            <button
              key={location.id}
              type="button"
              className="map-node group z-10"
              style={{ left: `${location.position.x}%`, top: `${location.position.y}%`, opacity: locked ? 0.72 : 1 }}
              onClick={() => !locked && onSelect(location.id)}
              disabled={locked}
              aria-label={`${location.name}, ${locked ? `locked. ${requirement}` : `${integrity} of 3 integrity`}`}
              aria-pressed={selected}
              title={locked ? `${location.name} — ${requirement}` : `${location.name} · integrity ${integrity}/${MAX_INTEGRITY}`}
            >
              <span
                className={cx(
                  'relative flex items-center justify-center rounded-lg border bg-[#06101c]/90 transition',
                  'h-8 w-8 sm:h-11 sm:w-11',
                  selected && 'ring-2 ring-offset-2 ring-offset-[#04070d]',
                  !locked && 'group-hover:-translate-y-0.5',
                )}
                style={{
                  borderColor: `${color}88`,
                  boxShadow: selected ? `0 0 20px ${color}99` : `0 0 12px ${color}33`,
                }}
              >
                <Icon
                  name={locked ? 'Lock' : location.icon}
                  size={16}
                  style={{ color: locked ? '#64748b' : color }}
                  className="sm:hidden"
                />
                <Icon
                  name={locked ? 'Lock' : location.icon}
                  size={19}
                  style={{ color: locked ? '#64748b' : color }}
                  className="hidden sm:block"
                />
                {!locked && (
                  <span
                    className="absolute -right-1 -top-1 h-2 w-2 rounded-full border border-[#04070d]"
                    style={{ background: color }}
                  />
                )}
              </span>
              <span
                className={cx(
                  'max-w-[76px] truncate rounded px-1 py-0.5 text-[0.5rem] font-semibold uppercase tracking-[0.08em] sm:max-w-[110px] sm:text-[0.6rem] sm:tracking-[0.12em]',
                  selected ? 'bg-sky-400/20 text-sky-100' : 'bg-black/65 text-slate-300',
                )}
              >
                {location.name}
              </span>
            </button>
          )
        })}

        <div className="pointer-events-none absolute bottom-2 left-3 text-[0.55rem] uppercase tracking-[0.24em] text-slate-600">
          Freight Line Zero · Kessler District
        </div>
      </div>
    </section>
  )
}
