import { PageShell } from '../components/PageShell'
import { Badge, Icon, KeyValue, NeonButton, Panel } from '../components/ui'
import { ENDING_CATALOG } from '../engine/ending'
import { ACTION_META } from '../engine/actions'
import {
  AP_PER_ROUND,
  DIFFICULTY_SETTINGS,
  PHASE_BRIEFS,
  PHASE_LABELS,
  PHASE_ORDER,
  RESOURCE_KEYS,
  RESOURCE_META,
  TOTAL_ROUNDS,
} from '../engine/config'
import { LOCATIONS } from '../data/locations'
import { printReport } from '../services/report'
import type { ResourceKey } from '../types/game'

const ACTION_ENTRIES = Object.entries(ACTION_META) as Array<
  [string, { label: string; description: string; icon: string }]
>

const RESOURCE_NOTES: Record<ResourceKey, string> = {
  food: 'Gathered at the Mall, School or House. Every survivor eats each round.',
  water: 'Drawn at the Waterworks or School. A night without water costs health.',
  energy: 'Spent by repairs and the grid. The Power Plant can restore it.',
  trust: 'The city’s willingness to follow you. Help actions and fair decisions raise it.',
}

export default function Rules() {
  return (
    <PageShell
      eyebrow="Field manual"
      title="How to survive"
      description={`Shadow City is played over ${TOTAL_ROUNDS} rounds and five phases per round. Everything below is enforced by the engine, not just suggested.`}
      actions={
        <div className="flex flex-wrap gap-2">
          <NeonButton icon="Printer" size="sm" onClick={() => printReport('rules')}>
            Print rules
          </NeonButton>
          <NeonButton icon="FileText" size="sm" onClick={() => printReport('characters')}>
            Character sheets
          </NeonButton>
          <NeonButton icon="Package" size="sm" onClick={() => printReport('cards')}>
            Card collection
          </NeonButton>
        </div>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <Panel eyebrow="Objective" title="Keep the city alive and learn the truth">
            <p className="text-sm leading-relaxed text-slate-300">
              You are the last coordinating group in a city that has lost its grid, its supply lines and its trust.
              Each round you will face an event, make one hard decision, spend action points across the map, review
              evidence and survive the night. The campaign ends after {TOTAL_ROUNDS} rounds — or earlier if every
              survivor is lost.
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {[
                ['Survive', 'Keep every survivor on their feet and the infrastructure above collapse.'],
                ['Investigate', 'Recover three clues at the scenario lead locations to learn the hidden truth.'],
                ['Decide', 'Choices are permanent and shift resources, health, trust and the grid.'],
              ].map(([title, body]) => (
                <div key={title} className="rounded-lg border border-white/5 bg-black/20 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-200">{title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-400">{body}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel eyebrow="Round structure" title={`${PHASE_ORDER.length} phases · ${AP_PER_ROUND} AP per survivor`}>
            <ol className="space-y-2">
              {PHASE_ORDER.filter((phase) => phase !== 'complete').map((phase, index) => (
                <li key={phase} className="flex gap-3 rounded-lg border border-white/5 bg-black/20 p-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-sky-400/40 bg-sky-500/10 text-xs font-bold text-sky-200">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-100">{PHASE_LABELS[phase]}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-400">{PHASE_BRIEFS[phase]}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-3 text-xs text-slate-500">
              In multiplayer every survivor acts in seat order inside the action phase, then the round resolves.
              Pass-and-play is protected by a privacy gate between turns.
            </p>
          </Panel>

          <Panel eyebrow="Actions" title="What a survivor can do">
            <ul className="space-y-2">
              {ACTION_ENTRIES.map(([kind, meta]) => (
                <li key={kind} className="flex items-start gap-2 border-b border-white/5 pb-2 last:border-0 last:pb-0">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-white/10 text-slate-300">
                    <Icon name={meta.icon} size={14} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-100">{meta.label}</p>
                    <p className="text-xs leading-relaxed text-slate-400">{meta.description}</p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-slate-500">
              Each action costs 1 AP. Location bonuses (documented on every site) apply on top of the base rules.
            </p>
          </Panel>

          <Panel eyebrow="Resources" title="The four city reserves">
            <div className="space-y-2">
              {RESOURCE_KEYS.map((resource) => {
                const meta = RESOURCE_META[resource]
                return (
                  <div key={resource} className="flex items-start gap-2 rounded-lg border border-white/5 bg-black/20 p-2.5">
                    <Icon name={meta.icon} size={16} style={{ color: meta.accent }} className="mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-slate-200">
                        {meta.label} <span className="text-xs text-slate-500">cap {meta.cap}</span>
                      </p>
                      <p className="text-xs leading-relaxed text-slate-400">{RESOURCE_NOTES[resource]}</p>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="mt-3 rounded-lg border border-amber-400/20 bg-amber-500/5 p-3 text-xs leading-relaxed text-amber-100/80">
              Every round consumes 1 Food, 1 Water and 1 Energy. A shortfall damages survivor health and trust and can
              shut a district down. Food or water at zero is a slow collapse.
            </div>
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel eyebrow="Difficulty" title="Three pressures">
            {(['easy', 'normal', 'hard'] as const).map((key) => (
              <div key={key} className="border-b border-white/5 py-2 last:border-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-100">{DIFFICULTY_SETTINGS[key].label}</p>
                  <Badge>{key}</Badge>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">{DIFFICULTY_SETTINGS[key].blurb}</p>
                <p className="mt-1 font-mono text-[0.62rem] text-slate-500">
                  start {DIFFICULTY_SETTINGS[key].start.food}/{DIFFICULTY_SETTINGS[key].start.water}/
                  {DIFFICULTY_SETTINGS[key].start.energy}/{DIFFICULTY_SETTINGS[key].start.trust} · bright score{' '}
                  {DIFFICULTY_SETTINGS[key].brightThreshold}+
                </p>
              </div>
            ))}
          </Panel>

          <Panel eyebrow="Map" title={`${LOCATIONS.length} locations`}>
            <ul className="max-h-72 space-y-1.5 overflow-y-auto pr-1">
              {LOCATIONS.map((location) => (
                <li key={location.id} className="flex items-start gap-2">
                  <Icon name={location.icon} size={13} style={{ color: location.accent }} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-slate-200">{location.name}</p>
                    <p className="text-[0.66rem] leading-snug text-slate-500">{location.unique}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel eyebrow="Endgame" title="Three possible endings">
            <div className="space-y-2">
              {ENDING_CATALOG.map((ending) => (
                <div key={ending.key} className="rounded-lg border p-2.5" style={{ borderColor: `${ending.accent}44` }}>
                  <p className="text-sm font-semibold" style={{ color: ending.accent }}>
                    {ending.title}
                  </p>
                  <p className="text-[0.66rem] uppercase tracking-[0.14em] text-slate-500">{ending.subtitle}</p>
                  <p className="mt-1 text-[0.68rem] leading-relaxed text-slate-400">{ending.requirement}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel eyebrow="Saves & offline" title="Nothing leaves this device">
            <KeyValue label="Autosave" value="After every action" />
            <KeyValue label="Manual slots" value="5" />
            <KeyValue label="Storage" value="IndexedDB" />
            <KeyValue label="Schema" value="v1, migrated on load" />
            <KeyValue label="Network" value="Not required after first load" />
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              A corrupt save is quarantined rather than loaded. Export a JSON backup from Settings before clearing
              browser data.
            </p>
          </Panel>

          <Panel eyebrow="Support" title="If something looks wrong">
            <p className="text-xs leading-relaxed text-slate-400">
              The chronicle records every engine decision with a round number. If an action is refused, the button's
              tooltip and the toast both name the reason. Save data can be inspected with the export button; it is
              plain JSON.
            </p>
          </Panel>
        </div>
      </div>
    </PageShell>
  )
}
