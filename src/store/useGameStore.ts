import { create } from 'zustand'
import {
  advancePhase,
  chooseDecision,
  createGame,
  endTurn,
  playAction,
  setSelectedLocation,
  useItem,
} from '../engine/game'
import type { ActionRequest } from '../engine/actions'
import { validateContent } from '../data/validate'
import type {
  GameMode,
  GameState,
  LocationId,
  NewGameConfig,
  SaveSummary,
  ScreenId,
} from '../types/game'
import {
  autosave,
  deleteSave,
  exportSaveJson,
  listSaveSummaries,
  readSave,
  writeSave,
  buildRecord,
  importSaveFile,
} from '../services/saves'
import { audio } from '../services/audio'

interface Toast {
  id: number
  message: string
  tone: 'info' | 'good' | 'bad'
}

interface GameStore {
  hydrated: boolean
  state: GameState | null
  screen: ScreenId
  saves: SaveSummary[]
  toast: Toast | null
  privacySeat: number | null
  intentMode: GameMode | null
  bootError: string | null
  init: () => Promise<void>
  navigate: (screen: ScreenId) => void
  setIntentMode: (mode: GameMode | null) => void
  startNewGame: (config: NewGameConfig) => Promise<void>
  loadGame: (slotId: string) => Promise<void>
  continueGame: () => Promise<void>
  act: (request: ActionRequest) => void
  choose: (optionId: string) => void
  advance: () => void
  endPlayerTurn: () => void
  useItemOn: (itemId: string) => void
  selectLocation: (locationId: LocationId | null) => void
  saveToSlot: (slotId: string, name: string) => Promise<void>
  removeSlot: (slotId: string) => Promise<void>
  refreshSaves: () => Promise<void>
  acknowledgePrivacy: () => void
  quitToMenu: () => void
  exportCurrent: () => void
  importFile: (file: File) => Promise<void>
  dismissToast: () => void
  toastMessage: (message: string, tone?: Toast['tone']) => void
}

let toastId = 0
const contentProblems = validateContent()

function shouldGatePrivacy(state: GameState | null): boolean {
  if (!state) return false
  return state.mode !== 'solo' && state.players.length > 1 && state.phase === 'action'
}

export const useGameStore = create<GameStore>()((set, get) => {
  const commit = (next: GameState, options: { autosave?: boolean } = {}) => {
    set({ state: next })
    if (next.ending && get().screen !== 'ending') set({ screen: 'ending', privacySeat: null })
    if (next.ending) audio.stinger(next.ending.key === 'dark' ? 'defeat' : 'victory')
    if (options.autosave !== false) {
      void autosave(next).catch(() => {
        get().toastMessage('Autosave failed — storage may be full.', 'bad')
      })
    }
  }

  const applyResult = (result: { ok: boolean; state: GameState; error?: string }) => {
    if (!result.ok) {
      if (result.error) get().toastMessage(result.error, 'bad')
      audio.play('error')
      return
    }
    audio.play('confirm')
    commit(result.state)
    const state = result.state
    if (shouldGatePrivacy(state)) set({ privacySeat: state.activePlayer })
  }

  return {
    hydrated: false,
    state: null,
    screen: 'menu',
    saves: [],
    toast: null,
    privacySeat: null,
    intentMode: null,
    bootError: contentProblems.length > 0 ? contentProblems.join('; ') : null,

    init: async () => {
      const saves = await listSaveSummaries()
      set({ hydrated: true, saves })
    },

    navigate: (screen) => {
      audio.play('click')
      set({ screen })
    },

    setIntentMode: (mode) => set({ intentMode: mode }),

    startNewGame: async (config) => {
      const state = createGame(config)
      commit(state, { autosave: true })
      set({
        screen: 'board',
        privacySeat: shouldGatePrivacy(state) ? 0 : null,
      })
      await get().refreshSaves()
      audio.play('confirm')
    },

    loadGame: async (slotId) => {
      const result = await readSave(slotId)
      if (!result.ok || !result.value) {
        get().toastMessage(result.errors[0] ?? 'Unable to load that save.', 'bad')
        await get().refreshSaves()
        return
      }
      const state = result.value.state
      set({
        state,
        screen: state.ending ? 'ending' : 'board',
        privacySeat: shouldGatePrivacy(state) ? state.activePlayer : null,
      })
      audio.play('confirm')
    },

    continueGame: async () => {
      const saves = await listSaveSummaries()
      if (saves.length === 0) {
        get().toastMessage('No saved campaign yet. Start a new one.', 'info')
        return
      }
      const autos = saves.find((save) => save.id === 'autosave')
      await get().loadGame(autos?.id ?? saves[0].id)
    },

    act: (request) => {
      const state = get().state
      if (!state) return
      applyResult(playAction(state, request))
    },

    choose: (optionId) => {
      const state = get().state
      if (!state) return
      applyResult(chooseDecision(state, optionId))
    },

    advance: () => {
      const state = get().state
      if (!state) return
      const result = advancePhase(state)
      if (result.ok) {
        commit(result.state)
        audio.stinger(result.state.phase === 'survival' ? 'alert' : 'click')
        if (result.state.phase === 'action' && result.state.players.length > 1) {
          set({ privacySeat: result.state.activePlayer })
        }
      } else {
        get().toastMessage(result.error ?? 'Cannot advance.', 'bad')
      }
    },

    endPlayerTurn: () => {
      const state = get().state
      if (!state) return
      const result = endTurn(state)
      if (!result.ok) {
        get().toastMessage(result.error ?? 'Cannot end the turn.', 'bad')
        return
      }
      audio.play('click')
      commit(result.state)
      if (shouldGatePrivacy(result.state)) set({ privacySeat: result.state.activePlayer })
    },

    useItemOn: (itemId) => {
      const state = get().state
      if (!state) return
      applyResult(useItem(state, itemId))
    },

    selectLocation: (locationId) => {
      const state = get().state
      if (!state) return
      const next = setSelectedLocation(state, locationId)
      set({ state: next })
    },

    saveToSlot: async (slotId, name) => {
      const state = get().state
      if (!state) return
      try {
        await writeSave(slotId, name, state)
        await get().refreshSaves()
        get().toastMessage('Campaign saved.', 'good')
      } catch {
        get().toastMessage('Could not write that save slot.', 'bad')
      }
    },

    removeSlot: async (slotId) => {
      try {
        await deleteSave(slotId)
        await get().refreshSaves()
        get().toastMessage('Save slot cleared.', 'info')
      } catch {
        get().toastMessage('Could not delete that slot.', 'bad')
      }
    },

    refreshSaves: async () => {
      set({ saves: await listSaveSummaries() })
    },

    acknowledgePrivacy: () => set({ privacySeat: null }),

    quitToMenu: () => {
      set({ screen: 'menu', privacySeat: null })
      void get().refreshSaves()
    },

    exportCurrent: () => {
      const state = get().state
      if (!state) return
      exportSaveJson(buildRecord('export', 'Exported campaign', state))
      get().toastMessage('Save exported to your downloads.', 'good')
    },

    importFile: async (file) => {
      const result = await importSaveFile(file)
      if (!result.ok) {
        get().toastMessage(result.errors[0] ?? 'Import failed.', 'bad')
        return
      }
      await get().refreshSaves()
      get().toastMessage('Save imported.', 'good')
    },

    dismissToast: () => set({ toast: null }),

    toastMessage: (message, tone = 'info') => {
      toastId += 1
      set({ toast: { id: toastId, message, tone } })
      window.setTimeout(() => {
        if (get().toast?.id === toastId) set({ toast: null })
      }, 4200)
    },
  }
})
