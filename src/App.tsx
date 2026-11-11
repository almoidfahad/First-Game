import { useEffect, type ReactElement } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { PrivacyGate } from './components/PrivacyGate'
import { Toast } from './components/Toast'
import { Icon } from './components/ui'
import CardLibrary from './pages/CardLibrary'
import Dashboard from './pages/Dashboard'
import Ending from './pages/Ending'
import GameBoard from './pages/GameBoard'
import MainMenu from './pages/MainMenu'
import NewGame from './pages/NewGame'
import Rules from './pages/Rules'
import Saves from './pages/Saves'
import Settings from './pages/Settings'
import Story from './pages/Story'
import { audio } from './services/audio'
import { useGameStore } from './store/useGameStore'
import { prefersReducedMotion, useSettingsStore } from './store/useSettingsStore'
import type { ScreenId } from './types/game'

const SCREENS: Record<ScreenId, () => ReactElement> = {
  menu: MainMenu,
  'new-game': NewGame,
  board: GameBoard,
  dashboard: Dashboard,
  story: Story,
  ending: Ending,
  library: CardLibrary,
  settings: Settings,
  rules: Rules,
  saves: Saves,
}

function BootScreen() {
  return (
    <div className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-sky-400/30 bg-sky-500/10 text-sky-300 shadow-[0_0_50px_-12px_rgba(56,189,248,0.8)]">
        <Icon name="Moon" size={28} />
      </span>
      <h1 className="display-title text-2xl text-slate-100">Shadow City</h1>
      <p className="flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.28em] text-slate-500">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sky-400" />
        Restoring local data
      </p>
    </div>
  )
}

export default function App() {
  const hydrated = useGameStore((store) => store.hydrated)
  const screen = useGameStore((store) => store.screen)
  const init = useGameStore((store) => store.init)
  const settings = useSettingsStore()

  useEffect(() => {
    void init()
  }, [init])

  // Preferences are applied to the document rather than a wrapper so they also
  // affect portals, dialogs and the print stylesheet.
  useEffect(() => {
    const root = document.documentElement
    root.dataset.contrast = settings.highContrast ? 'high' : 'normal'
    root.dataset.motion = settings.reduceMotion ? 'reduced' : 'full'
    root.style.fontSize = `${Math.round(16 * settings.textScale)}px`
  }, [settings.highContrast, settings.reduceMotion, settings.textScale])

  useEffect(() => {
    audio.configure({
      musicVolume: settings.musicVolume,
      sfxVolume: settings.sfxVolume,
      ambientVolume: settings.ambientVolume,
      muted: settings.muted,
    })
  }, [settings.musicVolume, settings.sfxVolume, settings.ambientVolume, settings.muted])

  useEffect(() => {
    const unlock = () => {
      audio.unlock()
      if (!settings.muted) audio.startAmbient()
    }
    window.addEventListener('pointerdown', unlock, { once: true })
    window.addEventListener('keydown', unlock, { once: true })
    return () => {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
    }
  }, [settings.muted])

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) audio.stopAmbient()
      else if (!settings.muted) audio.startAmbient()
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [settings.muted])

  const Current = SCREENS[screen]
  const reduce = settings.reduceMotion || prefersReducedMotion()

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      {hydrated ? (
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={screen}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.18 }}
          >
            <Current />
          </motion.div>
        </AnimatePresence>
      ) : (
        <BootScreen />
      )}
      <Toast />
      <PrivacyGate />
    </>
  )
}
