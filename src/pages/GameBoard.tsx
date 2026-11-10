import { CityMap } from '../components/CityMap'
import { GameShell } from '../components/GameShell'
import { LocationPanel } from '../components/LocationPanel'
import { LogFeed } from '../components/LogFeed'
import { PhaseCard } from '../components/PhaseCard'
import { CharacterArt } from '../components/CharacterArt'
import { Dataset } from '../components/Dataset'
import { Icon, NeonButton, Panel, StatBar } from '../components/ui'
import { AP_PER_ROUND } from '../engine/config'
import { useGameStore } from '../store/useGameStore'

export default function GameBoard() {
  const state = useGameStore((store) => store.state)
  const selectLocation = useGameStore((store) => store.selectLocation)
  const navigate = useGameStore((store) => store.navigate)
  if (!state) return <GameShell active="board">{null}</GameShell>

  const player = state.players[state.activePlayer]

  return (
    <GameShell active="board">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_370px]">
        <div className="space-y-4">
          <CityMap state={state} onSelect={selectLocation} />

          {state.selectedLocation ? (
            <LocationPanel locationId={state.selectedLocation} />
          ) : (
            <Panel eyebrow="Field orders" title="Select a location on the map">
              <p className="text-sm text-slate-400">
                Twelve sites hold the resources, infrastructure and evidence you need. Choose one to see its actions,
                then spend action points before ending the round.
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-[0.62rem] uppercase tracking-[0.16em] text-slate-500">
                <span className="chip">Investigate → clues</span>
                <span className="chip">Repair → infrastructure</span>
                <span className="chip">Gather → supplies</span>
                <span className="chip">Help → trust</span>
              </div>
            </Panel>
          )}

          <Panel eyebrow="Active survivor" title={player ? player.id : 'No active survivor'}>
            {player ? (
              <div className="flex flex-wrap items-center gap-4">
                <CharacterArt characterId={player.characterId} size="md" />
                <div className="min-w-[190px] flex-1 space-y-2">
                  <StatBar label="Health" value={player.health} max={player.maxHealth} color="#ef4444" icon="HeartPulse" />
                  <div className="flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.16em] text-slate-400">
                    <Icon name="Zap" size={13} className="text-sky-300" />
                    Action points
                    <span className="font-semibold text-slate-200">
                      {state.ap}/{AP_PER_ROUND}
                    </span>
                  </div>
                </div>
                <NeonButton icon="Users" onClick={() => navigate('dashboard')}>
                  Dossier
                </NeonButton>
              </div>
            ) : null}
          </Panel>
        </div>

        <div className="space-y-4">
          <PhaseCard />
          <Dataset state={state} />
          <LogFeed limit={7} />
        </div>
      </div>
    </GameShell>
  )
}
