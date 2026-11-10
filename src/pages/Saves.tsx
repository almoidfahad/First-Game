import { useEffect, useRef, useState } from 'react'
import { PageShell } from '../components/PageShell'
import { Badge, Icon, Modal, NeonButton, Panel, cx } from '../components/ui'
import { manualSlotIds } from '../services/saves'
import { useGameStore } from '../store/useGameStore'

type PendingAction = { slotId: string; action: 'overwrite' | 'delete'; label: string }

export default function Saves() {
  const saves = useGameStore((store) => store.saves)
  const state = useGameStore((store) => store.state)
  const refreshSaves = useGameStore((store) => store.refreshSaves)
  const saveToSlot = useGameStore((store) => store.saveToSlot)
  const removeSlot = useGameStore((store) => store.removeSlot)
  const loadGame = useGameStore((store) => store.loadGame)
  const exportCurrent = useGameStore((store) => store.exportCurrent)
  const importFile = useGameStore((store) => store.importFile)
  const [name, setName] = useState('')
  const [pending, setPending] = useState<PendingAction | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    void refreshSaves()
  }, [refreshSaves])

  const slots = manualSlotIds()
  const autosave = saves.find((save) => save.id === 'autosave')

  const slotName = (index: number) => name.trim() || `Campaign ${index + 1}`

  const handleSave = (slotId: string, index: number) => {
    const existing = saves.find((save) => save.id === slotId)
    if (existing) {
      setPending({ slotId, action: 'overwrite', label: slotName(index) })
      return
    }
    void saveToSlot(slotId, slotName(index))
  }

  const confirm = () => {
    if (!pending) return
    if (pending.action === 'delete') void removeSlot(pending.slotId)
    else void saveToSlot(pending.slotId, pending.label)
    setPending(null)
  }

  const renderSlot = (slotId: string, label: string, recordIndex: number) => {
    const record = saves.find((save) => save.id === slotId)
    return (
      <article key={slotId} className="panel-tight flex flex-col gap-2 border border-white/10 bg-black/20 p-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[0.6rem] uppercase tracking-[0.2em] text-slate-500">{label}</p>
            <p className="text-sm font-semibold text-slate-100">{record ? record.name : 'Empty slot'}</p>
          </div>
          <Badge tone={record ? 'good' : 'neutral'}>{record ? 'Saved' : 'Empty'}</Badge>
        </div>
        {record ? (
          <p className="text-[0.68rem] leading-relaxed text-slate-400">
            Round {record.round} · {record.players}P · {record.difficulty}
            <br />
            {new Date(record.updatedAt).toLocaleString()}
          </p>
        ) : (
          <p className="text-[0.68rem] text-slate-500">No campaign stored here yet.</p>
        )}
        <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
          <NeonButton size="sm" icon="Play" disabled={!record} onClick={() => void loadGame(slotId)}>
            Load
          </NeonButton>
          <NeonButton size="sm" icon="Save" disabled={!state} onClick={() => handleSave(slotId, recordIndex)}>
            {record ? 'Overwrite' : 'Save here'}
          </NeonButton>
          <NeonButton
            size="sm"
            variant="danger"
            icon="Trash2"
            disabled={!record}
            onClick={() => setPending({ slotId, action: 'delete', label })}
          >
            Delete
          </NeonButton>
        </div>
      </article>
    )
  }

  return (
    <PageShell
      eyebrow="Persistence"
      title="Save slots"
      description="One autosave plus five manual slots, stored in IndexedDB on this device. Saves carry a schema version and are migrated automatically."
      wide
      actions={
        <div className="flex flex-wrap gap-2">
          <NeonButton icon="Download" onClick={exportCurrent} disabled={!state}>
            Export current
          </NeonButton>
          <NeonButton icon="Upload" onClick={() => fileRef.current?.click()}>
            Import file
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
        </div>
      }
    >
      <div className="mb-4">
        <label className="block text-[0.62rem] uppercase tracking-[0.2em] text-slate-500" htmlFor="save-name">
          Save name (optional)
        </label>
        <input
          id="save-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Campaign name"
          maxLength={48}
          className="mt-1 w-full max-w-sm rounded-lg border border-white/10 bg-[#081321] px-3 py-2 text-sm text-slate-200 outline-none focus:border-sky-400/60"
        />
      </div>

      <Panel eyebrow="System slot" title="Autosave" className="mb-4" bodyClassName="p-3">
        {autosave ? (
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-sky-400/30 bg-sky-500/10 text-sky-300">
              <Icon name="Clock" size={16} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-100">{autosave.name}</p>
              <p className="text-[0.68rem] text-slate-500">
                Round {autosave.round} · {autosave.players}P · {autosave.difficulty} ·{' '}
                {new Date(autosave.updatedAt).toLocaleString()}
              </p>
            </div>
            <NeonButton size="sm" icon="Play" onClick={() => void loadGame('autosave')}>
              Load autosave
            </NeonButton>
            <NeonButton
              size="sm"
              variant="danger"
              icon="Trash2"
              onClick={() => setPending({ slotId: 'autosave', action: 'delete', label: 'Autosave' })}
            >
              Clear
            </NeonButton>
          </div>
        ) : (
          <p className="text-sm text-slate-500">The autosave is written after every action once a campaign starts.</p>
        )}
      </Panel>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {slots.map((slotId, index) => renderSlot(slotId, `Slot ${index + 1}`, index))}
      </div>

      <p className={cx('mt-4 flex items-center gap-2 text-xs', state ? 'text-slate-500' : 'text-amber-300')}>
        <Icon name={state ? 'Info' : 'AlertTriangle'} size={14} />
        {state
          ? 'Saving to an occupied slot asks for confirmation before replacing it.'
          : 'No campaign is running. Start or load a campaign before writing a manual slot.'}
      </p>

      <Modal
        open={Boolean(pending)}
        onClose={() => setPending(null)}
        title={pending?.action === 'delete' ? 'Delete this save?' : 'Overwrite this slot?'}
        subtitle={pending ? pending.label : undefined}
        footer={
          <>
            <NeonButton onClick={() => setPending(null)}>Cancel</NeonButton>
            <NeonButton variant="danger" icon={pending?.action === 'delete' ? 'Trash2' : 'Save'} onClick={confirm}>
              {pending?.action === 'delete' ? 'Delete save' : 'Overwrite'}
            </NeonButton>
          </>
        }
      >
        <p className="text-sm text-slate-300">
          {pending?.action === 'delete'
            ? 'This removes the stored campaign from IndexedDB. It cannot be undone unless you exported a JSON backup.'
            : 'The existing record in this slot is replaced by the current campaign state.'}
        </p>
      </Modal>
    </PageShell>
  )
}
