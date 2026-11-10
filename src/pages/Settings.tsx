import { useRef, useState } from 'react'
import { CONTENT_STATS } from '../data'
import { PageShell } from '../components/PageShell'
import { Badge, Icon, Modal, NeonButton, Panel, Slider, Toggle, cx } from '../components/ui'
import { isStandalone, isUpdateReady, promptInstall } from '../services/pwa'
import { printReport } from '../services/report'
import { useGameStore } from '../store/useGameStore'
import { useSettingsStore } from '../store/useSettingsStore'

export default function Settings() {
  const settings = useSettingsStore()
  const state = useGameStore((store) => store.state)
  const saves = useGameStore((store) => store.saves)
  const navigate = useGameStore((store) => store.navigate)
  const exportCurrent = useGameStore((store) => store.exportCurrent)
  const importFile = useGameStore((store) => store.importFile)
  const toastMessage = useGameStore((store) => store.toastMessage)
  const [resetOpen, setResetOpen] = useState(false)
  const [installNote, setInstallNote] = useState(() =>
    isStandalone() ? 'Shadow City is already installed on this device.' : '',
  )
  const fileRef = useRef<HTMLInputElement>(null)

  const install = async () => {
    const outcome = await promptInstall()
    if (outcome === 'accepted') setInstallNote('Installed. The game will now launch offline from your home screen.')
    else if (outcome === 'dismissed') setInstallNote('Install dismissed. You can try again from your browser menu.')
    else
      setInstallNote(
        'Use your browser menu → “Install app” (or “Add to Home Screen”) to install. Desktop Chrome or Edge is required for the one-click prompt.',
      )
  }

  return (
    <PageShell
      eyebrow="Configuration"
      title="Settings"
      description="Audio, display and accessibility preferences are stored on this device and apply immediately."
      actions={
        <div className="flex flex-wrap gap-2">
          <NeonButton icon="Printer" onClick={() => printReport('rules')} size="sm">
            Print rules
          </NeonButton>
          <NeonButton icon="Save" onClick={() => navigate('saves')} size="sm">
            Save slots
          </NeonButton>
        </div>
      }
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel eyebrow="Audio" title="Sound design" subtitle="All audio is synthesised locally; nothing is streamed.">
          <Slider
            label="Music volume"
            value={settings.musicVolume}
            onChange={settings.setMusicVolume}
            format={(value) => `${Math.round(value * 100)}%`}
          />
          <Slider
            label="Effects volume"
            value={settings.sfxVolume}
            onChange={settings.setSfxVolume}
            format={(value) => `${Math.round(value * 100)}%`}
          />
          <Toggle
            label="Mute everything"
            description="Silences music and interface cues."
            checked={settings.muted}
            onChange={settings.setMuted}
          />
          <div className="mt-2 flex items-center gap-2 rounded-lg border border-white/5 bg-black/20 p-2.5 text-xs text-slate-400">
            <Icon name={settings.muted ? 'VolumeX' : 'Volume2'} size={15} className="text-sky-300" />
            Ambience begins after your first interaction, as browsers require a user gesture for audio.
          </div>
        </Panel>

        <Panel eyebrow="Display" title="Presentation">
          <Toggle
            label="Reduce motion"
            description="Removes transitions, glows and ambient animation."
            checked={settings.reduceMotion}
            onChange={settings.setReduceMotion}
          />
          <Toggle
            label="High contrast"
            description="Stronger borders and brighter text for low-vision play."
            checked={settings.highContrast}
            onChange={settings.setHighContrast}
          />
          <Slider
            label="Text size"
            value={settings.textScale}
            min={0.9}
            max={1.25}
            step={0.05}
            onChange={settings.setTextScale}
            format={(value) => `${Math.round(value * 100)}%`}
          />
          <div className="mt-2">
            <p className="text-sm text-slate-200">Language</p>
            <select
              value={settings.language}
              disabled
              aria-label="Language"
              className="mt-1 w-full rounded-lg border border-white/10 bg-[#081321] px-3 py-2 text-sm text-slate-400"
            >
              <option value="en">English (shipped)</option>
            </select>
            <p className="mt-1 text-[0.68rem] text-slate-500">The copy layer is locale-ready; only English ships in v1.0.</p>
          </div>
        </Panel>

        <Panel eyebrow="Offline & install" title="Progressive web app">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-400/30 bg-emerald-500/10 text-emerald-300">
              <Icon name="Cpu" size={18} />
            </span>
            <div className="flex-1">
              <p className="text-sm text-slate-200">Works without a network</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                Every card, portrait and sound is bundled. The service worker precaches the app shell and assets after
                the first load, so a refresh offline still reaches the menu.
              </p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <NeonButton icon="Download" onClick={() => void install()}>
              Install app
            </NeonButton>
            <Badge tone={isStandalone() ? 'good' : 'neutral'}>{isStandalone() ? 'Installed' : 'Browser tab'}</Badge>
            {isUpdateReady() && <Badge tone="warn">Update available — reload to apply</Badge>}
          </div>
          {installNote && <p className="mt-2 text-xs leading-relaxed text-sky-200/80">{installNote}</p>}
        </Panel>

        <Panel eyebrow="Data" title="Local saves and reports">
          <div className="space-y-1 text-sm text-slate-400">
            <p>
              {saves.length} save record{saves.length === 1 ? '' : 's'} on this device ·{' '}
              {state ? `current campaign round ${state.round}` : 'no campaign running'}
            </p>
            <p className="text-xs">
              Saves live in IndexedDB. Export a JSON backup before clearing browser storage or moving devices.
            </p>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <NeonButton icon="Download" size="sm" disabled={!state} onClick={exportCurrent}>
              Export current save
            </NeonButton>
            <NeonButton icon="Upload" size="sm" onClick={() => fileRef.current?.click()}>
              Import save
            </NeonButton>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) void importFile(file)
                event.target.value = ''
              }}
            />
            <NeonButton icon="FileText" size="sm" onClick={() => printReport('characters')}>
              Character sheets
            </NeonButton>
            <NeonButton icon="Package" size="sm" onClick={() => printReport('cards')}>
              Card collection
            </NeonButton>
            <NeonButton icon="Trash2" size="sm" variant="danger" onClick={() => setResetOpen(true)}>
              Reset settings
            </NeonButton>
          </div>
        </Panel>

        <Panel eyebrow="Content" title="Build inventory">
          <div className="grid grid-cols-2 gap-2 text-center sm:grid-cols-3">
            {[
              ['Characters', CONTENT_STATS.characters],
              ['Locations', CONTENT_STATS.locations],
              ['Events', CONTENT_STATS.events],
              ['Clues', CONTENT_STATS.mysteries],
              ['Decisions', CONTENT_STATS.decisions],
              ['Missions', CONTENT_STATS.missions],
              ['Items', CONTENT_STATS.items],
              ['Scenarios', CONTENT_STATS.scenarios],
              ['Cards', CONTENT_STATS.totalCards],
            ].map(([label, value]) => (
              <div key={String(label)} className="rounded-lg border border-white/5 bg-black/20 p-2">
                <p className="text-base font-bold text-slate-100">{value}</p>
                <p className="text-[0.55rem] uppercase tracking-[0.14em] text-slate-500">{label}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Shadow City v1.0 · offline build · no telemetry, no accounts, no network calls during play.
          </p>
        </Panel>

        <Panel eyebrow="Accessibility" title="How the interface helps">
          <ul className="space-y-2 text-sm text-slate-300">
            {[
              'Every control is a real button or labelled input, reachable by keyboard.',
              'The skip link jumps straight to the current screen content.',
              'Dialogs trap attention visually, close on Escape and announce their titles.',
              'Status changes are announced through polite live regions.',
              'Text scales up to 125%, and reduced motion respects the OS preference as well.',
              'Colour is never the only signal: integrity, locks and alerts also carry icons and text.',
            ].map((line) => (
              <li key={line} className="flex items-start gap-2">
                <Icon name="Check" size={14} className="mt-0.5 shrink-0 text-emerald-300" />
                {line}
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-[0.62rem] uppercase tracking-[0.18em] text-slate-600">
        <span className={cx('flex items-center gap-1.5')}>
          <Icon name="Moon" size={12} /> Settings persist across reloads
        </span>
        <span>Version 1.0 · Offline mode</span>
      </div>

      <Modal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title="Reset settings?"
        subtitle="Audio, display and accessibility preferences return to their defaults."
        footer={
          <>
            <NeonButton onClick={() => setResetOpen(false)}>Cancel</NeonButton>
            <NeonButton
              variant="danger"
              icon="RotateCcw"
              onClick={() => {
                settings.reset()
                setResetOpen(false)
                toastMessage('Settings restored to defaults.', 'good')
              }}
            >
              Reset settings
            </NeonButton>
          </>
        }
      >
        <p className="text-sm text-slate-300">
          Save files and campaigns are not affected — this only resets preferences stored in this browser.
        </p>
      </Modal>
    </PageShell>
  )
}
