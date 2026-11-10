import { DECISION_MAP } from '../data/cards/decisions'
import { EVENT_MAP } from '../data/cards/events'
import { CLUE_MAP, getClueIdsForScenario, getScenario } from '../data/scenarios'
import { LOCATION_MAP } from '../data/locations'
import { GameShell } from '../components/GameShell'
import { PhaseCard } from '../components/PhaseCard'
import { Badge, Icon, NeonButton, Panel, cx } from '../components/ui'
import { PHASE_LABELS } from '../engine/config'
import { useGameStore } from '../store/useGameStore'
import { describeEffects } from '../utils/describe'

const TONE_STYLES = {
  bold: 'border-sky-400/30 hover:border-sky-400/60',
  cautious: 'border-emerald-400/25 hover:border-emerald-400/55',
  risky: 'border-rose-400/30 hover:border-rose-400/60',
} as const

export default function Story() {
  const state = useGameStore((store) => store.state)
  const choose = useGameStore((store) => store.choose)

  if (!state) return <GameShell active="story">{null}</GameShell>

  const scenario = getScenario(state.scenarioId)
  const event = state.eventCardId ? EVENT_MAP[state.eventCardId] : undefined
  const decision = state.decision ? DECISION_MAP[state.decision.cardId] : undefined
  const clueIds = getClueIdsForScenario(state.scenarioId)
  const discovered = clueIds.filter((id) => state.clueIds.includes(id))
  const resolved = state.decision?.resolved ?? false
  const chosen = decision?.options.find((option) => option.id === state.decision?.chosen)
  const allClues = discovered.length === clueIds.length

  return (
    <GameShell active="story">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <Panel
            eyebrow={`Scenario · ${scenario.codename}`}
            title={scenario.title}
            subtitle={scenario.logline}
            actions={
              <Badge tone="mystery">
                {discovered.length}/{clueIds.length} clues
              </Badge>
            }
          >
            <div className="grid gap-2 sm:grid-cols-3">
              {scenario.leadLocations.map((id) => (
                <span key={id} className="flex items-center gap-1.5 rounded-md border border-white/5 bg-black/20 px-2 py-1.5 text-xs text-slate-300">
                  <Icon name={LOCATION_MAP[id].icon} size={13} style={{ color: LOCATION_MAP[id].accent }} />
                  {LOCATION_MAP[id].name}
                </span>
              ))}
            </div>
          </Panel>

          <Panel eyebrow="Event phase" title={event?.title ?? 'No event drawn'} subtitle={event?.subtitle}>
            {event ? (
              <>
                <p className="text-sm leading-relaxed text-slate-300">{event.text}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {event.effects.map((effect, index) => (
                    <span key={`${effect.kind}-${index}`} className="chip">
                      {describeEffects([effect])}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-500">Advance the round to draw an event.</p>
            )}
          </Panel>

          <Panel
            eyebrow={`${PHASE_LABELS.decision}${state.round ? ` · Round ${state.round}` : ''}`}
            title={decision?.title ?? 'No decision pending'}
            actions={resolved ? <Badge tone="good">Resolved</Badge> : <Badge tone="warn">Awaiting choice</Badge>}
          >
            {decision ? (
              <div className="space-y-3">
                <p className="text-sm leading-relaxed text-slate-300">{decision.prompt}</p>

                {resolved && chosen && (
                  <div className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 p-3">
                    <p className="text-[0.6rem] uppercase tracking-[0.2em] text-emerald-300/80">Your decision</p>
                    <p className="mt-1 text-sm font-semibold text-emerald-100">{chosen.label}</p>
                    <p className="mt-1 text-xs text-emerald-200/80">{describeEffects(chosen.effects)}</p>
                  </div>
                )}

                <ul className="space-y-2">
                  {decision.options.map((option) => {
                    const cost = option.cost ?? {}
                    const unaffordable = Object.entries(cost).some(
                      ([key, amount]) => state.resources[key as keyof typeof state.resources] < Number(amount),
                    )
                    const disabled = resolved || unaffordable || state.phase !== 'decision'
                    return (
                      <li key={option.id}>
                        <button
                          type="button"
                          onClick={() => choose(option.id)}
                          disabled={disabled}
                          className={cx(
                            'w-full rounded-lg border bg-white/[0.02] p-3 text-left transition',
                            TONE_STYLES[option.tone],
                            disabled && 'cursor-not-allowed opacity-50',
                            resolved && chosen?.id === option.id && 'border-emerald-400/60 bg-emerald-500/10 opacity-100',
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-100">{option.label}</p>
                              <p className="mt-1 text-xs leading-relaxed text-slate-400">{option.detail}</p>
                              <p className="mt-1.5 text-[0.66rem] uppercase tracking-[0.12em] text-sky-200/70">
                                {describeEffects(option.effects)}
                              </p>
                              {Object.keys(cost).length > 0 && (
                                <p className="mt-1 text-[0.66rem] uppercase tracking-[0.12em] text-amber-300/80">
                                  Costs{' '}
                                  {Object.entries(cost)
                                    .map(([key, amount]) => `${amount} ${key}`)
                                    .join(', ')}
                                </p>
                              )}
                            </div>
                            <span className="chip shrink-0">{option.tone}</span>
                          </div>
                          {unaffordable && !resolved && (
                            <p className="mt-2 flex items-center gap-1 text-[0.68rem] text-rose-300">
                              <Icon name="AlertTriangle" size={12} /> Not enough resources for this option.
                            </p>
                          )}
                        </button>
                      </li>
                    )
                  })}
                </ul>
                <p className="text-[0.68rem] uppercase tracking-[0.14em] text-slate-500">
                  Every option is deterministic. Consequences apply immediately and persist in the save.
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No decision is active this phase.</p>
            )}
          </Panel>

          <Panel eyebrow="Mystery phase" title="Evidence board">
            <ul className="space-y-2">
              {clueIds.map((clueId) => {
                const clue = CLUE_MAP[clueId]
                const found = state.clueIds.includes(clueId)
                return (
                  <li
                    key={clueId}
                    className={cx(
                      'rounded-lg border p-3',
                      found ? 'border-violet-400/30 bg-violet-500/10' : 'border-white/5 bg-black/20',
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <Icon
                        name={found ? 'Search' : 'Lock'}
                        size={15}
                        className={found ? 'mt-0.5 text-violet-300' : 'mt-0.5 text-slate-500'}
                      />
                      <div className="min-w-0">
                        <p className={cx('text-sm font-semibold', found ? 'text-violet-100' : 'text-slate-400')}>
                          {found ? clue.title : 'Undiscovered evidence'}
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-slate-400">
                          {found
                            ? clue.text
                            : `Investigate ${LOCATION_MAP[clue.locationId].name} to surface this clue.`}
                        </p>
                        <p className="mt-1 text-[0.6rem] uppercase tracking-[0.16em] text-slate-600">
                          {LOCATION_MAP[clue.locationId].name} · progress {state.investigations[clue.locationId] ?? 0}
                        </p>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>

            <div className="mt-3 rounded-lg border border-sky-400/20 bg-sky-500/5 p-3">
              <p className="flex items-center gap-1.5 text-[0.6rem] uppercase tracking-[0.2em] text-sky-300/90">
                <Icon name="Eye" size={12} /> Revelation
              </p>
              {allClues ? (
                <>
                  <p className="mt-1 text-sm leading-relaxed text-slate-200">{scenario.hiddenTruth}</p>
                  <p className="mt-2 text-sm leading-relaxed text-sky-200/90">{scenario.revelation}</p>
                </>
              ) : (
                <p className="mt-1 text-sm text-slate-400">
                  Recover all {clueIds.length} clues to unlock the hidden truth of this scenario.
                </p>
              )}
            </div>
          </Panel>
        </div>

        <div className="space-y-4">
          <PhaseCard />
          <Panel eyebrow="Chronicle" title="What just happened">
            <ul className="max-h-80 space-y-1.5 overflow-y-auto">
              {state.log.slice(-14).reverse().map((entry) => (
                <li key={entry.id} className="flex gap-2 text-xs leading-relaxed">
                  <span className="shrink-0 font-mono text-[0.6rem] text-slate-600">R{entry.round}</span>
                  <span
                    className={cx(
                      entry.tone === 'good'
                        ? 'text-emerald-300'
                        : entry.tone === 'bad'
                          ? 'text-rose-300'
                          : entry.tone === 'mystery'
                            ? 'text-violet-300'
                            : entry.tone === 'system'
                              ? 'text-sky-300'
                              : 'text-slate-400',
                    )}
                  >
                    {entry.text}
                  </span>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel eyebrow="Quick actions" title="Back to work">
            <div className="flex flex-col gap-2">
              <NeonButton icon="Map" full onClick={() => useGameStore.getState().navigate('board')}>
                Open city map
              </NeonButton>
              <NeonButton icon="Users" full onClick={() => useGameStore.getState().navigate('dashboard')}>
                Open survivors
              </NeonButton>
            </div>
          </Panel>
        </div>
      </div>
    </GameShell>
  )
}
