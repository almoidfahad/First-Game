import { useEffect, useState } from 'react'
import { CharacterArt } from '../components/CharacterArt'
import { GameShell } from '../components/GameShell'
import { Badge, Icon, NeonButton, Panel, StatBar, cx } from '../components/ui'
import { ITEM_MAP } from '../data/cards/items'
import { MISSION_MAP } from '../data/cards/missions'
import { getCharacter } from '../data/characters'
import { AP_PER_ROUND, PHASE_LABELS, RESOURCE_KEYS, RESOURCE_META } from '../engine/config'
import { useGameStore } from '../store/useGameStore'
import { describeEffects } from '../utils/describe'

export default function Dashboard() {
  const state = useGameStore((store) => store.state)
  const useItemOn = useGameStore((store) => store.useItemOn)
  const navigate = useGameStore((store) => store.navigate)
  const [selected, setSelected] = useState(0)
  const [revealed, setRevealed] = useState<string[]>([])

  useEffect(() => {
    if (!state) return
    setSelected((current) => Math.min(current, state.players.length - 1))
  }, [state])

  if (!state) return <GameShell active="dashboard">{null}</GameShell>

  const player = state.players[selected] ?? state.players[0]
  const character = getCharacter(player.characterId)
  const mission = player.missionId ? MISSION_MAP[player.missionId] : undefined
  const isActive = selected === state.activePlayer
  const showMission = state.mode === 'solo' || state.players.length === 1 || revealed.includes(player.id) || isActive
  const inventory = Object.entries(player.inventory).filter(([, count]) => count > 0)

  return (
    <GameShell active="dashboard">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {state.players.map((entry, index) => {
          const entryCharacter = getCharacter(entry.characterId)
          return (
            <button
              key={entry.id}
              type="button"
              onClick={() => setSelected(index)}
              aria-pressed={index === selected}
              className={cx(
                'flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-left transition',
                index === selected
                  ? 'border-sky-400/60 bg-sky-500/10'
                  : 'border-white/10 bg-white/[0.02] hover:border-sky-400/30',
                entry.health <= 0 && 'opacity-50',
              )}
            >
              <CharacterArt characterId={entry.characterId} size="sm" className="h-8 w-8" />
              <span>
                <span className="block text-xs font-semibold text-slate-100">{entry.id}</span>
                <span className="block text-[0.6rem] uppercase tracking-[0.14em] text-slate-500">
                  {entryCharacter.title}
                </span>
              </span>
              {index === state.activePlayer && <Badge tone="good">Active</Badge>}
            </button>
          )
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <Panel eyebrow={character.title} title={character.name} subtitle={`Seat ${player.seat + 1} · ${PHASE_LABELS[state.phase]}`}>
            <div className="flex flex-col gap-4 sm:flex-row">
              <CharacterArt characterId={player.characterId} size="lg" />
              <div className="flex-1 space-y-3">
                <p className="text-sm leading-relaxed text-slate-300">{character.biography}</p>
                <StatBar label="Health" value={player.health} max={player.maxHealth} color="#ef4444" icon="HeartPulse" />
                <div className="flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.16em] text-slate-400">
                  <Icon name="Zap" size={13} className="text-sky-300" />
                  Action points
                  <span className="font-semibold text-slate-200">
                    {isActive ? `${state.ap}/${AP_PER_ROUND}` : 'not this turn'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg border border-emerald-400/20 bg-emerald-500/5 p-2">
                    <p className="text-[0.58rem] uppercase tracking-[0.18em] text-emerald-300/80">Strength</p>
                    <p className="mt-0.5 text-xs text-slate-300">{character.strength}</p>
                  </div>
                  <div className="rounded-lg border border-rose-400/20 bg-rose-500/5 p-2">
                    <p className="text-[0.58rem] uppercase tracking-[0.18em] text-rose-300/80">Weakness</p>
                    <p className="mt-0.5 text-xs text-slate-300">{character.weakness}</p>
                  </div>
                </div>
              </div>
            </div>
          </Panel>

          <Panel eyebrow="Attributes" title="Operator profile">
            <div className="grid gap-3 sm:grid-cols-2">
              <StatBar label="Force" value={character.attributes.force} max={5} color="#f97316" />
              <StatBar label="Wits" value={character.attributes.wits} max={5} color="#38bdf8" />
              <StatBar label="Empathy" value={character.attributes.empathy} max={5} color="#a78bfa" />
              <StatBar label="Resilience" value={character.attributes.resilience} max={5} color="#22c55e" />
            </div>
            <div className="mt-4 rounded-lg border border-sky-400/20 bg-sky-500/5 p-3">
              <p className="flex items-center gap-1.5 text-[0.6rem] uppercase tracking-[0.2em] text-sky-300/90">
                <Icon name="Sparkles" size={12} /> {character.ability.name}
              </p>
              <p className="mt-1 text-sm text-slate-300">{character.ability.description}</p>
            </div>
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel
            eyebrow="Secret mission"
            title={mission ? mission.title : 'No mission'}
            actions={
              !showMission ? (
                <NeonButton size="sm" icon="Eye" onClick={() => setRevealed((current) => [...current, player.id])}>
                  Reveal
                </NeonButton>
              ) : undefined
            }
          >
            {mission ? (
              showMission ? (
                <div className="space-y-2">
                  <p className="text-sm text-slate-300">{mission.briefing}</p>
                  <div className="text-[0.62rem] uppercase tracking-[0.16em] text-slate-400">
                    Objective: {mission.objective.kind}
                    {mission.objective.locationId ? ` at ${mission.objective.locationId}` : ''} × {mission.objective.target}
                  </div>
                  <StatBar
                    label="Progress"
                    value={player.missionProgress}
                    max={mission.objective.target}
                    color="#f97316"
                    icon="Target"
                  />
                  <p className="text-xs text-slate-400">Reward: {describeEffects(mission.reward)}</p>
                  {player.missionComplete && <Badge tone="good">Mission complete</Badge>}
                </div>
              ) : (
                <p className="flex items-center gap-2 text-sm text-slate-400">
                  <Icon name="EyeOff" size={15} /> Hidden. Pass the device to {player.id} and reveal to read this
                  briefing.
                </p>
              )
            ) : (
              <p className="text-sm text-slate-400">No mission assigned.</p>
            )}
          </Panel>

          <Panel eyebrow="Inventory" title={`${inventory.length} item stack(s)`}>
            {inventory.length === 0 ? (
              <p className="text-sm text-slate-500">Empty. Explore the city to scavenge equipment.</p>
            ) : (
              <ul className="space-y-2">
                {inventory.map(([itemId, count]) => {
                  const item = ITEM_MAP[itemId]
                  if (!item) return null
                  return (
                    <li key={itemId} className="flex items-start gap-2 rounded-lg border border-white/5 bg-black/20 p-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-md border border-sky-400/25 bg-sky-500/10 text-sky-300">
                        <Icon name="Package" size={14} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-medium text-slate-200">{item.title}</span>
                          <span className="text-[0.62rem] text-slate-500">×{count}</span>
                        </span>
                        <span className="block text-[0.68rem] leading-snug text-slate-400">{item.description}</span>
                      </span>
                      <NeonButton
                        size="sm"
                        onClick={() => useItemOn(itemId)}
                        disabled={!isActive || state.phase === 'complete'}
                        title={!isActive ? 'Only the active survivor can use items.' : 'Use item'}
                      >
                        Use
                      </NeonButton>
                    </li>
                  )
                })}
              </ul>
            )}
          </Panel>

          <Panel eyebrow="City reserves" title="Shared resources">
            <div className="grid grid-cols-2 gap-3">
              {RESOURCE_KEYS.map((resource) => {
                const meta = RESOURCE_META[resource]
                return (
                  <div key={resource} className="rounded-lg border border-white/5 bg-black/20 p-2.5">
                    <p className="flex items-center gap-1.5 text-[0.6rem] uppercase tracking-[0.16em] text-slate-400">
                      <Icon name={meta.icon} size={12} style={{ color: meta.accent }} />
                      {meta.label}
                    </p>
                    <p className="mt-1 text-xl font-bold text-slate-100">
                      {state.resources[resource]}
                      <span className="text-xs font-normal text-slate-500">/{meta.cap}</span>
                    </p>
                  </div>
                )
              })}
            </div>
            <NeonButton full icon="Map" className="mt-3" onClick={() => navigate('board')}>
              Back to the city
            </NeonButton>
          </Panel>
        </div>
      </div>
    </GameShell>
  )
}
