import { AnimatePresence, motion } from 'framer-motion'
import { getCharacter } from '../data/characters'
import { MISSION_MAP } from '../data/cards/missions'
import { useGameStore } from '../store/useGameStore'
import { CharacterArt } from './CharacterArt'
import { Icon, NeonButton } from './ui'

/**
 * Local multiplayer is pass-and-play, so every turn starts behind a full-screen
 * gate. It reveals only the next player's identity, never the previous player's
 * hand, mission or resources.
 */
export function PrivacyGate() {
  const state = useGameStore((store) => store.state)
  const seat = useGameStore((store) => store.privacySeat)
  const acknowledge = useGameStore((store) => store.acknowledgePrivacy)

  const open = Boolean(state && seat !== null && state.mode === 'local' && state.players.length > 1)
  const player = state && seat !== null ? state.players[seat] : undefined

  return (
    <AnimatePresence>
      {open && player && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="privacy-title"
        >
          <div className="absolute inset-0 bg-[#02040a]/97 backdrop-blur-xl" />
          <motion.div
            className="panel relative w-full max-w-md overflow-hidden p-6 text-center"
            initial={{ scale: 0.96, y: 16 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <p className="eyebrow">Pass the device</p>
            <h2 id="privacy-title" className="display-title mt-2 text-3xl text-slate-100">
              Hand over to {player.id}
            </h2>
            <p className="mx-auto mt-2 max-w-xs text-sm text-slate-400">
              Secret missions and resources are hidden while the device changes hands. Only the named player should
              look at this screen.
            </p>

            <div className="mt-5 flex items-center justify-center">
              <CharacterArt characterId={player.characterId} size="lg" />
            </div>

            <div className="mt-4 space-y-1">
              <p className="text-lg font-semibold text-slate-100">{getCharacter(player.characterId).name}</p>
              <p className="text-[0.68rem] uppercase tracking-[0.2em] text-sky-300/80">
                {getCharacter(player.characterId).title}
              </p>
            </div>

            <div className="mt-4 rounded-lg border border-violet-400/20 bg-violet-500/5 p-3 text-left text-xs text-violet-200">
              <p className="flex items-center gap-1.5 font-semibold uppercase tracking-[0.14em]">
                <Icon name="EyeOff" size={13} /> Secret mission waiting
              </p>
              <p className="mt-1 text-violet-200/80">
                {player.missionId ? 'Your briefing is available on the Survivors screen once you confirm.' : 'No briefing assigned.'}
              </p>
              {player.missionId && MISSION_MAP[player.missionId] && (
                <p className="mt-1 text-violet-200/60">
                  Objective type: {MISSION_MAP[player.missionId].objective.kind.toUpperCase()} ×{' '}
                  {MISSION_MAP[player.missionId].objective.target}
                </p>
              )}
            </div>

            <NeonButton variant="primary" size="lg" full icon="Eye" className="mt-5" onClick={acknowledge}>
              I am {player.id} — reveal my turn
            </NeonButton>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
