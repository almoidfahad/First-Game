import { useMemo, useState } from 'react'
import { CARD_LIBRARY, CONTENT_STATS, type CardCategory, type LibraryCard } from '../data'
import { PageShell } from '../components/PageShell'
import { Badge, Icon, Modal, NeonButton, cx } from '../components/ui'

const CATEGORIES: Array<CardCategory | 'All'> = [
  'All',
  'Character',
  'Event',
  'Mystery',
  'Decision',
  'Mission',
  'Item',
]

export default function CardLibrary() {
  const [category, setCategory] = useState<CardCategory | 'All'>('All')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<LibraryCard | null>(null)

  const cards = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return CARD_LIBRARY.filter((card) => {
      const inCategory = category === 'All' || card.category === category
      const haystack = `${card.title} ${card.subtitle} ${card.description} ${card.detail}`.toLowerCase()
      return inCategory && (!needle || haystack.includes(needle))
    })
  }, [category, query])

  const countFor = (entry: CardCategory | 'All') =>
    entry === 'All' ? CARD_LIBRARY.length : CARD_LIBRARY.filter((card) => card.category === entry).length

  return (
    <PageShell
      eyebrow="Archive"
      title="Card library"
      description={`Every card in the game — ${CONTENT_STATS.totalCards} entries built from the same data the engine plays with.`}
      wide
      actions={<Badge tone="mystery">{cards.length} shown</Badge>}
    >
      <div className="panel mb-4 p-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {CATEGORIES.map((entry) => (
            <button
              key={entry}
              type="button"
              onClick={() => setCategory(entry)}
              aria-pressed={category === entry}
              className={cx(
                'rounded-md border px-2.5 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.12em] transition',
                category === entry
                  ? 'border-sky-400/60 bg-sky-500/15 text-sky-200'
                  : 'border-white/10 text-slate-400 hover:border-sky-400/30',
              )}
            >
              {entry} <span className="text-slate-500">{countFor(entry)}</span>
            </button>
          ))}
          <label className="ml-auto flex min-w-[180px] flex-1 items-center gap-2 rounded-md border border-white/10 bg-black/30 px-2 py-1.5 sm:max-w-xs">
            <Icon name="Search" size={14} className="text-slate-500" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search cards…"
              aria-label="Search cards"
              className="w-full bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-600"
            />
            {query && (
              <button type="button" onClick={() => setQuery('')} aria-label="Clear search" className="text-slate-500 hover:text-slate-200">
                <Icon name="X" size={14} />
              </button>
            )}
          </label>
        </div>
      </div>

      {cards.length === 0 ? (
        <div className="panel p-8 text-center">
          <p className="text-sm text-slate-400">No cards match “{query}”.</p>
          <NeonButton className="mt-3" icon="RotateCcw" onClick={() => { setQuery(''); setCategory('All') }}>
            Reset filters
          </NeonButton>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {cards.map((card) => (
            <button
              key={card.id}
              type="button"
              onClick={() => setSelected(card)}
              className="card-surface group flex h-full flex-col p-3 text-left"
              aria-label={`${card.category}: ${card.title}`}
            >
              <span className="flex items-center justify-between gap-2">
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-lg border"
                  style={{ borderColor: `${card.accent}55`, background: `${card.accent}12`, color: card.accent }}
                >
                  <Icon name={card.icon} size={16} />
                </span>
                <span className="text-[0.55rem] uppercase tracking-[0.18em] text-slate-500">{card.category}</span>
              </span>
              <span className="mt-2 block text-sm font-semibold leading-snug text-slate-100">{card.title}</span>
              <span className="mt-0.5 block text-[0.66rem] uppercase tracking-[0.12em] text-slate-500">
                {card.subtitle}
              </span>
              <span className="mt-2 line-clamp-3 flex-1 text-xs leading-relaxed text-slate-400">{card.description}</span>
              <span className="mt-2 flex items-center justify-between border-t border-white/5 pt-2 text-[0.6rem] uppercase tracking-[0.14em] text-slate-600">
                {card.rarity ?? 'Standard'}
                <Icon name="ChevronRight" size={12} className="transition group-hover:translate-x-0.5" />
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          ['Characters', CONTENT_STATS.characters],
          ['Events', CONTENT_STATS.events],
          ['Mystery clues', CONTENT_STATS.mysteries],
          ['Decisions', CONTENT_STATS.decisions],
          ['Missions', CONTENT_STATS.missions],
          ['Items', CONTENT_STATS.items],
          ['Scenarios', CONTENT_STATS.scenarios],
          ['Total cards', CONTENT_STATS.totalCards],
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded-lg border border-white/5 bg-black/20 p-2.5 text-center">
            <p className="text-lg font-bold text-slate-100">{value}</p>
            <p className="text-[0.58rem] uppercase tracking-[0.16em] text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.title ?? ''}
        subtitle={selected ? `${selected.category} · ${selected.subtitle}` : undefined}
        wide
        footer={<NeonButton onClick={() => setSelected(null)}>Close</NeonButton>}
      >
        {selected && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span
                className="flex h-14 w-14 items-center justify-center rounded-xl border"
                style={{ borderColor: `${selected.accent}55`, background: `${selected.accent}12`, color: selected.accent }}
              >
                <Icon name={selected.icon} size={24} />
              </span>
              <div>
                <p className="text-[0.6rem] uppercase tracking-[0.24em] text-slate-500">{selected.category}</p>
                <p className="text-sm font-semibold text-slate-100">{selected.subtitle}</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-slate-300">{selected.description}</p>
            <div className="rounded-lg border border-white/5 bg-black/25 p-3 text-xs leading-relaxed text-slate-400">
              {selected.detail}
            </div>
            {selected.rarity && <Badge tone="warn">Rarity: {selected.rarity}</Badge>}
          </div>
        )}
      </Modal>
    </PageShell>
  )
}
