import { ENDING_CATALOG } from '../engine/ending'
import { getScenario } from '../data/scenarios'
import { PHASE_LABELS, TOTAL_ROUNDS } from '../engine/config'
import { printReport } from '../services/report'
import { useGameStore } from '../store/useGameStore'
import { Badge, Icon, NeonButton, Panel, Ring, StatBar, cx } from '../components/ui'
import { CharacterArt } from '../components/CharacterArt'

export default function Ending() {
  const state = useGameStore((store) => store.state)
  const navigate = useGameStore((store) => store.navigate)
  const exportCurrent = useGameStore((store) => store.exportCurrent)

  if (!state || !state.ending) {
    return (
      <div className="relative z-10 mx-auto flex min-h-screen max-w-2xl items-center px-4">
        <Panel eyebrow="Ending" title="No completed campaign">
          <p className="text-sm text-slate-400">
            Finish a campaign — or reach a collapse — to unlock the end-game report.
          </p>
          <div className="mt-4 flex gap-2">
            <NeonButton variant="primary" icon="Play" onClick={() => navigate('new-game')}>
              New campaign
            </NeonButton>
            <NeonButton icon="ChevronLeft" onClick={() => navigate('menu')}>
              Main menu
            </NeonButton>
          </div>
        </Panel>
      </div>
    )
  }

  const ending = state.ending
  const scenario = getScenario(state.scenarioId)
  const achieved = ending.key

  return (
    <div className="relative z-10 mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <main id="main">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Game ending · {scenario.codename}</p>
            <h1 className="display-title mt-1 text-4xl text-slate-50 sm:text-5xl">{ending.title}</h1>
            <p className="mt-2 text-sm uppercase tracking-[0.24em] text-slate-400">{ending.subtitle}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={achieved === 'bright' ? 'good' : achieved === 'broken' ? 'warn' : 'bad'}>
              Round {ending.achievedAtRound} of {TOTAL_ROUNDS}
            </Badge>
            <Badge tone="mystery">
              {ending.cluesFound}/{ending.cluesTotal} clues
            </Badge>
            <NeonButton icon="Printer" onClick={() => printReport('report', state)}>
              View report
            </NeonButton>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <Panel eyebrow="Final score" title="City outcome">
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <Ring value={ending.score} color={achieved === 'dark' ? '#ef4444' : achieved === 'broken' ? '#fbbf24' : '#22c55e'} label="score" />
              <div className="flex-1 space-y-2">
                {ending.breakdown.map((line) => (
                  <StatBar
                    key={line.label}
                    label={`${line.label} — ${line.value}`}
                    value={line.points}
                    max={line.max}
                    color={achieved === 'dark' ? '#ef4444' : '#38bdf8'}
                  />
                ))}
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-300">{ending.summary}</p>
          </Panel>

          <Panel eyebrow="Survivors" title="What it cost">
            <ul className="space-y-2">
              {state.players.map((player) => (
                <li key={player.id} className="flex items-center gap-2 rounded-lg border border-white/5 bg-black/20 p-2">
                  <CharacterArt characterId={player.characterId} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-slate-200">{player.id}</span>
                    <span className="block text-[0.66rem] text-slate-500">
                      Health {player.health}/{player.maxHealth} · Mission{' '}
                      {player.missionComplete ? 'complete' : `${player.missionProgress} progress`}
                    </span>
                  </span>
                  <Badge tone={player.health > 0 ? 'good' : 'bad'}>{player.health > 0 ? 'Alive' : 'Lost'}</Badge>
                </li>
              ))}
            </ul>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-400">
              <span className="chip">Food {state.resources.food}</span>
              <span className="chip">Water {state.resources.water}</span>
              <span className="chip">Energy {state.resources.energy}</span>
              <span className="chip">Trust {state.resources.trust}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <NeonButton icon="Download" size="sm" onClick={exportCurrent}>
                Export save
              </NeonButton>
              <NeonButton icon="FileText" size="sm" onClick={() => printReport('campaign', state)}>
                Campaign summary
              </NeonButton>
            </div>
          </Panel>
        </div>

        <h2 className="eyebrow mt-8 mb-3">All three endings</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {ENDING_CATALOG.map((entry) => {
            const isAchieved = entry.key === achieved
            return (
              <article
                key={entry.key}
                className={cx(
                  'panel relative overflow-hidden p-4 transition',
                  isAchieved ? 'ring-1' : 'opacity-70',
                )}
                style={isAchieved ? { borderColor: `${entry.accent}88`, boxShadow: `0 0 34px -18px ${entry.accent}` } : undefined}
              >
                {isAchieved && (
                  <span
                    className="absolute right-3 top-3 rounded-full px-2 py-0.5 text-[0.55rem] font-bold uppercase tracking-[0.18em]"
                    style={{ background: `${entry.accent}22`, color: entry.accent }}
                  >
                    Achieved
                  </span>
                )}
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-lg border"
                  style={{ borderColor: `${entry.accent}55`, color: entry.accent, background: `${entry.accent}12` }}
                >
                  <Icon name={entry.key === 'bright' ? 'Trophy' : entry.key === 'broken' ? 'Flag' : 'Skull'} size={18} />
                </span>
                <h3 className="mt-3 display-title text-xl" style={{ color: entry.accent }}>
                  {entry.title}
                </h3>
                <p className="text-[0.66rem] uppercase tracking-[0.16em] text-slate-500">{entry.subtitle}</p>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">{entry.summary}</p>
                <p className="mt-2 border-t border-white/5 pt-2 text-[0.62rem] uppercase tracking-[0.12em] text-slate-500">
                  {entry.requirement}
                </p>
              </article>
            )
          })}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <NeonButton variant="primary" size="lg" icon="Play" onClick={() => navigate('new-game')}>
            New campaign
          </NeonButton>
          <NeonButton size="lg" icon="RotateCcw" onClick={() => navigate('menu')}>
            Main menu
          </NeonButton>
          <NeonButton size="lg" icon="Package" onClick={() => navigate('library')}>
            Card library
          </NeonButton>
          <span className="ml-auto text-[0.62rem] uppercase tracking-[0.2em] text-slate-600">
            {PHASE_LABELS.complete} · seed {state.seed.slice(0, 10)}
          </span>
        </div>
      </main>
    </div>
  )
}
