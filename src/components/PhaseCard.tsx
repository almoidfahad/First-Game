import { DECISION_MAP } from '../data/cards/decisions'
import { EVENT_MAP } from '../data/cards/events'
import { getClueIdsForScenario, CLUE_MAP } from '../data/scenarios'
import { AP_PER_ROUND, PHASE_BRIEFS, PHASE_LABELS, PHASE_ORDER } from '../engine/config'
import { useGameStore } from '../store/useGameStore'
import { describeEffects } from '../utils/describe'
import type { Phase } from '../types/game'
import { Badge, Icon, NeonButton, Panel, cx } from './ui'

export function PhaseTracker({ current }: { current: Phase }) {
  const index = PHASE_ORDER.indexOf(current)
  return (
    <ol className="flex items-center gap-1" aria-label="Round phases">
      {PHASE_ORDER.map((phase, position) => {
        const done = index >= 0 && position < index
        const active = phase === current
        return (
          <li key={phase} className="flex flex-1 items-center gap-1">
            <span
              className={cx(
                'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[0.6rem] font-bold',
                active
                  ? 'border-sky-400 bg-sky-400/20 text-sky-200 shadow-[0_0_14px_rgba(56,189,248,0.5)]'
                  : done
                    ? 'border-emerald-400/50 bg-emerald-500/15 text-emerald-300'
                    : 'border-white/10 bg-white/[0.02] text-slate-500',
              )}
              title={PHASE_LABELS[phase]}
            >
              {done ? <Icon name="Check" size={11} /> : position + 1}
            </span>
            {position < PHASE_ORDER.length - 1 && (
              <span className={cx('h-px flex-1', done ? 'bg-emerald-400/40' : 'bg-white/10')} />
            )}
          </li>
        )
      })}
    </ol>
  )
}

