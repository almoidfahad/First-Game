import { useGameStore } from '../store/useGameStore'
import { cx } from './ui'

const TONE: Record<string, string> = {
  info: 'text-slate-400',
  good: 'text-emerald-300',
  bad: 'text-rose-300',
  mystery: 'text-violet-300',
  system: 'text-sky-300',
}

export function LogFeed({ limit = 8 }: { limit?: number }) {
  const state = useGameStore((store) => store.state)
  if (!state) return null
  const entries = state.log.slice(-limit).reverse()

  return (
    <section className="panel overflow-hidden" aria-label="Chronicle">
      <header className="panel-heading">
        <p className="eyebrow">Chronicle</p>
        <span className="text-[0.6rem] uppercase tracking-[0.18em] text-slate-500">Round {state.round}</span>
      </header>
      <ul className="max-h-56 space-y-1.5 overflow-y-auto p-3">
        {entries.length === 0 && <li className="text-xs text-slate-500">The chronicle is empty.</li>}
        {entries.map((entry) => (
          <li key={entry.id} className="flex gap-2 text-xs leading-relaxed">
            <span className="shrink-0 font-mono text-[0.6rem] text-slate-600">R{entry.round}</span>
            <span className={cx(TONE[entry.tone] ?? TONE.info)}>{entry.text}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
