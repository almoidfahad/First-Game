import { getCharacter } from '../data/characters'
import type { CharacterId } from '../types/game'
import { cx, Icon } from './ui'

const SIZES = {
  sm: { box: 'h-12 w-12', glyph: 18, ring: 'ring-1' },
  md: { box: 'h-24 w-24', glyph: 30, ring: 'ring-1' },
  lg: { box: 'h-40 w-40', glyph: 46, ring: 'ring-2' },
} as const

/**
 * Portraits are generated from each character's palette and sigil, so the game
 * ships with premium-looking art without bundling photographs or remote assets.
 */
export function CharacterArt({
  characterId,
  size = 'md',
  className,
  muted,
}: {
  characterId: CharacterId
  size?: keyof typeof SIZES
  className?: string
  muted?: boolean
}) {
  const character = getCharacter(characterId)
  const accent = character.portrait.accent
  const spec = SIZES[size]

  return (
    <div
      className={cx('relative shrink-0 overflow-hidden rounded-xl border', spec.box, className)}
      style={{
        borderColor: `${accent}55`,
        background: `radial-gradient(120% 100% at 30% 0%, ${accent}33 0%, rgba(6,12,22,0.95) 60%, #050a12 100%)`,
        opacity: muted ? 0.55 : 1,
      }}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `repeating-linear-gradient(115deg, ${accent}22 0px, ${accent}22 1px, transparent 1px, transparent 9px)`,
        }}
      />
      <svg viewBox="0 0 100 120" className="absolute inset-x-0 bottom-0 h-[86%] w-full" preserveAspectRatio="xMidYMax meet">
        <defs>
          <linearGradient id={`sil-${character.id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity="0.5" />
            <stop offset="100%" stopColor="#04070d" stopOpacity="0.95" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="42" r="19" fill={`url(#sil-${character.id})`} />
        <path
          d="M14 120 C16 88 30 74 50 74 C70 74 84 88 86 120 Z"
          fill={`url(#sil-${character.id})`}
          stroke={`${accent}44`}
          strokeWidth="1"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center pb-6" style={{ color: accent }}>
        <Icon name={character.portrait.glyph} size={spec.glyph} strokeWidth={1.6} />
      </div>
      <div
        className="absolute bottom-0 left-0 right-0 h-1"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
      />
    </div>
  )
}
