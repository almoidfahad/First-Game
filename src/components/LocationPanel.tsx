import { useState } from 'react'
import { ACTION_META, canPerformAction } from '../engine/actions'
import { AP_PER_ROUND, MAX_INTEGRITY, RESOURCE_META } from '../engine/config'
import { MISSION_MAP } from '../data/cards/missions'
import { LOCATION_MAP } from '../data/locations'
import { useGameStore } from '../store/useGameStore'
import type { ActionKind, LocationId, ResourceKey } from '../types/game'
import { Icon, NeonButton, Panel, cx } from './ui'

const TRADEABLE: ResourceKey[] = ['food', 'water', 'energy']

export function LocationPanel({ locationId }: { locationId: LocationId }) {
  const state = useGameStore((store) => store.state)
  const act = useGameStore((store) => store.act)
  const openExploration = useGameStore((store) => store.openExploration)
  const endPlayerTurn = useGameStore((store) => store.endPlayerTurn)
  const [helpResource, setHelpResource] = useState<'food' | 'water'>('food')
  const [tradeFrom, setTradeFrom] = useState<ResourceKey>('food')
  const [tradeTo, setTradeTo] = useState<ResourceKey>('water')

  if (!state) return null
  const location = LOCATION_MAP[locationId]
  const player = state.players[state.activePlayer]
  const locked = !state.unlocked.includes(locationId)
  const integrity = state.infrastructure[locationId] ?? 0
  const mission = player?.missionId ? MISSION_MAP[player.missionId] : undefined

  const request = { helpResource, trade: { from: tradeFrom, to: tradeTo } }

  const run = (kind: ActionKind) => {
    act({ kind, locationId, helpResource, trade: { from: tradeFrom, to: tradeTo } })
  }

  return (
    <Panel
      eyebrow={location.tagline}
      title={location.name}
      subtitle={locked ? 'Sealed — investigate the city to open this site.' : `${integrity} of ${MAX_INTEGRITY} integrity`}
      actions={
        <span className="chip border-sky-400/30 text-sky-200">
          <Icon name="Zap" size={12} /> {state.ap}/{AP_PER_ROUND} AP
        </span>
      }
    >
      <div className="space-y-3">
        {locked && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-400/25 bg-amber-500/5 p-3 text-sm text-amber-200">
            <Icon name="Lock" size={16} className="mt-0.5 shrink-0" />
            <p>
              {location.name} is still sealed.
              {location.unlock.clues ? ` Recover ${location.unlock.clues} clue(s)` : ''}
              {location.unlock.round ? ` and reach round ${location.unlock.round}` : ''} to open it.
            </p>
          </div>
        )}

        <p className="text-sm text-slate-300">{location.description}</p>
        <p className="flex items-start gap-2 rounded-lg border border-sky-400/15 bg-sky-500/5 p-2.5 text-xs text-sky-200/90">
          <Icon name="Sparkles" size={14} className="mt-0.5 shrink-0" />
          {location.unique}
        </p>

        {!locked && (
          <NeonButton
            variant="primary"
            full
            icon="Play"
            onClick={() => openExploration(locationId)}
          >
            Enter real-time exploration · free
          </NeonButton>
        )}

        <div className="grid grid-cols-3 gap-1" aria-label={`Integrity ${integrity} of 3`}>
          {[0, 1, 2].map((index) => (
            <span
              key={index}
              className={cx(
                'h-1.5 rounded-full',
                index < integrity ? 'bg-sky-400' : 'bg-slate-700',
              )}
              style={index < integrity ? { boxShadow: '0 0 10px rgba(56,189,248,0.6)' } : undefined}
            />
          ))}
        </div>

        {player && (
          <div className="rounded-lg border border-white/5 bg-black/25 p-2.5 text-xs text-slate-400">
            <span className="text-slate-300">{player.id}</span> · Health {player.health}/{player.maxHealth}
            {mission && ` · Mission: ${mission.title} (${player.missionProgress}/${mission.objective.target})`}
          </div>
        )}

        {locationId === 'mall' || locationId === 'school' ? (
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="uppercase tracking-[0.16em]">Help with</span>
            {(['food', 'water'] as const).map((resource) => (
              <button
                key={resource}
                type="button"
                onClick={() => setHelpResource(resource)}
                aria-pressed={helpResource === resource}
                className={cx(
                  'inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[0.65rem] uppercase tracking-[0.12em]',
                  helpResource === resource
                    ? 'border-sky-400/60 bg-sky-500/15 text-sky-200'
                    : 'border-white/10 text-slate-400',
                )}
              >
                <Icon name={RESOURCE_META[resource].icon} size={12} />
                {resource}
              </button>
            ))}
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-2">
          {location.actions.map((kind) => {
            const reason = canPerformAction(state, kind, locationId, request)
            const meta = ACTION_META[kind]
            return (
              <NeonButton
                key={kind}
                variant={kind === 'investigate' ? 'primary' : 'secondary'}
                size="sm"
                icon={meta.icon}
                onClick={() => run(kind)}
                disabled={Boolean(reason)}
                title={reason ?? meta.description}
                className="justify-start"
              >
                {meta.label}
              </NeonButton>
            )
          })}
        </div>
        <p className="text-[0.68rem] leading-relaxed text-slate-500">
          Actions cost 1 AP. Investigate to advance clues; repair to restore the grid; gather to keep the city fed.
        </p>

        {location.actions.includes('trade') && (
        <div className="rounded-lg border border-white/5 bg-black/20 p-2.5">
          <p className="mb-2 text-[0.62rem] uppercase tracking-[0.18em] text-slate-500">Exchange — 2 → 1</p>
          <div className="flex flex-wrap items-center gap-1.5">
            <select
              aria-label="Resource to give"
              value={tradeFrom}
              onChange={(event) => setTradeFrom(event.target.value as ResourceKey)}
              className="rounded-md border border-white/10 bg-[#0a1524] px-2 py-1.5 text-xs text-slate-200"
            >
              {TRADEABLE.map((key) => (
                <option key={key} value={key}>
                  {RESOURCE_META[key].label}
                </option>
              ))}
            </select>
            <Icon name="ArrowLeftRight" size={14} className="text-slate-500" />
            <select
              aria-label="Resource to receive"
              value={tradeTo}
              onChange={(event) => setTradeTo(event.target.value as ResourceKey)}
              className="rounded-md border border-white/10 bg-[#0a1524] px-2 py-1.5 text-xs text-slate-200"
            >
              {TRADEABLE.map((key) => (
                <option key={key} value={key}>
                  {RESOURCE_META[key].label}
                </option>
              ))}
            </select>
            <NeonButton
              size="sm"
              icon="ArrowRight"
              onClick={() => run('trade')}
              disabled={Boolean(canPerformAction(state, 'trade', locationId, request))}
            >
              Trade
            </NeonButton>
          </div>
        </div>
        )}

        <NeonButton
          variant="gold"
          size="lg"
          full
          icon="Flag"
          onClick={endPlayerTurn}
          disabled={state.phase !== 'action'}
        >
          {state.activePlayer === state.players.length - 1 ? 'End Turn — Resolve Round' : 'End Turn'}
        </NeonButton>
      </div>
    </Panel>
  )
}
