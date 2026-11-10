import type { ReactNode } from 'react'
import { PHASE_LABELS } from '../engine/config'
import { useGameStore } from '../store/useGameStore'
import type { ScreenId } from '../types/game'
import { Hud } from './Hud'
import { Icon, NeonButton, Panel } from './ui'

const TABS: { id: ScreenId; label: string; icon: string; short: string }[] = [
  { id: 'board', label: 'City Board', icon: 'Map', short: 'City' },
  { id: 'dashboard', label: 'Survivors', icon: 'Users', short: 'Team' },
  { id: 'story', label: 'Story & Mystery', icon: 'FileText', short: 'Story' },
]

export function GameShell({ active, children }: { active: ScreenId; children: ReactNode }) {
  const state = useGameStore((store) => store.state)
  const navigate = useGameStore((store) => store.navigate)

  if (!state) {
    return (
      <div className="relative z-10 mx-auto flex min-h-screen max-w-2xl items-center px-4">
        <Panel eyebrow="No campaign" title="Nothing is running yet" className="w-full">
          <p className="text-sm text-slate-400">
            Start a new campaign, or continue from your autosave to return to the city.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <NeonButton variant="primary" icon="Play" onClick={() => navigate('new-game')}>
              New campaign
            </NeonButton>
            <NeonButton icon="RotateCcw" onClick={() => navigate('menu')}>
              Main menu
            </NeonButton>
          </div>
        </Panel>
      </div>
    )
  }

  const pendingDecision = state.phase === 'decision' && !state.decision?.resolved

  return (
    <div className="relative z-10 flex min-h-screen flex-col">
      <Hud />
      <nav
        aria-label="Game sections"
        className="sticky top-[52px] z-20 border-b border-white/5 bg-[#040810]/80 backdrop-blur sm:top-[56px]"
      >
        <div className="mx-auto flex w-full max-w-7xl gap-1 px-2 sm:px-4">
          {TABS.map((tab) => {
            const isActive = active === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => navigate(tab.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`relative flex flex-1 items-center justify-center gap-2 border-b-2 px-2 py-2.5 text-[0.68rem] font-semibold uppercase tracking-[0.16em] transition sm:flex-none sm:px-5 ${
                  isActive
                    ? 'border-sky-400 text-sky-200'
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                <Icon name={tab.icon} size={14} />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.short}</span>
                {tab.id === 'story' && pendingDecision && (
                  <span className="absolute right-1 top-1.5 h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
                )}
              </button>
            )
          })}
          <span className="ml-auto hidden items-center gap-2 pr-1 text-[0.62rem] uppercase tracking-[0.18em] text-slate-600 md:flex">
            {PHASE_LABELS[state.phase]}
          </span>
        </div>
      </nav>
      <main id="main" className="mx-auto w-full max-w-7xl flex-1 px-3 py-4 sm:px-5 sm:py-5">
        {children}
      </main>
      <footer className="mx-auto w-full max-w-7xl px-4 pb-4 pt-2 text-center text-[0.6rem] uppercase tracking-[0.22em] text-slate-600">
        Offline session · seed {state.seed.slice(0, 8)} · autosave active
      </footer>
    </div>
  )
}