export function PhaseCard() {
  const state = useGameStore((store) => store.state)
  const advance = useGameStore((store) => store.advance)
  const navigate = useGameStore((store) => store.navigate)
  const endPlayerTurn = useGameStore((store) => store.endPlayerTurn)

  if (!state) return null

  const player = state.players[state.activePlayer]
  const event = state.eventCardId ? EVENT_MAP[state.eventCardId] : undefined
  const decision = state.decision ? DECISION_MAP[state.decision.cardId] : undefined
  const chosen = decision?.options.find((option) => option.id === state.decision?.chosen)
  const totalClues = getClueIdsForScenario(state.scenarioId).length

  return (
    <Panel
      eyebrow={PHASE_LABELS[state.phase]}
      title={`Round ${state.round} — ${PHASE_BRIEFS[state.phase]}`}
      actions={<Badge tone="mystery">{state.clueIds.length}/{totalClues} clues</Badge>}
      bodyClassName="space-y-3"
    >
      <PhaseTracker current={state.phase} />

      {state.phase === 'event' && event && (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-slate-100">{event.title}</h3>
            <Badge tone={event.alert === 'critical' ? 'bad' : event.alert === 'warning' ? 'warn' : 'good'}>
              {event.alert}
            </Badge>
          </div>
          <p className="text-xs leading-relaxed text-slate-400">{event.text}</p>
          <p className="text-[0.68rem] uppercase tracking-[0.14em] text-slate-500">{describeEffects(event.effects)}</p>
          <NeonButton variant="primary" full iconRight="ArrowRight" onClick={advance}>
            Continue to Decision
          </NeonButton>
        </div>
      )}

      {state.phase === 'decision' && decision && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-100">{decision.title}</h3>
          <p className="text-xs leading-relaxed text-slate-400">{decision.prompt}</p>
          {state.decision?.resolved && chosen ? (
            <>
              <p className="rounded-lg border border-emerald-400/25 bg-emerald-500/5 p-2 text-xs text-emerald-200">
                Resolved: {chosen.label}
              </p>
              <NeonButton variant="success" full iconRight="ArrowRight" onClick={advance}>
                Continue to Action Phase
              </NeonButton>
            </>
          ) : (
            <NeonButton variant="gold" full icon="HelpCircle" onClick={() => navigate('story')}>
              Open the decision
            </NeonButton>
          )}
        </div>
      )}

      {state.phase === 'action' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2 rounded-lg border border-white/5 bg-black/25 p-2.5">
            <div>
              <p className="text-[0.62rem] uppercase tracking-[0.18em] text-slate-500">Acting now</p>
              <p className="text-sm font-semibold text-slate-100">{player?.id ?? 'No survivor'}</p>
            </div>
            <div className="flex items-center gap-1" aria-label={`${state.ap} action points remaining`}>
              {Array.from({ length: Math.max(AP_PER_ROUND, state.ap) }, (_, index) => (
                <span
                  key={index}
                  className={cx(
                    'h-2.5 w-6 rounded-sm',
                    index < state.ap ? 'bg-sky-400 shadow-[0_0_10px_#38bdf8aa]' : 'bg-slate-700',
                  )}
                />
              ))}
            </div>
          </div>
          <p className="text-xs text-slate-400">
            Select a location on the map, then choose an action. Each action costs 1 AP.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <NeonButton size="sm" icon="Map" onClick={() => navigate('board')}>
              City map
            </NeonButton>
            <NeonButton size="sm" icon="Users" onClick={() => navigate('dashboard')}>
              Survivors
            </NeonButton>
          </div>
          <NeonButton variant="gold" full icon="Flag" onClick={endPlayerTurn}>
            {state.activePlayer === state.players.length - 1 ? 'End Turn — Resolve Round' : 'End Turn'}
          </NeonButton>
        </div>
      )}

      {state.phase === 'mystery' && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-100">Evidence review</h3>
          {state.phaseNotes.length > 0 ? (
            <ul className="space-y-1.5">
              {state.phaseNotes.map((note) => (
                <li
                  key={note}
                  className="flex items-start gap-2 rounded-lg border border-violet-400/20 bg-violet-500/5 p-2 text-xs text-violet-200"
                >
                  <Icon name="Search" size={13} className="mt-0.5 shrink-0" />
                  {note}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-400">
              Investigation progress is below every clue threshold. Explore and investigate more locations.
            </p>
          )}
          <NeonButton variant="primary" full iconRight="ArrowRight" onClick={advance}>
            Continue to Survival
          </NeonButton>
        </div>
      )}

      {state.phase === 'survival' && state.lastSurvival && (
        <div className="space-y-2 text-xs text-slate-300">
          <h3 className="text-sm font-semibold text-slate-100">Survival report</h3>
          <ul className="space-y-1">
            <li>Consumed: {state.lastSurvival.consumed.food} Food · {state.lastSurvival.consumed.water} Water · {state.lastSurvival.consumed.energy} Energy</li>
            <li className={state.lastSurvival.shortfalls.food > 0 ? 'text-rose-300' : 'text-slate-400'}>
              Food shortfall: {state.lastSurvival.shortfalls.food}
            </li>
            <li className={state.lastSurvival.shortfalls.water > 0 ? 'text-rose-300' : 'text-slate-400'}>
              Water shortfall: {state.lastSurvival.shortfalls.water}
            </li>
            <li className={state.lastSurvival.shortfalls.energy > 0 ? 'text-rose-300' : 'text-slate-400'}>
              Energy shortfall: {state.lastSurvival.shortfalls.energy}
            </li>
            <li className={state.lastSurvival.trustDelta < 0 ? 'text-rose-300' : 'text-slate-400'}>
              Trust change: {state.lastSurvival.trustDelta > 0 ? '+' : ''}
              {state.lastSurvival.trustDelta}
            </li>
          </ul>
          <NeonButton variant="primary" full iconRight="ArrowRight" onClick={advance}>
            {state.round >= 8 ? 'See the ending' : 'Begin next round'}
          </NeonButton>
        </div>
      )}

      {state.phase === 'complete' && (
        <div className="space-y-2">
          <p className="text-sm text-slate-300">The campaign has ended. Your report is ready.</p>
          <NeonButton variant="primary" full icon="Trophy" onClick={() => navigate('ending')}>
            View ending
          </NeonButton>
        </div>
      )}

      <div aria-live="polite" className="sr-only">
        {PHASE_LABELS[state.phase]} in round {state.round}
      </div>

      <p className="text-[0.62rem] uppercase tracking-[0.16em] text-slate-600">
        {state.clueIds.length > 0
          ? `Latest clue: ${CLUE_MAP[state.clueIds[state.clueIds.length - 1]]?.title ?? '—'}`
          : 'No evidence recovered yet'}
      </p>
    </Panel>
  )
}
